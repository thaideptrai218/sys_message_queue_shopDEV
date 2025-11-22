import amqp, { Connection, Channel } from "amqplib";

interface RabbitMQConfig {
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    vhost?: string;
    heartbeat?: number;
}

interface RabbitMQConnection {
    connection: any;
    channel: any;
    close: () => Promise<void>;
}

const DEFAULT_CONFIG: RabbitMQConfig = {
    hostname: "localhost",
    port: 5672,
    username: "guest",
    password: "guest",
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

        // Set up error handlers
        connection.on("error", (err) => {
            console.error("❌ RabbitMQ connection error:", err);
        });

        connection.on("close", () => {
            console.log("🔌 RabbitMQ connection closed");
        });

        channel.on("error", (err) => {
            console.error("❌ RabbitMQ channel error:", err);
        });

        console.log("✅ Connected to RabbitMQ successfully!");

        return {
            connection,
            channel,
            close: async () => {
                try {
                    if (channel) await channel.close();
                    if (connection) await connection.close();
                    console.log("🔌 RabbitMQ connection closed gracefully");
                } catch (error) {
                    console.error(
                        "❌ Error closing RabbitMQ connection:",
                        error
                    );
                }
            },
        };
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


// Export functions for use in other files
export { connectToRabbitMq, connectToRabbitMqForTest };
export type { RabbitMQConfig, RabbitMQConnection };
