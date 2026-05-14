/*!
 * Gladius Marketing Tracker — drop-in client snippet.
 *
 *   <script src="https://gladiusturf.com/marketing-tracker.js"
 *           data-tenant="bright-lights"
 *           defer></script>
 *
 * Captures: page_view, form_start, form_submit, phone_click,
 * email_click, cta_click (data-track="cta"), scroll_depth (25/50/75/
 * 100), exit. Batches events and flushes on page hide / unload via
 * navigator.sendBeacon (with fetch fallback).
 *
 * First-touch UTM is persisted in localStorage so attribution
 * survives subsequent page loads inside the same browser.
 *
 * No third-party deps; no cookies set client-side (the server stitches
 * sessions by hashed IP+UA inside a 30-min window).
 */
(function () {
  "use strict";

  if (typeof window === "undefined" || typeof document === "undefined") return;
  // Idempotent — don't double-bind if the snippet is included twice.
  if (window.__gladiusMktTracker) return;
  window.__gladiusMktTracker = true;

  var SCRIPT = document.currentScript ||
    (function () {
      var nodes = document.querySelectorAll("script[data-tenant]");
      return nodes[nodes.length - 1] || null;
    })();
  if (!SCRIPT) return;

  var TENANT = (SCRIPT.getAttribute("data-tenant") || "").trim().toLowerCase();
  if (!TENANT) return;

  var ENDPOINT =
    SCRIPT.getAttribute("data-endpoint") ||
    "https://gladiusturf.com/api/marketing/track";

  var BATCH = [];
  var FLUSH_AFTER_MS = 5000;
  var flushTimer = null;
  var sessionStartedAt = new Date().toISOString();

  // ---- helpers ----------------------------------------------------------

  function deviceKind() {
    var ua = navigator.userAgent || "";
    if (/bot|crawl|spider|slurp|bingpreview/i.test(ua)) return "bot";
    if (/tablet|ipad/i.test(ua)) return "tablet";
    if (/mobi|android|iphone/i.test(ua)) return "mobile";
    return "desktop";
  }

  function readFirstTouchUtm() {
    var KEYS = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ];
    var current = {};
    try {
      var sp = new URL(window.location.href).searchParams;
      KEYS.forEach(function (k) {
        var v = sp.get(k);
        if (v) current[k] = v;
      });
    } catch (e) {}

    var stored = {};
    try {
      stored = JSON.parse(
        window.localStorage.getItem("glx_first_touch_utm") || "{}",
      );
    } catch (e) {}

    if (Object.keys(current).length > 0 && Object.keys(stored).length === 0) {
      try {
        window.localStorage.setItem(
          "glx_first_touch_utm",
          JSON.stringify(current),
        );
      } catch (e) {}
      return current;
    }
    return Object.keys(stored).length > 0 ? stored : current;
  }

  function fingerprint() {
    try {
      return [
        screen.width,
        screen.height,
        navigator.language || "",
        new Date().getTimezoneOffset(),
      ].join("|");
    } catch (e) {
      return "";
    }
  }

  function emit(kind, extra) {
    BATCH.push({
      kind: kind,
      path: window.location.pathname + window.location.search,
      target: extra && extra.target ? String(extra.target).slice(0, 200) : null,
      meta: extra && extra.meta ? extra.meta : null,
      ts: new Date().toISOString(),
    });
    if (BATCH.length >= 20) flush();
    else scheduleFlush();
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = window.setTimeout(flush, FLUSH_AFTER_MS);
  }

  function flush(useBeacon) {
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (BATCH.length === 0) return;
    var payload = {
      tenantSlug: TENANT,
      fingerprint: fingerprint(),
      device: deviceKind(),
      referrer: document.referrer || null,
      utm: readFirstTouchUtm(),
      events: BATCH.splice(0, BATCH.length),
    };
    var body = JSON.stringify(payload);

    if (useBeacon && navigator.sendBeacon) {
      try {
        var blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(ENDPOINT, blob);
        return;
      } catch (e) {}
    }
    try {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
        credentials: "omit",
      }).catch(function () {});
    } catch (e) {}
  }

  // ---- listeners --------------------------------------------------------

  // 1. page_view — initial load + history changes.
  emit("page_view");
  var lastPath = window.location.pathname;
  function watchHistory() {
    function check() {
      var p = window.location.pathname;
      if (p !== lastPath) {
        lastPath = p;
        emit("page_view");
      }
    }
    var push = history.pushState;
    var replace = history.replaceState;
    history.pushState = function () {
      push.apply(this, arguments);
      check();
    };
    history.replaceState = function () {
      replace.apply(this, arguments);
      check();
    };
    window.addEventListener("popstate", check);
    window.addEventListener("hashchange", check);
  }
  try {
    watchHistory();
  } catch (e) {}

  // 2. scroll_depth — fire once per 25/50/75/100 threshold.
  var thresholdsFired = {};
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (max <= 0) return;
    var pct = Math.round((doc.scrollTop / max) * 100);
    [25, 50, 75, 100].forEach(function (t) {
      if (pct >= t && !thresholdsFired[t]) {
        thresholdsFired[t] = true;
        emit("scroll_depth", { meta: { percent: t } });
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // 3. form_start — first focus inside a form fires once per form.
  var formsStarted = new WeakSet();
  document.addEventListener(
    "focusin",
    function (e) {
      var el = e.target;
      if (!el || !el.closest) return;
      var form = el.closest("form");
      if (!form || formsStarted.has(form)) return;
      formsStarted.add(form);
      emit("form_start", {
        target: form.getAttribute("name") || form.getAttribute("id") || "form",
      });
    },
    true,
  );

  // 4. form_submit — captures HTML form submit events.
  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!form) return;
      emit("form_submit", {
        target: form.getAttribute("name") || form.getAttribute("id") || "form",
      });
      flush(false);
    },
    true,
  );

  // 5. phone_click + email_click + cta_click.
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a, button") : null;
      if (!a) return;
      var href = (a.getAttribute && a.getAttribute("href")) || "";
      var trackAttr = a.getAttribute && a.getAttribute("data-track");
      if (href.indexOf("tel:") === 0) {
        emit("phone_click", { target: href.replace(/^tel:/, "") });
      } else if (href.indexOf("mailto:") === 0) {
        emit("email_click", { target: href.replace(/^mailto:/, "") });
      } else if (trackAttr === "cta" || (a.classList && a.classList.contains("track-cta"))) {
        emit("cta_click", {
          target:
            a.getAttribute("data-cta") ||
            (a.textContent || "").trim().slice(0, 80),
        });
      }
    },
    true,
  );

  // 6. exit — flush via sendBeacon on visibility / unload.
  function exitFlush() {
    emit("exit", {
      meta: {
        timeOnPageMs:
          new Date().getTime() - new Date(sessionStartedAt).getTime(),
      },
    });
    flush(true);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") exitFlush();
  });
  window.addEventListener("pagehide", exitFlush);

  // Also expose a manual API for custom events.
  window.gladiusTrack = function (kind, target, meta) {
    if (typeof kind !== "string") return;
    emit(kind === "custom" ? "custom" : kind, { target: target, meta: meta });
  };
})();
