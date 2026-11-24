
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        lowStockThreshold: {
            type: Number,
            default: 5,
            min: 0
        },

        description: {
            type: String,
            default: ""
        },

        imageUrl: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
