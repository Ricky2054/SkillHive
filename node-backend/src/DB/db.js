import mysql from 'mysql2';

// Local development
const db = mysql.createConnection({
    host: 'localhost',  // or '127.0.0.1'
    user: 'root',
    password: "xupbas-qopzar-6vaWto",
    database: 'skillhive',
    port: 3306
});

// Remote server
// const db = mysql.createConnection({
//     host: 'your-database-url.com',  // e.g., 'database.example.com'
//     user: 'your_username',
//     password: process.env.DB_PASSWORD,
//     database: 'skillhive',
//     port: 3306  // default MySQL port
// });

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database!');
    }
});

export default db;