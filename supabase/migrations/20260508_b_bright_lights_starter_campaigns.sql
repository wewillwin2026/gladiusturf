-- Pre-seed Bright Lights' three starter campaigns — one per maintenance
-- plan tier (Bright Basics / Bright Care / Bright Guardian) so Cristian
-- can launch the maintenance-plan campaign with one click on Day 1.
--
-- The body templates are the EMAIL_EN + EMAIL_ES copy from
-- lib/demo-data/bright-lights.ts §419-461 (handoff §5). Per-tier we
-- pin the target_tier so the audience filter narrows to "customers
-- without an active plan" by default.
--
-- Idempotent: matched on (tenant_id, title). Re-running a second time
-- will skip the inserts.

with t as (
  select id as tenant_id from public.tenants where slug = 'bright-lights-encina'
)
insert into public.campaigns (
  tenant_id, title, body_en, body_es, channel,
  target_tier, audience_filter, status
)
select
  t.tenant_id, v.title, v.body_en, v.body_es,
  array['sms','email']::text[],
  v.target_tier, 'no_plan', 'draft'
from t,
(values
  (
    'Bright Care launch — semi-annual maintenance plan',
    -- EN body (Bright Lights handoff §5 EMAIL_EN, customized for Care).
    E'Hi {{first_name}},\n\nIt''s been {{install_age}} years since we installed your lighting. Florida is rough on outdoor systems — salt air, humidity, plant overgrowth, storms. That''s why we built our new Bright Care maintenance plan.\n\nInstead of calling every time something goes out, your system gets two scheduled visits a year. We clean the lenses, re-aim, check the wires, swap bulbs before they fail. All included for $349/year.\n\nReply YES and I''ll send you the enrollment link.\n\nAs always, thank you for trusting us.\n\nCristian Encina\nBright Lights Landscape Lighting\n(941) 306-6038',
    -- ES body.
    E'Hola {{first_name}},\n\nHan pasado {{install_age}} años desde que instalamos su iluminación. Florida no es fácil con los sistemas de luz — el aire salado, la humedad, las plantas que crecen, las tormentas. Por eso ofrecemos nuestro nuevo plan de mantenimiento Bright Care.\n\nEn lugar de llamar cada vez que algo falla, su sistema recibe dos revisiones al año. Limpiamos los lentes, ajustamos los enfoques, revisamos los cables, cambiamos los focos antes de que fallen. Todo incluido por $349/año.\n\nResponda SÍ y le enviaré el enlace de inscripción.\n\nComo siempre, gracias por confiar en nosotros.\n\nCristian Encina\nBright Lights Landscape Lighting\n(941) 306-6038',
    'care'
  ),
  (
    'Bright Basics intro — annual cleanup',
    E'Hi {{first_name}},\n\nQuick note: we''re launching Bright Basics — one annual visit to keep your lighting system looking new. Lens polish, fixture cleaning, aim adjustment, plant trim, 16-point inspection. $249/year.\n\nIf you''d rather just get it done once a year and not think about it, this is the plan for you. Reply BASICS and I''ll lock you in for next month.\n\n— Cristian, Bright Lights\n(941) 306-6038',
    E'Hola {{first_name}},\n\nUna nota rápida: lanzamos Bright Basics — una revisión anual para mantener su sistema como nuevo. Pulido de lentes, limpieza de luminarias, ajuste de enfoque, poda de plantas, inspección de 16 puntos. $249/año.\n\nSi prefiere hacerlo una vez al año y olvidarse, este plan es para usted. Responda BASICS y lo agendo para el próximo mes.\n\n— Cristian, Bright Lights\n(941) 306-6038',
    'basics'
  ),
  (
    'Bright Guardian — storm-season white-glove',
    E'Hi {{first_name}},\n\nHurricane season starts soon. Bright Guardian is our top-tier plan: quarterly visits, free warranty repairs, 1 free bulb per visit, lifetime warranty extension on Cast fixtures, and — most importantly — a 24-hour SLA after named storms. When Helene or Milton hits, you''re first in line.\n\n$589/year. Roughly 20% of our book picks Guardian. If your install is over 20 fixtures, this is the one.\n\nReply GUARDIAN and I''ll get you set up before peak season.\n\n— Cristian, Bright Lights\n(941) 306-6038',
    E'Hola {{first_name}},\n\nLa temporada de huracanes ya comienza. Bright Guardian es nuestro plan más completo: visitas trimestrales, reparaciones de garantía gratis, 1 foco gratis por visita, extensión de garantía de por vida en luminarias Cast, y — lo más importante — respuesta en 24 horas después de tormentas con nombre. Cuando llegue otra Helene o Milton, usted va primero.\n\n$589/año. Aproximadamente el 20% de nuestros clientes eligen Guardian. Si su instalación supera las 20 luminarias, este es el indicado.\n\nResponda GUARDIAN y lo dejo listo antes de la temporada alta.\n\n— Cristian, Bright Lights\n(941) 306-6038',
    'guardian'
  )
) as v(title, body_en, body_es, target_tier)
where not exists (
  select 1 from public.campaigns c
  where c.tenant_id = t.tenant_id and c.title = v.title
);
