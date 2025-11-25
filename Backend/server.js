// server.js
import Fastify from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import cors from "@fastify/cors";
import formBody from "@fastify/formbody";

const fastify = Fastify({ logger: true });

// Middleware
await fastify.register(formBody);
await fastify.register(cors, { origin: "*" });

const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

// Temporary in-memory database
let users = []; // { id, email, passwordHash }

// ----------------------
// TEST ROUTE
// ----------------------
fastify.get("/api/hello", async () => {
  return { message: "Hello from Fastify backend!" };
});

// ----------------------
// REGISTER
// ----------------------
fastify.post("/api/register", async (req, reply) => {
  const { email, password } = req.body;

  if (!email || !password)
    return reply.code(400).send({ error: "Email and password required" });

  if (users.find((u) => u.email === email))
    return reply.code(400).send({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    email,
    passwordHash,
  };

  users.push(newUser);

  return { message: "User registered successfully" };
});

// ----------------------
// LOGIN
// ----------------------
fastify.post("/api/login", async (req, reply) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) return reply.code(400).send({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return reply.code(400).send({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token };
});

// ----------------------
// PROFILE
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
// GOLD PRICE API
// ----------------------
fastify.get("/api/gold", async () => {
  try {
    const res = await fetch(
      "https://api.metalpriceapi.com/v1/latest?api_key=da9f54c125175f890fad5d484c56c382&base=USD&currencies=XAU"
    );

    if (!res.ok) return { error: "Failed to fetch gold price" };

    const json = await res.json();
    const price = json.rates?.USDXAU;
    return price ? { price } : { error: "Gold price not found" };
  } catch (err) {
    return { error: "Failed to fetch gold price" };
  }
});

// ----------------------
// START SERVER
// ----------------------
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("✅ Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
