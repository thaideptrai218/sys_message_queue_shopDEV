import amqp, { Connection, Channel, ChannelModel } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

interface RabbitMQConfig {
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    vhost?: string;
    heartbeat?: number;
}

interface RabbitMQConnection {
    connection: ChannelModel;
    channel: Channel;
    close: () => Promise<void>;
}

// Global connection object
export let rabbitMQConnection: RabbitMQConnection | null = null;

const DEFAULT_CONFIG: RabbitMQConfig = {
    hostname: process.env.RABBITMQ_HOST || "localhost",
    port: parseInt(process.env.RABBITMQ_PORT || "5672"),
    username: process.env.RABBITMQ_USER || "guest",
    password: process.env.RABBITMQ_PASSWORD || "guest",
    vhost: "/",
    heartbeat: 60,
};

const connectToRabbitMq = async (
    config: Partial<RabbitMQConfig> = {}
): Promise<RabbitMQConnection | null> => {
    try {
        const finalConfig = { ...DEFAULT_CONFIG, ...config };

        // Build connection URL
        const connectionUrl = `amqp://${finalConfig.username}:${finalConfig.password}@${finalConfig.hostname}:${finalConfig.port}${finalConfig.vhost}`;

        console.log(
            `🔄 Connecting to RabbitMQ at ${finalConfig.hostname}:${finalConfig.port}...`
        );

        const connection = await amqp.connect(connectionUrl, {
            heartbeat: finalConfig.heartbeat,
            timeout: 30000, // 30 seconds connection timeout
        });

        if (!connection) {
            throw new Error("Failed to establish RabbitMQ connection");
        }

        const channel = await connection.createChannel();

        const connectionObj = {
            connection,
            channel,
            close: async () => {
                try {
                    if (channel) await channel.close();
                    if (connection) await connection.close();
                    console.log("🔌 RabbitMQ connection closed gracefully");
                    rabbitMQConnection = null;
                } catch (error) {
                    console.error(
                        "❌ Error closing RabbitMQ connection:",
                        error
                    );
                }
            },
        };

        // Set up error handlers
        connection.on("error", (err) => {
            console.error("❌ RabbitMQ connection error:", err);
        });

        connection.on("close", () => {
            console.log("🔌 RabbitMQ connection closed");
            rabbitMQConnection = null;
        });

        channel.on("error", (err) => {
            console.error("❌ RabbitMQ channel error:", err);
        });

        // Store connection globally
        rabbitMQConnection = connectionObj;

        console.log("✅ Connected to RabbitMQ successfully!");
        console.log(`🐰 RabbitMQ Connection Details:
- Host: ${finalConfig.hostname}
- Port: ${finalConfig.port}
- Username: ${finalConfig.username}
- VHost: ${finalConfig.vhost}
- Heartbeat: ${finalConfig.heartbeat}s`);

        return connectionObj;
    } catch (error) {
        console.error(
            "❌ Failed to connect to RabbitMQ:",
            error instanceof Error ? error.message : error
        );
        return null;
    }
};


const connectToRabbitMqForTest = async () => {
    try {
        const rabbitConnection = await connectToRabbitMq();
        if (!rabbitConnection) {
            console.log("❌ Cannot run test - RabbitMQ connection failed");
            return;
        }

        const { channel } = rabbitConnection;
        const queue = "test-queue";
        const message = "Hello, shopDEV by annonystick";

        // Create queue (if it doesn't exist)
        await channel.assertQueue(queue, { durable: true });
        console.log(`📬 Queue '${queue}' is ready`);

        // Send test message
        await channel.sendToQueue(queue, Buffer.from(message), {
            persistent: true, // Message survives broker restarts
            timestamp: Date.now(),
        });
        console.log(`📤 Test message sent: "${message}"`);

        // Consume the test message to verify
        await channel.consume(
            queue,
            (msg: amqp.ConsumeMessage | null) => {
                if (msg) {
                    console.log(
                        `📨 Received test message: "${msg.content.toString()}"`
                    );
                    channel.ack(msg); // Acknowledge message
                    console.log("✅ RabbitMQ test completed successfully!");

                    // Close connection after test
                    setTimeout(async () => {
                        await rabbitConnection.close();
                    }, 1000);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error(
            "❌ RabbitMQ test failed:",
            error instanceof Error ? error.message : error
        );
    }
};

// Export connection promise for other modules to wait for
export const rabbitMQPromise = connectToRabbitMq();

// Auto-connect to RabbitMQ when module is imported
// Note: This is redundant with rabbitMQPromise but kept for backward compatibility
connectToRabbitMq();

// Export functions for use in other files
export { connectToRabbitMq, connectToRabbitMqForTest };
export type { RabbitMQConfig, RabbitMQConnection };
