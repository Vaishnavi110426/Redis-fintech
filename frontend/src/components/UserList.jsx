/**
 * UserList.jsx - User List Component
 * 
 * Displays users in a table with two fetch modes:
 * 1. MySQL Direct - Always queries the database
 * 2. Redis Cache  - Checks cache first, falls back to MySQL
 * 
 * Shows performance metrics (response time, cache status, user count).
 */

import React, { useState } from "react";
import { getUsersFromMySQL, getUsersFromRedis, deleteUser } from "../services/api";

function UserList({ refreshTrigger }) {
    // ─── State ────────────────────────────────────────────────
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [notification, setNotification] = useState(null);

    // ─── Notification Helper ──────────────────────────────────
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // ─── Fetch from MySQL ─────────────────────────────────────
    const fetchFromMySQL = async () => {
        setLoading(true);
        setNotification(null);

        try {
            const res = await getUsersFromMySQL();
            const data = res.data;

            setUsers(data.users || []);
            setMetrics({
                source: data.source,
                cacheStatus: data.cache_status,
                responseTime: data.response_time_ms,
                totalUsers: data.total_users,
            });

            showNotification("info", `📊 Fetched ${data.total_users} users from MySQL in ${data.response_time_ms}ms`);
        } catch (err) {
            showNotification("error", "❌ Failed to fetch from MySQL. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    // ─── Fetch from Redis ─────────────────────────────────────
    const fetchFromRedis = async () => {
        setLoading(true);
        setNotification(null);

        try {
            const res = await getUsersFromRedis();
            const data = res.data;

            setUsers(data.users || []);
            setMetrics({
                source: data.source,
                cacheStatus: data.cache_status,
                responseTime: data.response_time_ms,
                totalUsers: data.total_users,
            });

            const cacheIcon = data.cache_status === "HIT" ? "⚡" : "📦";
            showNotification(
                data.cache_status === "HIT" ? "success" : "info",
                `${cacheIcon} Cache ${data.cache_status} — ${data.total_users} users in ${data.response_time_ms}ms`
            );
        } catch (err) {
            showNotification("error", "❌ Failed to fetch from Redis. Is Redis running?");
        } finally {
            setLoading(false);
        }
    };

    // ─── Delete User ──────────────────────────────────────────
    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"?`)) return;

        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            showNotification("success", `🗑️ User "${userName}" deleted.`);

            // Update count in metrics
            if (metrics) {
                setMetrics((prev) => ({
                    ...prev,
                    totalUsers: prev.totalUsers - 1,
                }));
            }
        } catch (err) {
            showNotification("error", "❌ Failed to delete user.");
        }
    };

    // ─── Get Cache Badge Class ────────────────────────────────
    const getCacheBadgeClass = () => {
        if (!metrics) return "";
        if (metrics.cacheStatus === "HIT") return "hit";
        if (metrics.cacheStatus === "MISS") return "miss";
        return "na";
    };

    return (
        <div className="card fade-in">
            {/* ─── Card Header ─────────────────────────────── */}
            <div className="card-header">
                <div className="card-icon blue">📋</div>
                <div>
                    <div className="card-title">User Directory</div>
                    <div className="card-subtitle">Compare fetch performance</div>
                </div>
            </div>

            {/* ─── Fetch Buttons ───────────────────────────── */}
            <div className="fetch-buttons">
                <button
                    id="btn-fetch-mysql"
                    className="btn btn-mysql"
                    onClick={fetchFromMySQL}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "🐬 Fetch from MySQL"}
                </button>
                <button
                    id="btn-fetch-redis"
                    className="btn btn-redis"
                    onClick={fetchFromRedis}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "⚡ Fetch from Redis"}
                </button>
            </div>

            {/* ─── Notification ────────────────────────────── */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* ─── Metrics Banner ──────────────────────────── */}
            {metrics && (
                <div className="metrics-banner">
                    <div className="metric-item">
                        <div className="metric-label">Source</div>
                        <div
                            className={`metric-value ${metrics.source === "redis" ? "redis" : "mysql"
                                }`}
                        >
                            {metrics.source.toUpperCase()}
                        </div>
                    </div>
                    <div className="metric-item">
                        <div className="metric-label">Response Time</div>
                        <div
                            className={`metric-value ${metrics.responseTime < 5 ? "green" : "amber"
                                }`}
                        >
                            {metrics.responseTime}ms
                        </div>
                    </div>
                    <div className="metric-item">
                        <div className="metric-label">Cache Status</div>
                        <div>
                            <span className={`cache-badge ${getCacheBadgeClass()}`}>
                                {metrics.cacheStatus}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Loading State ───────────────────────────── */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <div className="loading-text">Fetching users...</div>
                </div>
            )}

            {/* ─── Empty State ─────────────────────────────── */}
            {!loading && users.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">👆</div>
                    <div className="empty-state-title">No users loaded</div>
                    <div className="empty-state-desc">
                        Click a fetch button above to load users from MySQL or Redis.
                    </div>
                </div>
            )}

            {/* ─── User Table ──────────────────────────────── */}
            {!loading && users.length > 0 && (
                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Age</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.age}</td>
                                    <td>
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(user.id, user.name)}
                                            title="Delete user"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default UserList;
