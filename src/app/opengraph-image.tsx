import { ImageResponse } from "next/og";

export const alt = "Heartly — Digital gifts made personal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #fff9f7 0%, #fce7ef 52%, #f3c6d3 100%)",
          fontFamily: "Georgia, serif",
          color: "#603b59",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "rgba(232, 93, 117, 0.16)",
            right: -160,
            top: -180,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: 999,
            background: "rgba(96, 59, 89, 0.08)",
            left: -120,
            bottom: -190,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 26,
              background: "linear-gradient(135deg, #e85d75, #603b59)",
              color: "#ffffff",
              fontSize: 52,
              boxShadow: "0 22px 44px -18px rgba(232, 93, 117, 0.8)",
            }}
          >
            ♥
          </div>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1 }}>
            Heartly
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: -3,
              maxWidth: 900,
            }}
          >
            Digital gifts made personal.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "#5f5560",
              maxWidth: 780,
              fontFamily: "Arial, sans-serif",
            }}
          >
            Music, photos, animations and a message that feels like you.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#5f5560",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <span>Send a little joy in a link.</span>
          <span style={{ color: "#e85d75", fontWeight: 700 }}>heartly.app</span>
        </div>
      </div>
    ),
    size,
  );
}
