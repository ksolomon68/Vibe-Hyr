export function PageLoader({ text = "LOADING YOUR PROGRESS..." }: { text?: string }) {
  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0E0C08",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#E8621A",
          fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em", marginBottom: 12 }}>
          VIBE HYR
        </div>
        <div style={{ fontSize: 12, color: "#5A4A34", letterSpacing: "0.14em" }}>
          {text}
        </div>
      </div>
    </div>
  )
}
