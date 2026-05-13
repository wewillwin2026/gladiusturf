/**
 * Bilingual outbound templates — 2026-05-13.
 *
 * Every transactional message Gladius sends to a customer routes through
 * one of these. Each returns {subject, text, html} for the channel and
 * locale ("en" | "es"). Callers (Quote Send, post-job reviews, late-
 * invoice follow-up, etc.) compose the parameter object and pass the
 * result straight to lib/messaging/email.ts or dispatch.ts.
 *
 * Why centralize: prior to today's pass, every caller did its own
 * `lang === "es" ? "Su" : "Your"` fork in-line. That meant 6 transactional
 * surfaces with 6 chances to drift apart. Routing through this module
 * means a tenant flipping a customer's preferred_language from "en" to
 * "es" instantly retargets every send across the platform.
 *
 * Fallback: any locale that isn't "es" lands in the English template.
 * Translation TODO when we add a third language: switch from string
 * literals to a real i18n source (next-intl etc.).
 */

export type Locale = "en" | "es";

export type RenderedTemplate = {
  subject: string;
  text: string;
  html: string;
};

function pickLocale(input: string | null | undefined): Locale {
  return input === "es" ? "es" : "en";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#0c0c0c">${escapeHtml(
    text,
  )}</p>`;
}

function callout(href: string, label: string): string {
  return `<p style="margin:18px 0"><a href="${href}" style="display:inline-block;padding:10px 18px;background:#c9a87a;color:#0c0c0c;text-decoration:none;font-weight:600;border-radius:999px;font-size:14px">${escapeHtml(label)}</a></p>`;
}

function htmlWrap(bodyHtml: string, footerNote: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#fafaf7;font-family:Inter,system-ui,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e3da;border-radius:12px;padding:24px">
${bodyHtml}
<hr style="border:none;border-top:1px solid #e7e3da;margin:24px 0 12px"/>
<p style="margin:0;font-size:11px;color:#6b6b6b;line-height:1.55">${escapeHtml(footerNote)}</p>
</div></body></html>`;
}

// =============================================================================
// 1. Quote share — link to the public /quote/[id] page
// =============================================================================
export function quoteShareTemplate(params: {
  locale: Locale | string | null | undefined;
  customerName: string;
  tenantName: string;
  link: string;
  quoteTitle: string;
}): RenderedTemplate {
  const lang = pickLocale(params.locale);
  const { customerName, tenantName, link, quoteTitle } = params;

  if (lang === "es") {
    const subject = `Su presupuesto de ${tenantName}`;
    const greeting = `Hola ${customerName},`;
    const body = `Le preparamos un presupuesto: ${quoteTitle}. Puede revisarlo aquí:`;
    const closing = `Si tiene preguntas, simplemente responda a este correo.\n— ${tenantName}`;
    const html = htmlWrap(
      paragraph(greeting) +
        paragraph(body) +
        callout(link, "Ver presupuesto") +
        paragraph(closing),
      `Enviado por ${tenantName} a través de Gladius. Para opciones de privacidad, responda con BAJA.`,
    );
    return {
      subject,
      text: `${greeting}\n\n${body}\n${link}\n\n${closing}`,
      html,
    };
  }

  const subject = `Your quote from ${tenantName}`;
  const greeting = `Hi ${customerName},`;
  const body = `We prepared a quote for you: ${quoteTitle}. You can review it here:`;
  const closing = `If you have questions, just reply to this email.\n— ${tenantName}`;
  const html = htmlWrap(
    paragraph(greeting) +
      paragraph(body) +
      callout(link, "View quote") +
      paragraph(closing),
    `Sent by ${tenantName} via Gladius. Reply STOP to opt out.`,
  );
  return {
    subject,
    text: `${greeting}\n\n${body}\n${link}\n\n${closing}`,
    html,
  };
}

// =============================================================================
// 2. Appointment confirmation
// =============================================================================
export function appointmentConfirmationTemplate(params: {
  locale: Locale | string | null | undefined;
  customerName: string;
  tenantName: string;
  appointmentLabel: string; // e.g. "Tue, May 14, 10:00 AM"
  serviceName: string;
}): RenderedTemplate {
  const lang = pickLocale(params.locale);
  const { customerName, tenantName, appointmentLabel, serviceName } = params;

  if (lang === "es") {
    const subject = `Confirmado: ${serviceName} el ${appointmentLabel}`;
    const greeting = `Hola ${customerName},`;
    const body = `Confirmamos su cita de ${serviceName} para el ${appointmentLabel}. Le avisaremos cuando el equipo esté en camino.`;
    const closing = `¿Necesita reprogramar? Solo responda a este correo.\n— ${tenantName}`;
    return {
      subject,
      text: `${greeting}\n\n${body}\n\n${closing}`,
      html: htmlWrap(
        paragraph(greeting) + paragraph(body) + paragraph(closing),
        `Enviado por ${tenantName} a través de Gladius.`,
      ),
    };
  }

  const subject = `Confirmed: ${serviceName} on ${appointmentLabel}`;
  const greeting = `Hi ${customerName},`;
  const body = `You're confirmed for ${serviceName} on ${appointmentLabel}. We'll text when the crew is on the way.`;
  const closing = `Need to reschedule? Just reply to this email.\n— ${tenantName}`;
  return {
    subject,
    text: `${greeting}\n\n${body}\n\n${closing}`,
    html: htmlWrap(
      paragraph(greeting) + paragraph(body) + paragraph(closing),
      `Sent by ${tenantName} via Gladius. Reply STOP to opt out.`,
    ),
  };
}

// =============================================================================
// 3. Invoice ready (Quote → invoice transition: link the public quote URL)
// =============================================================================
export function invoiceReadyTemplate(params: {
  locale: Locale | string | null | undefined;
  customerName: string;
  tenantName: string;
  totalLabel: string; // "$1,840"
  link: string;
}): RenderedTemplate {
  const lang = pickLocale(params.locale);
  const { customerName, tenantName, totalLabel, link } = params;

  if (lang === "es") {
    const subject = `Factura lista — ${totalLabel}`;
    const greeting = `Hola ${customerName},`;
    const body = `Su factura por ${totalLabel} está lista. Puede pagarla con un solo toque:`;
    const closing = `Cualquier pregunta, responda a este correo.\n— ${tenantName}`;
    return {
      subject,
      text: `${greeting}\n\n${body}\n${link}\n\n${closing}`,
      html: htmlWrap(
        paragraph(greeting) +
          paragraph(body) +
          callout(link, "Pagar factura") +
          paragraph(closing),
        `Enviado por ${tenantName} a través de Gladius.`,
      ),
    };
  }

  const subject = `Invoice ready — ${totalLabel}`;
  const greeting = `Hi ${customerName},`;
  const body = `Your invoice for ${totalLabel} is ready. One-tap pay below:`;
  const closing = `Any questions, just reply.\n— ${tenantName}`;
  return {
    subject,
    text: `${greeting}\n\n${body}\n${link}\n\n${closing}`,
    html: htmlWrap(
      paragraph(greeting) +
        paragraph(body) +
        callout(link, "Pay invoice") +
        paragraph(closing),
      `Sent by ${tenantName} via Gladius. Reply STOP to opt out.`,
    ),
  };
}

// =============================================================================
// 4. Review ask (post-job)
// =============================================================================
export function reviewAskTemplate(params: {
  locale: Locale | string | null | undefined;
  customerName: string;
  tenantName: string;
  reviewLink: string;
}): RenderedTemplate {
  const lang = pickLocale(params.locale);
  const { customerName, tenantName, reviewLink } = params;

  if (lang === "es") {
    const subject = `¿Cómo lo hicimos? — ${tenantName}`;
    const greeting = `Hola ${customerName},`;
    const body = `Esperamos que esté contento con el trabajo. Si tiene 30 segundos, una reseña honesta nos ayuda enormemente:`;
    const closing = `Gracias por confiar en nosotros.\n— ${tenantName}`;
    return {
      subject,
      text: `${greeting}\n\n${body}\n${reviewLink}\n\n${closing}`,
      html: htmlWrap(
        paragraph(greeting) +
          paragraph(body) +
          callout(reviewLink, "Dejar reseña") +
          paragraph(closing),
        `Enviado por ${tenantName}. Responder NO si prefiere no recibir solicitudes de reseña.`,
      ),
    };
  }

  const subject = `How'd we do? — ${tenantName}`;
  const greeting = `Hi ${customerName},`;
  const body = `Hope you're happy with the work. If you've got 30 seconds, an honest review goes a long way:`;
  const closing = `Thanks for trusting us.\n— ${tenantName}`;
  return {
    subject,
    text: `${greeting}\n\n${body}\n${reviewLink}\n\n${closing}`,
    html: htmlWrap(
      paragraph(greeting) +
        paragraph(body) +
        callout(reviewLink, "Leave a review") +
        paragraph(closing),
      `Sent by ${tenantName} via Gladius. Reply STOP to skip review requests.`,
    ),
  };
}

// =============================================================================
// 5. Follow-up (late invoice nudge, day 3 / day 7 / day 14 cadence)
// =============================================================================
export function followUpTemplate(params: {
  locale: Locale | string | null | undefined;
  customerName: string;
  tenantName: string;
  invoiceLabel: string; // "#2118"
  totalLabel: string; // "$1,840"
  link: string;
  warmth: "soft" | "warmer" | "final";
}): RenderedTemplate {
  const lang = pickLocale(params.locale);
  const { customerName, tenantName, invoiceLabel, totalLabel, link, warmth } =
    params;

  if (lang === "es") {
    const bodyByWarmth: Record<typeof warmth, string> = {
      soft: `Solo un recordatorio amistoso — la factura ${invoiceLabel} por ${totalLabel} sigue pendiente. Un toque y queda:`,
      warmer: `Le escribo de nuevo sobre la factura ${invoiceLabel} (${totalLabel}). ¿Todo bien? Puede pagarla aquí o responda a este correo si necesita algo:`,
      final: `Última nota antes de pasarlo a un colega — la factura ${invoiceLabel} (${totalLabel}) lleva varios días pendiente. Si hay algún problema, dígamelo:`,
    };
    const subject =
      warmth === "final"
        ? `Última nota — factura ${invoiceLabel}`
        : `Recordatorio — factura ${invoiceLabel}`;
    const greeting = `Hola ${customerName},`;
    const closing = `— ${tenantName}`;
    return {
      subject,
      text: `${greeting}\n\n${bodyByWarmth[warmth]}\n${link}\n\n${closing}`,
      html: htmlWrap(
        paragraph(greeting) +
          paragraph(bodyByWarmth[warmth]) +
          callout(link, "Pagar factura") +
          paragraph(closing),
        `Enviado por ${tenantName} a través de Gladius.`,
      ),
    };
  }

  const bodyByWarmth: Record<typeof warmth, string> = {
    soft: `Friendly nudge — invoice ${invoiceLabel} for ${totalLabel} is still outstanding. One-tap pay below:`,
    warmer: `Circling back on invoice ${invoiceLabel} (${totalLabel}). Everything OK? You can pay here or reply if you need anything:`,
    final: `Last note before I hand this to a colleague — invoice ${invoiceLabel} (${totalLabel}) has been outstanding for a while. If something's wrong, please tell me:`,
  };
  const subject =
    warmth === "final"
      ? `Last note — invoice ${invoiceLabel}`
      : `Reminder — invoice ${invoiceLabel}`;
  const greeting = `Hi ${customerName},`;
  const closing = `— ${tenantName}`;
  return {
    subject,
    text: `${greeting}\n\n${bodyByWarmth[warmth]}\n${link}\n\n${closing}`,
    html: htmlWrap(
      paragraph(greeting) +
        paragraph(bodyByWarmth[warmth]) +
        callout(link, "Pay invoice") +
        paragraph(closing),
      `Sent by ${tenantName} via Gladius. Reply STOP to opt out.`,
    ),
  };
}

// =============================================================================
// 6. No-show apology + reschedule offer
// =============================================================================
export function noShowApologyTemplate(params: {
  locale: Locale | string | null | undefined;
  customerName: string;
  tenantName: string;
  rescheduleLink?: string;
}): RenderedTemplate {
  const lang = pickLocale(params.locale);
  const { customerName, tenantName, rescheduleLink } = params;

  if (lang === "es") {
    const subject = `Disculpas — perdimos su cita`;
    const greeting = `Hola ${customerName},`;
    const body = `Lamentamos haber perdido la visita de hoy. Es nuestra responsabilidad. ¿Podemos reprogramar para esta semana?`;
    const closing = `— ${tenantName}`;
    return {
      subject,
      text: `${greeting}\n\n${body}${rescheduleLink ? `\n${rescheduleLink}` : ""}\n\n${closing}`,
      html: htmlWrap(
        paragraph(greeting) +
          paragraph(body) +
          (rescheduleLink ? callout(rescheduleLink, "Reprogramar") : "") +
          paragraph(closing),
        `Enviado por ${tenantName} a través de Gladius.`,
      ),
    };
  }

  const subject = `Apologies — we missed your appointment`;
  const greeting = `Hi ${customerName},`;
  const body = `We're sorry we missed today's visit. That's on us. Can we reschedule for this week?`;
  const closing = `— ${tenantName}`;
  return {
    subject,
    text: `${greeting}\n\n${body}${rescheduleLink ? `\n${rescheduleLink}` : ""}\n\n${closing}`,
    html: htmlWrap(
      paragraph(greeting) +
        paragraph(body) +
        (rescheduleLink ? callout(rescheduleLink, "Reschedule") : "") +
        paragraph(closing),
      `Sent by ${tenantName} via Gladius. Reply STOP to opt out.`,
    ),
  };
}

// =============================================================================
// SMS variants — short text-only versions for Twilio dispatcher
// =============================================================================

export function quoteShareSms(params: {
  locale: Locale | string | null | undefined;
  customerFirstName: string;
  tenantName: string;
  link: string;
}): string {
  const lang = pickLocale(params.locale);
  if (lang === "es") {
    return `Hola ${params.customerFirstName} — su presupuesto de ${params.tenantName}: ${params.link}`;
  }
  return `Hi ${params.customerFirstName} — your quote from ${params.tenantName}: ${params.link}`;
}

export function appointmentConfirmationSms(params: {
  locale: Locale | string | null | undefined;
  customerFirstName: string;
  appointmentLabel: string;
  serviceName: string;
  tenantName: string;
}): string {
  const lang = pickLocale(params.locale);
  if (lang === "es") {
    return `${params.tenantName}: ${params.serviceName} confirmado el ${params.appointmentLabel}. Le avisamos al salir.`;
  }
  return `${params.tenantName}: ${params.serviceName} confirmed for ${params.appointmentLabel}. We'll text on the way.`;
}

export function reviewAskSms(params: {
  locale: Locale | string | null | undefined;
  customerFirstName: string;
  tenantName: string;
  reviewLink: string;
}): string {
  const lang = pickLocale(params.locale);
  if (lang === "es") {
    return `${params.tenantName}: gracias ${params.customerFirstName}. Si tuvo 30s, una reseña honesta nos ayuda mucho — ${params.reviewLink}`;
  }
  return `${params.tenantName}: thanks ${params.customerFirstName}. If you've got 30s, an honest review helps a lot — ${params.reviewLink}`;
}

export function followUpSms(params: {
  locale: Locale | string | null | undefined;
  customerFirstName: string;
  tenantName: string;
  invoiceLabel: string;
  link: string;
  warmth: "soft" | "warmer" | "final";
}): string {
  const lang = pickLocale(params.locale);
  if (lang === "es") {
    if (params.warmth === "final") {
      return `${params.tenantName}: ${params.customerFirstName}, última nota sobre ${params.invoiceLabel}. Si hay un problema, dígame: ${params.link}`;
    }
    if (params.warmth === "warmer") {
      return `${params.tenantName}: ${params.customerFirstName}, ¿todo bien con ${params.invoiceLabel}? Pago aquí: ${params.link}`;
    }
    return `${params.tenantName}: Recordatorio ${params.invoiceLabel} — ${params.link}`;
  }
  if (params.warmth === "final") {
    return `${params.tenantName}: ${params.customerFirstName}, last note on ${params.invoiceLabel}. If something's wrong, please tell me: ${params.link}`;
  }
  if (params.warmth === "warmer") {
    return `${params.tenantName}: ${params.customerFirstName}, everything OK with ${params.invoiceLabel}? Pay link: ${params.link}`;
  }
  return `${params.tenantName}: Reminder ${params.invoiceLabel} — ${params.link}`;
}
