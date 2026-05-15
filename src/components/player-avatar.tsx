export function PlayerAvatar({
  name,
  url,
  size = 72,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "3px solid #4a2aa6",
          boxShadow: "0 4px 0 rgba(0,0,0,.3)",
          objectFit: "cover",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#FF6BD6,#70A1FF)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontWeight: 700,
        fontSize: size * 0.36,
        color: "#0E0726",
        border: "3px solid #4a2aa6",
        boxShadow: "0 4px 0 rgba(0,0,0,.3)",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}
