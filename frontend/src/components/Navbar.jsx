/**
 * Navbar.jsx - Application Navigation Bar
 * 
 * Displays the app title and a live status indicator.
 */

import React from "react";

function Navbar() {
    return (
        <nav className="navbar">
            {/* ─── Brand ──────────────────────────────────── */}
            <div className="navbar-brand">
                <div className="navbar-logo">⚡</div>
                <div>
                    <div className="navbar-title">Redis vs MySQL</div>
                    <div className="navbar-subtitle">Performance Benchmark</div>
                </div>
            </div>

            {/* ─── Status Indicator ───────────────────────── */}
            <div className="navbar-status">
                <span className="status-dot"></span>
                API Connected
            </div>
        </nav>
    );
}

export default Navbar;
