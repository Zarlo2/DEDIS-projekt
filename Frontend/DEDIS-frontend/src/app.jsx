import { useEffect, useState } from "preact/hooks";

export function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
fetch("/api/hello")
  .then(res => res.json())
  .then(data => setMessage(data.message))
  .catch(() => setMessage("Failed to connect to backend"));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Preact + Fastify 🔗</h1>
      <p>{message}</p>
    </div>
  );
}
