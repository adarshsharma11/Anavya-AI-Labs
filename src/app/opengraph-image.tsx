import { ImageResponse } from "next/og";

export const alt = "Anavya AI Labs — Free AI website scanner and GEO audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#121418",
          color: "#F5F6F8",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            width: 10,
            height: "100%",
            background: "#7C3AED",
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            padding: "72px 56px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 620 }}>
            <div
              style={{
                fontSize: 20,
                letterSpacing: 4,
                fontWeight: 700,
                color: "#9CA3AF",
              }}
            >
              ANAVYA AI LABS
            </div>
            <div
              style={{
                marginTop: 36,
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              Free AI website scanner & GEO audit
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 26,
                color: "#9CA3AF",
                lineHeight: 1.4,
              }}
            >
              Scan SEO, performance, and AI-search gaps. Get a ranked fix list
              in about a minute.
            </div>
            <div style={{ display: "flex", marginTop: 40, gap: 12 }}>
              {["SEO", "Performance", "GEO"].map((label) => (
                <div
                  key={label}
                  style={{
                    border: "2px solid #2A2E36",
                    borderRadius: 999,
                    padding: "8px 18px",
                    fontSize: 18,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 48, fontSize: 20, color: "#9CA3AF" }}>
              anavyaailabs.com
            </div>
          </div>
          <div
            style={{
              width: 380,
              height: 446,
              border: "2px solid #2A2E36",
              borderRadius: 20,
              background: "#181B20",
              padding: 28,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 18, color: "#9CA3AF" }}>scanner report</div>
            <div
              style={{
                marginTop: 28,
                width: 120,
                height: 120,
                borderRadius: 60,
                border: "6px solid #7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 700,
                alignSelf: "center",
              }}
            >
              72
            </div>
            {[
              ["SEO", "61", 61],
              ["Performance", "54", 54],
              ["GEO", "68", 68],
            ].map(([name, value, width]) => (
              <div
                key={name}
                style={{ display: "flex", flexDirection: "column", marginTop: 22 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 20,
                  }}
                >
                  <span>{name}</span>
                  <span style={{ color: "#9CA3AF" }}>{value}</span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    height: 4,
                    width: "100%",
                    background: "#2A2E36",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      height: 4,
                      width: `${width}%`,
                      background: "#7C3AED",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
