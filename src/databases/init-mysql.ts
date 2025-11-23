import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

//create connection to pool server

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "tipsjs",
    password: process.env.MYSQL_PASSWORD || "123456",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    database: process.env.MYSQL_DATABASE || "shopDEV",
});

// Test connection and log success
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Failed to connect to MySQL:", err.message);
        return;
    }

    console.log("✅ Connected to MySQL successfully!");
    console.log(`📊 MySQL Connection Details:
- Host: ${process.env.MYSQL_HOST || "localhost"}
- Database: ${process.env.MYSQL_DATABASE || "shopDEV"}
- User: ${process.env.MYSQL_USER || "tipsjs"}
- Port: ${process.env.MYSQL_PORT || "3306"}`);

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

// Run test connection
testConnection();
