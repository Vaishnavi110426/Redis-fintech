/**
 * UserForm.jsx - Create User Form Component
 * 
 * A controlled form that collects Name, Email, and Age,
 * then sends a POST request to create a new user.
 */

import React, { useState } from "react";
import { createUser } from "../services/api";

function UserForm({ onUserCreated }) {
    // ─── Form State ───────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // ─── Handle Input Changes ─────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ─── Show Notification (auto-dismiss after 4s) ────────────
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // ─── Handle Form Submit ───────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.age) {
            showNotification("error", "Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                age: parseInt(formData.age, 10),
            };

            await createUser(payload);

            showNotification("success", `✅ User "${payload.name}" created successfully!`);

            // Reset form
            setFormData({ name: "", email: "", age: "" });

            // Notify parent component
            if (onUserCreated) {
                onUserCreated();
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.detail || "Failed to create user. Check backend.";
            showNotification("error", `❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in">
            {/* ─── Card Header ─────────────────────────────── */}
            <div className="card-header">
                <div className="card-icon green">➕</div>
                <div>
                    <div className="card-title">Add New User</div>
                    <div className="card-subtitle">Create a user in MySQL</div>
                </div>
            </div>

            {/* ─── Notification ────────────────────────────── */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* ─── Form ────────────────────────────────────── */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="user-name">Full Name</label>
                    <input
                        id="user-name"
                        className="form-input"
                        type="text"
                        name="name"
                        placeholder="e.g. Alice Johnson"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="user-email">Email Address</label>
                    <input
                        id="user-email"
                        className="form-input"
                        type="email"
                        name="email"
                        placeholder="e.g. alice@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="user-age">Age</label>
                    <input
                        id="user-age"
                        className="form-input"
                        type="number"
                        name="age"
                        placeholder="e.g. 25"
                        min="1"
                        max="150"
                        value={formData.age}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <button
                    id="btn-create-user"
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                            Creating...
                        </>
                    ) : (
                        "Create User"
                    )}
                </button>
            </form>
        </div>
    );
}

export default UserForm;
