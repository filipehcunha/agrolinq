import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        color: "#0f172a",
        padding: "2rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          textAlign: "center",
          background: "rgba(255,255,255,0.9)",
          padding: "2.5rem",
          borderRadius: "1.5rem",
          boxShadow: "0 25px 60px rgba(15, 23, 42, 0.12)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <Image
            src="/logo.png"
            alt="Logo AGROLINQ"
            width={300}
            height={100}
            priority
          />
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "#0f172a",
          }}
        >
          Estamos construindo o AGROLINQ
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "#475569",
            marginBottom: "1.5rem",
          }}
        >
          Em breve você vai poder conectar pequenos produtores, restaurantes e
          consumidores em uma rede de agricultura mais justa e sustentável.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: 999,
            border: "1px solid #bbf7d0",
            padding: "0.5rem 1.25rem",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            background: "#ecfdf3",
            color: "#15803d",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "999px",
              background: "#22c55e",
            }}
          />
          <span>Em desenvolvimento</span>
        </div>
      </div>
    </main>
  );
}
