// Importing all required external modules after installation
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Import the cors package

// Middleware
const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors()); // Add the cors middleware here

// Debugging MONGO_URL and connecting MongoDB Atlas
console.log("MONGO_URL:", process.env.MONGO_URL); // Debug log
if (!process.env.MONGO_URL) {
    console.error("Error: MONGO_URL is not defined in the .env file.");
    process.exit(1); // Exit the process if MONGO_URL is missing
}

mongoose.connect(process.env.MONGO_URL).then(
    () => console.log("DB connected successfully...")
).catch(
    (err) => {
        console.error("Error connecting to MongoDB:", err.message);
        console.error("Ensure your MONGO_URL is correct and accessible.");
        process.exit(1); // Exit the process if the connection fails
    }
);

// API landing page http://localhost:3000/
app.get('/', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');
        res.send("<h1 style='text-align: center;'>Welcome to the backend and Week 2</h1>");
    } catch (err) {
        console.error("Error in landing page:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// API registration page http://localhost:3000/register
app.post('/register', async (req, res) => {
    const { user, email, password } = req.body;

    if (!user || !email || !password) {
        console.error("Missing fields in registration request:", req.body);
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ user, email, password: hashPassword });
        await newUser.save();
        console.log("New user is registered successfully...");
        res.json({ message: 'User created successfully.' });
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// API Login page http://localhost:3000/login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.error("Missing fields in login request"); // Avoid logging sensitive data
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.error("Invalid credentials for email:", email); // Log only the email
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        console.log("User logged in successfully:", user.user);
        res.json({ message: "Login Successful", username: user.user });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Server running and testing
app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Server is running on port | This Harshal : " + PORT);
});