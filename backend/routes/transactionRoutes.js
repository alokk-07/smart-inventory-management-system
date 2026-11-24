
import express from "express";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// GET - View transaction history
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("product", "name sku")
            .populate("performedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Stock IN / Stock OUT
router.post("/", async (req, res) => {
    try {
        const { productId, type, quantity, note } = req.body;

        if (!productId || !["IN", "OUT"].includes(type)) {
            return res.status(400).json({
                message: "Valid product ID and transaction type are required"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (type === "OUT" && product.quantity < quantity) {
            return res.status(400).json({
                message: "Insufficient stock available"
            });
        }

        const newQuantity =
            type === "IN"
                ? product.quantity + quantity
                : product.quantity - quantity;

        product.quantity = newQuantity;
        await product.save();

        const transaction = await Transaction.create({
            product: product._id,
            type,
            quantity,
            note: note || "",
            performedBy: req.user.id
        });

        res.status(201).json({
            message: `Stock ${type} recorded successfully`,
            product,
            transaction
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
