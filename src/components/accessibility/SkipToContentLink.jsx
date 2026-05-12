export default function SkipToContentLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        top: "-40px",
        left: 0,
        background: "#4ade80",
        color: "#060d08",
        padding: "8px 16px",
        textDecoration: "none",
        zIndex: 9999,
        fontWeight: 700,
        fontSize: 14,
      }}
      onFocus={(e) => {
        e.target.style.top = "0px";
      }}
      onBlur={(e) => {
        e.target.style.top = "-40px";
      }}
    >
      Skip to main content
    </a>
  );
}