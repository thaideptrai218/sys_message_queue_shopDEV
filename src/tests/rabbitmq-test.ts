import {
    connectToRabbitMq,
    connectToRabbitMqForTest,
} from "../databases/init-rabbitmq";

describe("RabbitMQ Connection", () => {
    it("Should connect sucessful rabbitmq", async () => {
        const result = await connectToRabbitMqForTest();
        expect(result).toBeUndefined();
    });
});
