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

        <div className="grid w-full max-w-full gap-4 overflow-hidden md:grid-cols-[360px_1fr] md:items-center">
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

          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              borderRadius: 24,
              padding: "18px 16px",
              background: CREAM,
              border: `1.5px solid ${BORDER}`,
              boxSizing: "border-box",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>
              Founder’s Note
            </p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 900, lineHeight: 1.25, color: DARK, marginBottom: 10 }}>
              Rooted 21 was created for families who deserve support without shame.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: MUTED, fontWeight: 700, marginBottom: 10 }}>
              This platform was built from lived experience, compassion, and the belief that parents, caregivers, children, and support teams need calm tools, clear next steps, and real connection during hard seasons.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: MUTED, fontWeight: 700 }}>
              Rooted 21 is here to help families feel seen, organized, supported, and less alone — one step, one resource, and one moment at a time.
            </p>
            <p style={{ marginTop: 14, fontSize: 12, fontWeight: 900, color: DARK }}>
              — Misty Stonerock, Founder
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}