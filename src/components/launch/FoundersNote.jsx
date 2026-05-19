const NOTE_IMAGE_URL = "https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/d6b939714_IMG_7781.png";

const CREAM = "#f5ede2";
const GREEN_TINT = "#eef6ef";
const BORDER = "rgba(120,85,60,0.18)";
const MUTED = "#8b6f54";

export default function FoundersNote() {
  return (
    <section
      aria-label="A note from our founder"
      style={{
        width: "100%",
        marginBottom: 32,
        paddingBottom: "calc(120px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
          borderRadius: 28,
          padding: "clamp(12px, 4vw, 22px)",
          background: `linear-gradient(135deg, ${CREAM} 0%, ${GREEN_TINT} 100%)`,
          border: `1.5px solid ${BORDER}`,
          boxShadow: "0 14px 42px rgba(90,61,40,0.12)",
        }}
      >
        <img
          src={NOTE_IMAGE_URL}
          alt="Founder’s Note from Misty Stonerock for Rooted 21 Parenting Network"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            maxHeight: "none",
            objectFit: "contain",
            objectPosition: "center center",
            borderRadius: 20,
            boxShadow: "0 8px 28px rgba(90,61,40,0.16)",
          }}
        />
      </div>

      <p
        style={{
          maxWidth: 560,
          margin: "14px auto 0",
          textAlign: "center",
          fontSize: 11,
          lineHeight: 1.6,
          color: MUTED,
          fontWeight: 700,
        }}
      >
        Rooted 21 was built from lived experience, compassion, and a belief that families deserve support without shame.
      </p>
    </section>
  );
}