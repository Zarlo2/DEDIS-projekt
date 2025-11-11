// server.js
import Fastify from "fastify";

const fastify = Fastify({ logger: true });

// Define a simple route
fastify.get("/api/hello", async (request, reply) => {
  return { message: "Hello from Fastify backend!" };
});

// Start the server
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
