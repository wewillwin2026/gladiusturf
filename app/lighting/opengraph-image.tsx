import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Gladius Lighting — The operating system for landscape lighting businesses";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(180deg, #0E1628 0%, #0E1628 60%, #1a2138 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#F5F1E8",
        }}
      >
        {/* Single warm amber dot — top-left visual motif. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              background: "#F4CC85",
              boxShadow: "0 0 40px rgba(244,204,133,0.7)",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F4CC85",
            }}
          >
            Gladius · Lighting
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              maxWidth: "1000px",
            }}
          >
            Gladius Lighting
          </div>
          <div
            style={{
              fontSize: "36px",
              lineHeight: 1.25,
              color: "rgba(245,241,232,0.8)",
              maxWidth: "900px",
            }}
          >
            The operating system for landscape lighting businesses.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "20px",
            color: "rgba(245,241,232,0.55)",
            borderTop: "1px solid rgba(245,241,232,0.12)",
            paddingTop: "28px",
          }}
        >
          <span>Fixture-level inventory · Bilingual flow · Storm-response</span>
          <span style={{ color: "#F4CC85" }}>gladiusturf.com/lighting</span>
        </div>
      </div>
    ),
    size,
  );
}
