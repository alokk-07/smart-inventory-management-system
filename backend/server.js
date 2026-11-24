
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import transactionRoutes from "./routes/transactionRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home API
app.get("/", (req, res) => {
    res.json({
        message: "Smart Inventory Management API is running!"
    });
});

// Authentication APIs
app.use("/api/auth", authRoutes);

// Product APIs
app.use("/api/products", productRoutes);

// Transaction APIs
app.use("/api/transactions", authMiddleware, transactionRoutes);

const PORT = process.env.PORT || 5000;

//start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();


