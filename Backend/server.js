import Fastify from "fastify";
import cors from "cors"; // classic cors
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./dbConn.js";

const fastify = Fastify({ logger: true });
const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

async function start() {
  // ----------------------
  // CORS using a custom handler
  // ----------------------
  fastify.addHook("onRequest", async (req, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  });

  // ----------------------
  // Test DB connection
  // ----------------------
  const [rows] = await pool.query("SELECT DATABASE()");
  console.log("Connected to DB:", rows[0]["DATABASE()"]);

  // ----------------------
  // REGISTER ROUTE
  // ----------------------
  fastify.post("/api/register", async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password) return reply.code(400).send({ error: "Email and password required" });

    try {
      console.log("REGISTER CALLED:", email);

      const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
      console.log("Existing users with this email:", existing.length);

      if (existing.length > 0) return reply.code(400).send({ error: "Email already registered" });

      const passwordHash = await bcrypt.hash(password, 10);
      console.log("Password hashed");

      const [result] = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        [email, passwordHash]
      );
      console.log("INSERT RESULT:", result);

      return { message: "User registered successfully" };
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return reply.code(500).send({ error: "Database error" });
    }
  });

  // ----------------------
  // LOGIN ROUTE
  // ----------------------
  fastify.post("/api/login", async (req, reply) => {
    const { email, password } = req.body;
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows[0];
      if (!user) return reply.code(400).send({ error: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return reply.code(400).send({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
      return { token };
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ error: "Database error" });
    }
  });

  // ----------------------
  // PROFILE ROUTE
  // ----------------------
  fastify.get("/api/profile", async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: "Missing token" });

    const token = auth.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { user: decoded };
    } catch (err) {
      return reply.code(401).send({ error: "Invalid token" });
    }
  });

  // ----------------------
  // START SERVER
  // ----------------------
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("✅ Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
