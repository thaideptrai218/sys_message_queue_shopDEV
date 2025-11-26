import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

//create connection to pool server

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "tipsjs",
    password: process.env.MYSQL_PASSWORD || "123456",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    database: process.env.MYSQL_DATABASE || "test",
});

// Test connection and log success
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Failed to connect to MySQL:", err.message);
        return;
    }
    connection.release();
});

// Test query function
const testConnection = () => {
    pool.query("SELECT 1 + 1 as result", (err, res: any) => {
        if (err) {
            console.error("❌ MySQL test query failed:", err.message);
            return;
        }
        console.log("✅ MySQL test query successful:", res[0]);
    });
};

const batchSize = 100000;
const totalSize = 10_000_000;

let currentId = 1;
const insertBatch = () => {
    console.time("TIMMER");
    const value = [];

    for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
        const name = `name-${currentId}`;
        const age = currentId % 60;
        const address = `address-${currentId}`;
        value.push([currentId, name, age, address]);
        currentId++;
    }

    if (!value.length) {
        console.timeEnd("TIMMER");
        pool.end((err) => {
            if (err) throw err;
            else console.log(`Connection pool closed`);
        });
        return;
    }

    const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`;

    pool.query(sql, [value], (err, res) => {
        if (err) {
            console.error("❌ MySQL test query failed:", err.message);
            return;
        }
        console.log(`Inserted`, res);
        insertBatch();
    });
};

// Run test connection
insertBatch();
