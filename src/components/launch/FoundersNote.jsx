const GOLD = "#a67c52";
const TEXT = "#3d2817";
const MUTED = "#8b7355";

const sections = [
  {
    heading: "MY WHY",
    body: "Rooted 21 was born from my own journey—navigating trauma, systems, and the fight to break generational cycles. I created this platform so no parent has to feel alone, overwhelmed, or unheard.",
  },
  {
    heading: "OUR MISSION",
    body: "To empower parents and families with real-time support, practical tools, and a community that walks with you through every season. We blend education, behavioral support, and connection to help you build a stronger, rooted foundation for your family.",
  },
  {
    heading: "OUR PROMISE",
    body: "We lead with compassion, respect, and real solutions. Your privacy, your story, and your family's well-being will always be at the heart of everything we do.",
  },
];

export default function FoundersNote() {
  return (
    <div style={{ width: "100%", marginBottom: 32 }}>

      {/* ── Photo card ── */}
      <div style={{
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 24,
        boxShadow: `0 8px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(120,85,60,0.15)`,
        position: "relative",
        background: "linear-gradient(135deg, #f5ede2 0%, #eef6ef 100%)",
        height: "clamp(320px, 72vw, 420px)",
      }}>
        <img
          src="https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/b73f4af3a_5061CC5C-2841-45A8-A3F9-073AC259189A.png"
          alt="Misty Stonerock, Founder of Rooted 21"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "contain",
            objectPosition: "center center",
          }}
        />
      </div>

      {/* ── Header card ── */}
      <div style={{
        background: "#ffffff",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1.5px solid rgba(120,85,60,0.15)`,
        borderRadius: 20,
        padding: "24px 22px 20px",
        marginBottom: 12,
        boxShadow: `0 2px 12px rgba(0,0,0,0.06)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* glow accent */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 160, height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(166,124,82,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <p style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.2em",
          color: GOLD, textTransform: "uppercase", marginBottom: 8,
        }}>A Note From Our Founder</p>

        <p style={{
          fontFamily: "var(--font-serif)", fontWeight: 900,
          fontSize: "clamp(1.7rem, 7vw, 2.2rem)",
          color: "#6b9d6e", lineHeight: 1.1, marginBottom: 12,
        }}>
          Founder's<br />Note
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 2, background: GOLD, borderRadius: 2 }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
          <div style={{ width: 32, height: 2, background: GOLD, borderRadius: 2 }} />
        </div>
      </div>

      {/* ── Content sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map((s, i) => (
          <div key={s.heading} style={{
            background: "#f5ede2",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid rgba(120,85,60,0.15)`,
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* left accent bar */}
            <div style={{
              position: "absolute", left: 0, top: 16, bottom: 16,
              width: 3, background: "#6b9d6e", borderRadius: "0 3px 3px 0", opacity: 0.8,
            }} />
            <p style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.18em",
              color: GOLD, textTransform: "uppercase", marginBottom: 8, marginLeft: 8,
            }}>{s.heading}</p>
            <p style={{
              fontSize: "clamp(13px, 3.5vw, 15px)",
              lineHeight: 1.75, color: TEXT, marginLeft: 8,
            }}>{s.body}</p>
          </div>
        ))}
      </div>

      {/* ── Signature card ── */}
      <div style={{
        background: "#e8e0d0",
        borderRadius: 20,
        marginTop: 12,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}>
        {/* Quote strip */}
        <div style={{ padding: "20px 22px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{
            fontSize: 48, lineHeight: 0.75, color: "#3a6a4a",
            fontFamily: "Georgia, serif", flexShrink: 0, marginTop: 6, opacity: 0.7,
          }}>"</span>
          <p style={{
            fontSize: "clamp(13px, 3.8vw, 16px)",
            lineHeight: 1.7, color: "#000000", fontStyle: "italic", fontWeight: 500,
          }}>
            Healing our past.<br />
            Strengthening our present.<br />
            Building their future.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(120,85,60,0.15)", margin: "0 22px" }} />

        {/* Signature row */}
        <div style={{
          padding: "16px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", overflow: "hidden",
              border: "2px solid rgba(107,157,110,0.4)", flexShrink: 0,
            }}>
              <img
                src="https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/b73f4af3a_5061CC5C-2841-45A8-A3F9-073AC259189A.png"
                alt="Misty Stonerock"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              />
            </div>
            <div>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic", fontWeight: 700,
                fontSize: "clamp(15px, 4vw, 18px)",
                color: "#3d2817", marginBottom: 2,
              }}>Misty Stonerock</p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase" }}>Founder</p>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", color: MUTED, textTransform: "uppercase" }}>Rooted 21 Parenting Network</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 20 }}>🌿</span>
            <div>
              <p style={{
                fontFamily: "var(--font-serif)", fontWeight: 800,
                fontSize: 14, color: "#6b9d6e", lineHeight: 1,
              }}>Rooted <span style={{ color: GOLD }}>21</span></p>
              <p style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase" }}>PARENTING NETWORK</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}