import authMiddleware from "../middleware/authMiddleware.js";
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();
router.use(authMiddleware);

// GET - View all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Add new product
router.post("/", async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product added successfully",
            product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT - Update product
router.put("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE - Delete product
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
