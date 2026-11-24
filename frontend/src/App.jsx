
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;
    });

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
    };

    if (!user) {
        return <Login onLogin={setUser} />;
    }

    return <Dashboard onLogout={handleLogout} />;
}

export default App;
