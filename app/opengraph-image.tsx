import { ImageResponse } from "next/og";

export const alt = "En Cuanto Esta - Tasas cambiarias de Venezuela";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#eef5f2",
          color: "#152128",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%"
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#ffffff",
            border: "2px solid #dbe5e4",
            borderRadius: "28px",
            display: "flex",
            height: "100%",
            justifyContent: "center",
            padding: "72px",
            width: "100%"
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: "36px" }}>
            <div
              style={{
                alignItems: "center",
                background: "#c7f363",
                borderRadius: "28px",
                color: "#0c3e33",
                display: "flex",
                fontFamily: "monospace",
                fontSize: 174,
                fontWeight: 700,
                height: "180px",
                justifyContent: "center",
                width: "180px"
              }}
            >
              $
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ color: "#147d64", fontSize: 30, fontWeight: 700, textTransform: "uppercase" }}>Venezuela</div>
              <div style={{ fontSize: 76, fontWeight: 800 }}>En Cuanto Esta</div>
              <div style={{ color: "#66757b", fontSize: 34 }}>Tasas cambiarias actualizadas</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}