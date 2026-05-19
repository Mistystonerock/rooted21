const PHOTO_IMAGE_URL = "https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/3dd49f0ca_C1F95A21-F875-4BB1-B648-916D41C51BAE.png";

const CREAM = "#f5ede2";
const CARD = "#ffffff";
const GREEN_TINT = "#eef6ef";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const BORDER = "rgba(120,85,60,0.18)";
const MUTED = "#8b6f54";

export default function FoundersNote() {
  return (
    <section
      aria-label="A Note From Our Founder"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        margin: "0 auto",
        padding: "6px 0 calc(80px + env(safe-area-inset-bottom))",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
          borderRadius: 28,
          padding: "20px 14px",
          background: CARD,
          border: `1.5px solid ${BORDER}`,
          boxShadow: "0 10px 34px rgba(90,61,40,0.08)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <p style={{ textAlign: "center", fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>
          A Note From Our Founder
        </p>
        <h2 style={{ textAlign: "center", fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "clamp(1.7rem, 7vw, 2.4rem)", color: DARK, lineHeight: 1.1, marginBottom: 16 }}>
          Rooted in lived experience
        </h2>

        <div
          style={{
            width: "100%",
            maxWidth: 360,
            margin: "0 auto",
            borderRadius: 24,
            padding: 10,
            background: `linear-gradient(135deg, ${CREAM} 0%, ${GREEN_TINT} 100%)`,
            border: `1.5px solid ${BORDER}`,
            boxShadow: "0 12px 32px rgba(90,61,40,0.12)",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <img
            src={PHOTO_IMAGE_URL}
            alt="Misty Stonerock, founder of Rooted 21"
            style={{
              display: "block",
              width: "100%",
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
              objectPosition: "center center",
              borderRadius: 18,
            }}
          />
        </div>

        <p style={{ maxWidth: 560, margin: "14px auto 0", textAlign: "center", fontSize: 12, lineHeight: 1.7, color: MUTED, fontWeight: 700 }}>
          Rooted 21 was built from lived experience, compassion, and a belief that families deserve support without shame.
        </p>
      </div>
    </section>
  );
}