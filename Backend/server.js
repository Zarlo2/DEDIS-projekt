// server.js
import Fastify from "fastify";

const fastify = Fastify({ logger: true });

// Define a simple route
fastify.get("/api/hello", async (request, reply) => {
  return { message: "Hello from Fastify backend!" };
});

fastify.get("/api/gold", async () => {
  try {
    const res = await fetch(
      "https://api.metalpriceapi.com/v1/latest?api_key=da9f54c125175f890fad5d484c56c382&base=USD&currencies=XAU"
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("MetalPriceAPI error:", text);
      return { error: "Failed to fetch gold price" };
    }

    const json = await res.json();

    const price = json.rates?.USDXAU; // <-- use USD per ounce
    if (!price) return { error: "Gold price not found" };

    return { price };
  } catch (err) {
    console.error("Error fetching gold price:", err);
    return { error: "Failed to fetch gold price" };
  }
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
