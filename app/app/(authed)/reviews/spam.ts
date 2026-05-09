/**
 * Spam-suspect heuristic for the reviews moderation queue.
 *
 * Per Bright Lights contract Section 2.2 we owe the tenant moderation
 * of the public-facing reviews stream. v1 is a pure-string heuristic —
 * good enough to surface the Andrew-Collins-style "boost-my-rank"
 * promo bots, the crypto-signal gibberish, and the all-caps SHOUTERS
 * that turn up in any 5-star Google profile.
 *
 * Used in two places:
 *   - addReview(): pre-flags the row with status='spam' so it lands in
 *     the moderation queue instead of the published feed.
 *   - the Recent Reviews table: marks rows that pass the heuristic at
 *     display time (so a borderline row that slipped through still
 *     gets a "suspect" badge in the UI).
 *
 * False positives are explicitly OK — the operator can one-click
 * "mark as legit" and the row moves back to published. False negatives
 * (real spam slipping through) are the worse failure mode, since the
 * 171-star public profile is Bright Lights' #1 lead source.
 */

const SPAM_TRIGGER_WORDS = /\b(subscribe|promo|discount|crypto|investment|free|rank|seo|bitcoin|telegram|whatsapp|forex|loan|airdrop)\b/i;
const URL_PATTERN = /https?:\/\//i;
const MIN_BODY_LENGTH = 15;
const MAX_UPPERCASE_RATIO = 0.7;

export function isSpamSuspect(body: string, reviewerName: string): boolean {
  const text = (body ?? "").trim();
  if (text.length < MIN_BODY_LENGTH) return true;

  if (URL_PATTERN.test(text)) return true;

  // Uppercase ratio over alphabetic chars only — punctuation and digits
  // shouldn't pull a normal review over the threshold.
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 0) {
    const upperCount = letters.replace(/[^A-Z]/g, "").length;
    if (upperCount / letters.length > MAX_UPPERCASE_RATIO) return true;
  }

  if (SPAM_TRIGGER_WORDS.test(text)) return true;

  // Reviewer-name signal — single-word handles like "RankFasterNow" with
  // embedded promo tokens are a tell that the body alone might miss.
  const name = (reviewerName ?? "").trim();
  if (name.length > 0 && SPAM_TRIGGER_WORDS.test(name)) return true;

  return false;
}

export function spamReason(body: string, reviewerName: string): string | null {
  const text = (body ?? "").trim();
  if (text.length < MIN_BODY_LENGTH) return "very short body";
  if (URL_PATTERN.test(text)) return "contains a URL";
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 0) {
    const upperCount = letters.replace(/[^A-Z]/g, "").length;
    if (upperCount / letters.length > MAX_UPPERCASE_RATIO) return "all caps";
  }
  if (SPAM_TRIGGER_WORDS.test(text)) return "trigger word";
  const name = (reviewerName ?? "").trim();
  if (name.length > 0 && SPAM_TRIGGER_WORDS.test(name)) {
    return "promo handle";
  }
  return null;
}
