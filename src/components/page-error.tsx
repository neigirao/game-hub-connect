export function PageError({
  message = "Falha ao carregar dados. Verifique sua conexão.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        background: "linear-gradient(180deg,#2e1870,#1a0e50)",
        border: "2px solid #4a2aa6",
        borderRadius: 20,
      }}
    >
      <div style={{ fontSize: 52, marginBottom: 12 }}>💥</div>
      <div
        style={{
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontWeight: 700,
          fontSize: 20,
          color: "#fff",
          marginBottom: 8,
        }}
      >
        Algo deu errado
      </div>
      <div style={{ color: "#B7AEE0", fontSize: 14, marginBottom: 28 }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 15,
            background: "linear-gradient(180deg,#FFA502,#c97a00)",
            border: "2px solid #FFCB6B",
            borderRadius: 14,
            padding: "10px 28px",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 0 #6e3f00",
          }}
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function PulseSkeleton({
  height = 60,
  borderRadius = 14,
  delay = 0,
}: {
  height?: number;
  borderRadius?: number;
  delay?: number;
}) {
  return (
    <div
      style={{
        height,
        borderRadius,
        background: "rgba(255,255,255,.06)",
        animation: "pulse 1.5s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    />
  );
}
