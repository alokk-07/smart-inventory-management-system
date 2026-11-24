
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Attach admin JWT automatically
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Get transaction history
export const getTransactions = async () => {
    const response = await API.get("/transactions");
    return response.data;
};

// Record Stock IN or Stock OUT
export const createTransaction = async (transactionData) => {
    const response = await API.post(
        "/transactions",
        transactionData
    );

    return response.data;
};
