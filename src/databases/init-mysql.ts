import mysql from "mysql2";

//create connection to pool server

const pool = mysql.createPool({
    host: "localhost",
    user: "tipsjs",
    password: "123456",
    port: 33006,
    database: 'shopDEV'
});

pool.query("SELECT * FROM users", (err, res) => {
    if (err) throw err;

    console.log(`Query result: ${res}`, res);

    pool.end((err) => {
        if (err) throw err;
        console.log("connection closed:");
    });
});
