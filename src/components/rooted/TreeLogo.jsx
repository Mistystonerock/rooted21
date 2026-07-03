const LOGO_URL = "https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/018147e13_B0BEFF6A-34C2-4F87-B8A6-14852D7E34E6.png";

export default function TreeLogo({ size = 52 }) {
  return (
    <img
      src={LOGO_URL}
      alt="Rooted 21 logo"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", animation: "sway 7s ease-in-out infinite", transformOrigin: "50% 90%" }}
    />
  );
}