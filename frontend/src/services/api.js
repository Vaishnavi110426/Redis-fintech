/**
 * api.js - Centralized API Service
 * 
 * All HTTP requests to the FastAPI backend are defined here.
 * This keeps API logic separate from UI components.
 */

import axios from "axios";

// Base URL for the FastAPI backend
const API = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 15000, // 15 second timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── USER ENDPOINTS ────────────────────────────────────────────────────

/**
 * Create a new user
 * @param {{ name: string, email: string, age: number }} userData
 */
export const createUser = (userData) => API.post("/users", userData);

/**
 * Fetch all users directly from MySQL (no caching)
 */
export const getUsersFromMySQL = () => API.get("/users/mysql");

/**
 * Fetch all users via Redis cache
 * - Returns cached data if available (CACHE HIT)
 * - Otherwise fetches from MySQL and caches the result (CACHE MISS)
 */
export const getUsersFromRedis = () => API.get("/users/redis");

/**
 * Fetch a single user by ID
 * @param {number} userId
 */
export const getUserById = (userId) => API.get(`/users/${userId}`);

/**
 * Update a user
 * @param {number} userId
 * @param {{ name?: string, email?: string, age?: number }} userData
 */
export const updateUser = (userId, userData) => API.put(`/users/${userId}`, userData);

/**
 * Delete a user
 * @param {number} userId
 */
export const deleteUser = (userId) => API.delete(`/users/${userId}`);

// ─── CACHE ENDPOINTS ──────────────────────────────────────────────────

/** Get cache status info */
export const getCacheInfo = () => API.get("/cache/info");

/** Manually clear the Redis cache */
export const clearCache = () => API.delete("/cache/clear");

export default API;
