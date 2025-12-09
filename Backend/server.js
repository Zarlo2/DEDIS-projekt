import Fastify from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./dbConn.js";
import fetch from "node-fetch"; 

const fastify = Fastify({ logger: true });
const JWT_SECRET = "qiqndq281742kafqwjh";

// ----------------------
// Component Interface
// ----------------------
class MetalPriceComponent {
  async getPrice() {
    throw new Error("getPrice() not implemented");
  }
}



// ----------------------
// Decorator Base
// ----------------------
class MetalPriceDecorator extends MetalPriceComponent {
  constructor(component) {
    super();
    this.component = component;
  }

  async getPrice() {
    return await this.component.getPrice();
  }
}

// ----------------------
// Concrete Decorators
// ----------------------
class GoldPriceDecorator extends MetalPriceDecorator {
  constructor(component, apiKey) {
    super(component);
    this.apiKey = apiKey;
  }

  async getPrice() {
    const basePrice = await super.getPrice();
    try {
      const headers = {
        "x-access-token": this.apiKey,
        "Content-Type": "application/json"
      };
      const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
        method: "GET",
        headers
      });
      if (!res.ok) throw new Error(`GoldAPI error: ${await res.text()}`);
      const json = await res.json();
      if (!json.price) throw new Error("Gold price not found");
      return json.price;
    } catch (err) {
      console.error("Gold price error:", err);
      throw err;
    }
  }
}

class SilverPriceDecorator extends MetalPriceDecorator {
  constructor(component, apiKey) {
    super(component);
    this.apiKey = apiKey;
  }

  async getPrice() {
    const basePrice = await super.getPrice();
    try {
      const headers = {
        "x-access-token": this.apiKey,
        "Content-Type": "application/json"
      };
      const res = await fetch("https://www.goldapi.io/api/XAG/USD", {
        method: "GET",
        headers
      });
      if (!res.ok) throw new Error(`GoldAPI error: ${await res.text()}`);
      const json = await res.json();
      if (!json.price) throw new Error("Silver price not found");
      return json.price;
    } catch (err) {
      console.error("Silver price error:", err);
      throw err;
    }
  }
}


class TiberiumPriceDecorator extends MetalPriceComponent {
  constructor() {
    super();
    this.price = 100; // initial fake price
  }

  async getPrice() {
    // Simulate price change random walk
    const change = (Math.random() - 0.5) * 2; 
    this.price = Math.max(10, this.price + change); // prevent negative prices cause the economy would implode
    return parseFloat(this.price.toFixed(2));
  }
}

// ----------------------
// Instantiate Services
// ----------------------
const apiKey = "goldapi-7dnz85smiofobm3-io"; // replace with a new key if switching api
const goldService = new GoldPriceDecorator(baseService, apiKey);
const silverService = new SilverPriceDecorator(baseService, apiKey);
const tiberiumService = new TiberiumPriceDecorator();

// ----------------------
// CORS Hook
// ----------------------
fastify.addHook("onRequest", async (req, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
});

// ----------------------
// REGISTER
// ----------------------
fastify.post("/api/register", async (req, reply) => {
  const { email, password } = req.body;
  if (!email || !password)
    return reply.code(400).send({ error: "Email and password required" });

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return reply.code(400).send({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, passwordHash]
    );
    return { message: "User registered successfully" };
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return reply.code(500).send({ error: "Database error" });
  }
});

// ----------------------
// LOGIN
// ----------------------
fastify.post("/api/login", async (req, reply) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email
    ]);
    const user = rows[0];
    if (!user) return reply.code(400).send({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return reply.code(400).send({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h"
    });
    return { token };
  } catch (err) {
    console.error(err);
    return reply.code(500).send({ error: "Database error" });
  }
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
// GOLD, SILVER & TIBERIUM ROUTES
// ----------------------
fastify.get("/api/gold", async () => {
  try {
    const price = await goldService.getPrice();
    return { price };
  } catch (err) {
    return { error: err.message };
  }
});

fastify.get("/api/silver", async () => {
  try {
    const price = await silverService.getPrice();
    return { price };
  } catch (err) {
    return { error: err.message };
  }
});

fastify.get("/api/tiberium", async () => {
  try {
    const price = await tiberiumService.getPrice();
    return { price };
  } catch (err) {
    return { error: err.message };
  }
});

// ----------------------
// START SERVER
// ----------------------
async function start() {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("✅ Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
