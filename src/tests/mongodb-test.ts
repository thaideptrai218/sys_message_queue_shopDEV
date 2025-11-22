import mongoose, { Mongoose } from "mongoose";

const connectionString = `mongodb://localhost:27017/shopDEV`;

const testSchema = new mongoose.Schema({ name: String });

const testModel = mongoose.model("Test", testSchema);

describe("Mongoose Connection", () => {
    let connection: Mongoose;

    beforeAll(async () => {
        connection = await mongoose.connect(connectionString);
    });

    afterAll(async () => {
        await connection.disconnect();
    });

    it("Should connect to mongoose", () => {
        expect(mongoose.connection.readyState).toBe(1);
    });

    it("Should save a document to the database", async () => {
        const user = new testModel({ name: "Anonystick" });
        await user.save();
        expect(user.isNew).toBe(false);
    });

    it("Should find a document from the database", async () => {
        const user = await testModel.findOne({ name: "Anonystick" });
        expect(user).toBeDefined();
        expect(user?.name).toBe("Anonystick");
    });
});
