import "./src/index";
import {
    consumerToQueue,
    consumerToQueueFailed,
    consumerToQueueNormal,
} from "./src/services/message-service";
import { rabbitMQPromise } from "./src/databases/init-rabbitmq";

// Configuration
const queueName = "test-topic";
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received. Shutting down gracefully...");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("🛑 SIGINT received. Shutting down gracefully...");
    process.exit(0);
});

// Wait for RabbitMQ connection before starting consumers
const startConsumers = async () => {
    try {
        console.log("⏳ Waiting for RabbitMQ connection...");

        // Wait for RabbitMQ to be ready
        await rabbitMQPromise;

        console.log("✅ RabbitMQ connected, starting message consumers...");

        // Start both consumers
        await Promise.all([
            consumerToQueueNormal(),
            consumerToQueueFailed()
        ]);

        console.log("✅ All message consumers started successfully");
    } catch (error) {
        console.error("❌ Failed to start message consumers:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
};

startConsumers();

console.log("🚀 ShopDEV Message Queue System initializing...");
