
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Attach JWT token to every API request
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getProducts = async () => {
    const response = await API.get("/products");
    return response.data;
};

export const addProduct = async (product) => {
    const response = await API.post("/products", product);
    return response.data;
};

export const updateProduct = async (id, product) => {
    const response = await API.put(`/products/${id}`, product);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
};
