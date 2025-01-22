const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes.js'); // Import the routes
const otpRoutes = require('./routes/otpRoutes.js');

dotenv.config();
const app = express();
// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get('/', (req, res) => {
    res.send("Hello World from me")
});

// Use the routes
app.use('/api/auth', authRoutes); // This sets the base path for routes
app.use('/api/otp', otpRoutes); // OTP verification route

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
