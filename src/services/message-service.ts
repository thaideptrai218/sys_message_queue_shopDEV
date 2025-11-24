import { rabbitMQConnection } from "../databases/init-rabbitmq";

/**
 * Consumer to queue - function to consume messages from a queue
 */
export const consumerToQueue = async (
    queueName: string,
    onMessage: (message: string) => void,
    options: { durable?: boolean; noAck?: boolean; prefetch?: number } = {}
): Promise<void> => {
    try {
        // Check if RabbitMQ connection is available
        if (!rabbitMQConnection) {
            console.error(
                "❌ RabbitMQ connection not available. Please wait for connection to establish."
            );
            return;
        }

        const { channel } = rabbitMQConnection;

        // Set prefetch if specified (controls how many messages to consume at once)
        if (options.prefetch) {
            await channel.prefetch(options.prefetch);
        }

        // Assert queue (create if it doesn't exist)
        await channel.assertQueue(queueName, {
            durable: options.durable !== false, // Default to true
        });

        console.log(
            `🎯 Starting to consume messages from queue: '${queueName}'`
        );

        // Start consuming messages
        await channel.consume(
            queueName,
            (msg: any) => {
                if (msg) {
                    try {
                        const messageContent = msg.content.toString();
                        console.log(
                            `📨 Received message from '${queueName}': "${messageContent}"`
                        );

                        // Call the message handler
                        onMessage(messageContent);

                        // Only acknowledge if noAck is false (manual acknowledgment)
                        if (!options.noAck) {
                            channel.ack(msg);
                            console.log(
                                `✅ Message acknowledged from '${queueName}'`
                            );
                        }
                    } catch (error) {
                        console.error(
                            `❌ Error processing message from '${queueName}':`,
                            error
                        );

                        // Only negative acknowledge if noAck is false (manual acknowledgment)
                        if (!options.noAck) {
                            // Negative acknowledgment (message stays in queue for retry)
                            channel.nack(msg, false, true);
                        }
                    }
                }
            },
            { noAck: options.noAck ?? true } // Default to true (auto acknowledgment)
        );

        console.log(`✅ Consumer started for queue: '${queueName}'`);
    } catch (error) {
        console.error(
            `❌ Failed to start consumer for queue '${queueName}':`,
            error
        );
    }
};

export const consumerToQueueNormal = async () => {
    try {
        if (!rabbitMQConnection) {
            console.error(
                "❌ RabbitMQ connection not available. Please wait for connection to establish."
            );
            return;
        }

        const { channel } = rabbitMQConnection;
        const notiQueue = "notificationQueueProcess";

        const timeExpired = 15000;

        setTimeout(() => {
            channel.consume(notiQueue, (msg) => {
                console.log(
                    `SEND notification successfully: `,
                    msg?.content.toString()
                );
                channel.ack(msg);
            });
        }, timeExpired);
    } catch (error) {
        console.error(error);
    }
};

export const consumerToQueueFailed = async () => {
    try {
        if (!rabbitMQConnection) {
            console.error(
                "❌ RabbitMQ connection not available. Please wait for connection to establish."
            );
            return;
        }

        const { channel } = rabbitMQConnection;
        const notificationExchangeDLX = "notificationExDLX";
        const notificationRoutingKeyDLX = "notificationRoutingKeyDLX";

        const notiQueueHandler = "notificationQueueNotFix";

        await channel.assertExchange(notificationExchangeDLX, "direct", {
            durable: true,
        });

        const queueResult = await channel.assertQueue(notiQueueHandler, {
            exclusive: false,
        });

        await channel.bindQueue(
            queueResult.queue,
            notificationExchangeDLX,
            notificationRoutingKeyDLX
        );

        await channel.consume(
            queueResult.queue,
            (msgFailed) => {
                console.log(
                    `This notification error, pls hot fix`,
                    msgFailed?.content.toString()
                );
            },
            {
                noAck: true,
            }
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
};
