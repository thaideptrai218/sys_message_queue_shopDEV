import "./src/index";
import { consumerToQueue } from "./src/services/message-service";

// Configuration
const queueName = "test-topic";

// Wait for RabbitMQ connection to be established before starting consumers
const startMessageConsumer = async () => {
    console.log("🔄 Waiting for RabbitMQ connection to establish...");

    // Wait a bit for the connection to be ready
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
        console.log(`🎯 Starting consumer for queue: ${queueName}`);

        await consumerToQueue(
            queueName,
            (message) => {
                console.log("📨 RECEIVED MESSAGE:", message);
                // Process message here
            },
            {
                durable: true,
                noAck: true, // Auto-acknowledge messages
                prefetch: 1, // Process one message at a time
            }
        );

        console.log(
            `✅ Message consumer started successfully for queue: ${queueName}`
        );
    } catch (error) {
        console.error("❌ Failed to start message consumer:", error);

        // Retry after delay
        console.log("🔄 Retrying in 5 seconds...");
        setTimeout(startMessageConsumer, 5000);
    }
};

// Start the consumer
startMessageConsumer();

// Graceful shutdown handling
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received. Shutting down gracefully...");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("🛑 SIGINT received. Shutting down gracefully...");
    process.exit(0);
});

console.log("🚀 ShopDEV Message Queue System initialized");
