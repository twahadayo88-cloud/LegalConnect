import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand} onClick={() => navigate("/")} role="button">
        <div style={styles.logoIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
        </div>
        <h2 style={styles.logoText}>LegalConnect</h2>
      </div>

      <div style={styles.menu}>
        <div style={styles.userBadge}>
          <div style={styles.userAvatar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <span style={styles.greeting}>
            {role === "client" ? "Client Portal" : "Lawyer Portal"}
          </span>
        </div>

        <div style={styles.divider}></div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    padding: "12px 30px",
    borderRadius: "20px",
    marginBottom: "30px",
    color: "#0f172a",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    border: "1px solid rgba(241, 245, 249, 0.2)",
    fontFamily: "'Inter', sans-serif",
    position: 'sticky',
    top: '20px',
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
  },
  logoText: {
    margin: 0,
    fontWeight: "900",
    fontSize: "1.4rem",
    letterSpacing: "-0.5px",
    color: "#0f172a",
  },
  menu: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 14px 6px 6px",
    backgroundColor: "#f8fafc",
    borderRadius: "50px",
    border: "1px solid #f1f5f9",
  },
  userAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  greeting: {
    fontWeight: "700",
    color: "#475569",
    fontSize: "0.85rem",
  },
  divider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#e2e8f0",
  },
  logoutButton: {
    background: "transparent",
    color: "#ef4444",
    border: "none",
    borderRadius: "12px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
    ":hover": {
      background: "rgba(239, 68, 68, 0.05)",
    }
  },
};
