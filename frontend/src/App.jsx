/**
 * App.jsx - Main Application Component
 * 
 * Assembles the Navbar, UserForm, and UserList into the full layout.
 * Manages the "refresh trigger" so the list can react when a new user is created.
 */

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";

function App() {
    // This counter increments each time a user is created,
    // signaling UserList that it may want to refresh.
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUserCreated = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div>
            {/* ─── Navigation Bar ──────────────────────────── */}
            <Navbar />

            {/* ─── Main Content ────────────────────────────── */}
            <main className="app-container">
                {/* Left Column: Create User Form */}
                <UserForm onUserCreated={handleUserCreated} />

                {/* Right Column: User List + Metrics */}
                <UserList refreshTrigger={refreshTrigger} />
            </main>
        </div>
    );
}

export default App;
