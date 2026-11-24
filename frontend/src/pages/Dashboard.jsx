
import { useEffect, useMemo, useState } from "react";

import {
    LayoutDashboard,
    Package,
    AlertTriangle,
    IndianRupee,
    Plus,
    Search,
    Bell,
    Trash2,
    Pencil,
    RefreshCw,
    X,
    ArrowDownToLine,
    ArrowUpFromLine,
    History
} from "lucide-react";

import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from "../services/productService";

import {
    getTransactions,
    createTransaction
} from "../services/transactionService";


function Dashboard({ onLogout }) {

    // ==============================
    // PRODUCT STATES
    // ==============================

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const emptyForm = {
        name: "",
        sku: "",
        category: "",
        price: "",
        quantity: "",
        lowStockThreshold: 5,
        description: ""
    };

    const [form, setForm] = useState(emptyForm);


    // ==============================
    // TRANSACTION STATES
    // ==============================

    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState("");
    const [transactionType, setTransactionType] = useState("IN");
    const [transactionQuantity, setTransactionQuantity] = useState("");
    const [transactionNote, setTransactionNote] = useState("");

    const [transactions, setTransactions] = useState([]);
    const [transactionLoading, setTransactionLoading] = useState(false);


    // ==============================
    // LOAD PRODUCTS
    // ==============================

    const loadProducts = async () => {
        try {
            setError("");
            setLoading(true);

            const data = await getProducts();

            setProducts(data);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load products. Check your backend."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadProducts();
    }, []);


    // ==============================
    // LOAD TRANSACTIONS
    // ==============================

    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data);

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to load transaction history."
            );
        }
    };


    // ==============================
    // SEARCH AND DASHBOARD STATS
    // ==============================

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            `${product.name} ${product.sku} ${product.category}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [products, search]);


    const lowStock = products.filter(
        (product) =>
            product.quantity <= product.lowStockThreshold
    );


    const totalUnits = products.reduce(
        (sum, product) => sum + product.quantity,
        0
    );


    const inventoryValue = products.reduce(
        (sum, product) =>
            sum + product.price * product.quantity,
        0
    );


    // ==============================
    // ADD / EDIT PRODUCT
    // ==============================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            price: Number(form.price),
            quantity: Number(form.quantity),
            lowStockThreshold: Number(form.lowStockThreshold)
        };

        try {
            if (editingId) {
                await updateProduct(editingId, payload);
            } else {
                await addProduct(payload);
            }

            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);

            await loadProducts();

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Could not save product."
            );
        }
    };


    // ==============================
    // EDIT PRODUCT
    // ==============================

    const handleEdit = (product) => {
        setEditingId(product._id);

        setForm({
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            lowStockThreshold: product.lowStockThreshold,
            description: product.description || ""
        });

        setShowForm(true);
    };


    // ==============================
    // DELETE PRODUCT
    // ==============================

    const handleDelete = async (id) => {

        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            await deleteProduct(id);
            await loadProducts();

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to delete product."
            );
        }
    };


    // ==============================
    // CLOSE PRODUCT FORM
    // ==============================

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    };


    // ==============================
    // OPEN STOCK IN / OUT FORM
    // ==============================

    const openTransactionForm = (product, type) => {

        setSelectedProduct(product._id);
        setTransactionType(type);

        setTransactionQuantity("");
        setTransactionNote("");

        setShowTransactionForm(true);
    };


    // ==============================
    // SUBMIT STOCK TRANSACTION
    // ==============================

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();

        const quantity = Number(transactionQuantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            alert("Enter a valid positive whole number.");
            return;
        }

        const product = products.find(
            (p) => p._id === selectedProduct
        );

        if (!product) {
            alert("Please select a valid product.");
            return;
        }

        if (transactionType === "OUT" && quantity > product.quantity) {
            alert("Insufficient stock available.");
            return;
        }

        try {
            setTransactionLoading(true);

            await createTransaction({
                productId: selectedProduct,
                type: transactionType,
                quantity,
                note: transactionNote
            });

            setShowTransactionForm(false);
            setTransactionQuantity("");
            setTransactionNote("");

            await loadProducts();

            if (showHistory) {
                await loadTransactions();
            }

            alert(
                `Stock ${transactionType} recorded successfully!`
            );

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to record stock transaction."
            );

        } finally {
            setTransactionLoading(false);
        }
    };


    // ==============================
    // TRANSACTION HISTORY TOGGLE
    // ==============================

    const toggleHistory = async () => {

        if (!showHistory) {
            await loadTransactions();
        }

        setShowHistory(!showHistory);
    };


    // ==============================
    // DASHBOARD UI
    // ==============================

    return (

        <div className="app-layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="brand">
                    <div className="brand-icon">S</div>
                    <span>SmartStock</span>
                </div>

                <p className="nav-heading">WORKSPACE</p>

                <div className="nav-item active">
                    <LayoutDashboard size={19} />
                    Dashboard
                </div>

                <div className="nav-item">
                    <Package size={19} />
                    Inventory
                </div>

                <div className="nav-item">
                    <AlertTriangle size={19} />
                    Low Stock
                </div>

                <div className="sidebar-bottom">

                    <div className="profile-avatar">A</div>

                    <div>
                        <strong>Administrator</strong>
                        <small>Inventory Manager</small>
                    </div>

                </div>

            </aside>


            {/* MAIN CONTENT */}

            <main className="main-content">


                {/* TOPBAR */}

                <header className="topbar">

                    <div>
                        <p className="breadcrumb">
                            Workspace / Overview
                        </p>

                        <h1>Inventory Dashboard</h1>
                    </div>

                    <div className="top-actions">

                        <button
                            className="icon-button"
                            onClick={loadProducts}
                            title="Refresh inventory"
                        >
                            <RefreshCw size={19} />
                        </button>

                        <button className="icon-button">
                            <Bell size={19} />
                        </button>

                        <button
                            className="cancel-button"
                            onClick={onLogout}
                        >
                            Logout
                        </button>

                        <div className="top-avatar">A</div>

                    </div>

                </header>


                {/* WELCOME SECTION */}

                <section className="welcome-section">

                    <div>
                        <h2>Welcome back, Admin 👋</h2>

                        <p>
                            Here's what's happening with your inventory today.
                        </p>
                    </div>

                    <div className="top-actions">

                        <button
                            className="cancel-button"
                            onClick={toggleHistory}
                        >
                            <History size={16} />

                            {showHistory
                                ? "Hide History"
                                : "Transaction History"}
                        </button>

                        <button
                            className="primary-button"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus size={18} />
                            Add Product
                        </button>

                    </div>

                </section>


                {/* ERROR MESSAGE */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* DASHBOARD STATISTICS */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon purple">
                            <Package size={22} />
                        </div>

                        <p>Total Products</p>

                        <h2>{products.length}</h2>

                        <small>Unique inventory items</small>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon blue">
                            <LayoutDashboard size={22} />
                        </div>

                        <p>Total Stock Units</p>

                        <h2>
                            {totalUnits.toLocaleString("en-IN")}
                        </h2>

                        <small>Units currently available</small>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon orange">
                            <AlertTriangle size={22} />
                        </div>

                        <p>Low Stock Items</p>

                        <h2>{lowStock.length}</h2>

                        <small>Products at or below threshold</small>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon green">
                            <IndianRupee size={22} />
                        </div>

                        <p>Inventory Value</p>

                        <h2>
                            ₹{inventoryValue.toLocaleString("en-IN")}
                        </h2>

                        <small>Based on price × quantity</small>

                    </div>

                </section>


                {/* PRODUCT INVENTORY */}

                <section className="inventory-panel">

                    <div className="panel-heading">

                        <div>
                            <h2>Product Inventory</h2>
                            <p>Manage and monitor your stock.</p>
                        </div>

                        <div className="search-box">

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>

                    </div>


                    {loading ? (

                        <p className="empty-state">
                            Loading inventory...
                        </p>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>
                                        <th>PRODUCT</th>
                                        <th>SKU</th>
                                        <th>CATEGORY</th>
                                        <th>PRICE</th>
                                        <th>QUANTITY</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredProducts.map((product) => (

                                        <tr key={product._id}>

                                            <td>
                                                <strong>{product.name}</strong>
                                            </td>

                                            <td>{product.sku}</td>

                                            <td>{product.category}</td>

                                            <td>₹{product.price}</td>

                                            <td>{product.quantity}</td>

                                            <td>

                                                <span className={
                                                    product.quantity <= product.lowStockThreshold
                                                        ? "status low"
                                                        : "status available"
                                                }>

                                                    {product.quantity <= product.lowStockThreshold
                                                        ? "Low Stock"
                                                        : "In Stock"}

                                                </span>

                                            </td>


                                            {/* ACTION BUTTONS */}

                                            <td>

                                                <button
                                                    className="action-button"
                                                    title="Stock IN"
                                                    onClick={() =>
                                                        openTransactionForm(product, "IN")
                                                    }
                                                >
                                                    <ArrowDownToLine
                                                        size={16}
                                                        color="green"
                                                    />
                                                </button>


                                                <button
                                                    className="action-button"
                                                    title="Stock OUT"
                                                    onClick={() =>
                                                        openTransactionForm(product, "OUT")
                                                    }
                                                >
                                                    <ArrowUpFromLine
                                                        size={16}
                                                        color="#d97706"
                                                    />
                                                </button>


                                                <button
                                                    className="action-button"
                                                    onClick={() => handleEdit(product)}
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>


                                                <button
                                                    className="action-button delete"
                                                    onClick={() =>
                                                        handleDelete(product._id)
                                                    }
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>


                            {filteredProducts.length === 0 && (

                                <p className="empty-state">

                                    {search
                                        ? "No matching products found."
                                        : "No products yet. Add your first product!"}

                                </p>

                            )}

                        </div>

                    )}

                </section>


                {/* TRANSACTION HISTORY */}

                {showHistory && (

                    <section
                        className="inventory-panel"
                        style={{ marginBottom: "22px" }}
                    >

                        <div className="panel-heading">

                            <div>
                                <h2>Transaction History</h2>
                                <p>Track all stock movements.</p>
                            </div>

                            <button
                                className="icon-button"
                                onClick={loadTransactions}
                                title="Refresh history"
                            >
                                <RefreshCw size={18} />
                            </button>

                        </div>


                        {transactions.length === 0 ? (

                            <p className="empty-state">
                                No transactions found.
                            </p>

                        ) : (

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                        <tr>
                                            <th>PRODUCT</th>
                                            <th>TYPE</th>
                                            <th>QUANTITY</th>
                                            <th>NOTE</th>
                                            <th>ADMIN</th>
                                            <th>DATE</th>
                                        </tr>

                                    </thead>


                                    <tbody>

                                        {transactions.map((item) => (

                                            <tr key={item._id}>

                                                <td>
                                                    <strong>
                                                        {item.product?.name || "Deleted product"}
                                                    </strong>
                                                </td>


                                                <td>

                                                    <span className={
                                                        item.type === "IN"
                                                            ? "status available"
                                                            : "status low"
                                                    }>
                                                        {item.type}
                                                    </span>

                                                </td>


                                                <td>{item.quantity}</td>

                                                <td>{item.note || "—"}</td>

                                                <td>
                                                    {item.performedBy?.name || "Administrator"}
                                                </td>

                                                <td>
                                                    {new Date(item.createdAt).toLocaleString("en-IN")}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                )}


                {/* LOW STOCK ALERTS */}

                {lowStock.length > 0 && (

                    <section className="alert-panel">

                        <div className="alert-title">

                            <AlertTriangle size={20} />

                            <strong>
                                Low Stock Alerts ({lowStock.length})
                            </strong>

                        </div>


                        {lowStock.map((product) => (

                            <p key={product._id}>

                                <strong>{product.name}</strong>
                                {" "}— only {product.quantity} units remaining.

                            </p>

                        ))}

                    </section>

                )}


                {/* ADD / EDIT PRODUCT MODAL */}

                {showForm && (

                    <div className="modal-overlay">

                        <div className="product-modal">

                            <div className="modal-heading">

                                <div>
                                    <h2>
                                        {editingId
                                            ? "Edit Product"
                                            : "Add New Product"}
                                    </h2>

                                    <p>Enter your product information.</p>
                                </div>

                                <button
                                    className="icon-button"
                                    onClick={closeForm}
                                >
                                    <X />
                                </button>

                            </div>


                            <form onSubmit={handleSubmit}>

                                <div className="form-grid">

                                    <label>
                                        Product Name

                                        <input
                                            required
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    name: e.target.value
                                                })
                                            }
                                        />
                                    </label>


                                    <label>
                                        SKU

                                        <input
                                            required
                                            value={form.sku}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    sku: e.target.value
                                                })
                                            }
                                        />
                                    </label>


                                    <label>
                                        Category

                                        <input
                                            required
                                            value={form.category}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    category: e.target.value
                                                })
                                            }
                                        />
                                    </label>


                                    <label>
                                        Price (₹)

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            value={form.price}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    price: e.target.value
                                                })
                                            }
                                        />
                                    </label>


                                    <label>
                                        Quantity

                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={form.quantity}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    quantity: e.target.value
                                                })
                                            }
                                        />
                                    </label>


                                    <label>
                                        Low Stock Threshold

                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={form.lowStockThreshold}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    lowStockThreshold: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                </div>


                                <label className="description-label">
                                    Description

                                    <textarea
                                        rows="3"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                description: e.target.value
                                            })
                                        }
                                    />
                                </label>


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={closeForm}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="primary-button"
                                    >
                                        {editingId
                                            ? "Save Changes"
                                            : "Add Product"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


                {/* STOCK IN / OUT MODAL */}

                {showTransactionForm && (

                    <div className="modal-overlay">

                        <div className="product-modal">

                            <div className="modal-heading">

                                <div>

                                    <h2>
                                        Stock {transactionType}
                                    </h2>

                                    <p>
                                        Product: {
                                            products.find(
                                                (p) => p._id === selectedProduct
                                            )?.name
                                        }
                                    </p>

                                </div>

                                <button
                                    className="icon-button"
                                    onClick={() => setShowTransactionForm(false)}
                                >
                                    <X />
                                </button>

                            </div>


                            <form onSubmit={handleTransactionSubmit}>

                                <label>
                                    Transaction Type

                                    <select
                                        value={transactionType}
                                        onChange={(e) =>
                                            setTransactionType(e.target.value)
                                        }
                                    >
                                        <option value="IN">Stock IN</option>
                                        <option value="OUT">Stock OUT</option>
                                    </select>

                                </label>


                                <label className="description-label">
                                    Quantity

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        value={transactionQuantity}
                                        onChange={(e) =>
                                            setTransactionQuantity(e.target.value)
                                        }
                                        placeholder="Enter quantity"
                                    />
                                </label>


                                <label className="description-label">
                                    Note

                                    <textarea
                                        rows="3"
                                        value={transactionNote}
                                        onChange={(e) =>
                                            setTransactionNote(e.target.value)
                                        }
                                        placeholder="Example: New stock received or stock sold"
                                    />

                                </label>


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() =>
                                            setShowTransactionForm(false)
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={transactionLoading}
                                    >
                                        {transactionLoading
                                            ? "Processing..."
                                            : `Confirm Stock ${transactionType}`}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );
}

export default Dashboard;
