const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL Database");
});

// Add School API
app.post("/addSchool", (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    db.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: "School added successfully", id: result.insertId });
    });
});

// List Schools API (Sorted by Distance)
app.get("/listSchools", (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const query = "SELECT * FROM schools";
    db.query(query, (err, results) => {
        if (err) throw err;

        const schoolsWithDistance = results.map((school) => {
            const distance = Math.sqrt(
                Math.pow(school.latitude - latitude, 2) + Math.pow(school.longitude - longitude, 2)
            );
            return { ...school, distance };
        });

        schoolsWithDistance.sort((a, b) => a.distance - b.distance);
        res.status(200).json(schoolsWithDistance);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
