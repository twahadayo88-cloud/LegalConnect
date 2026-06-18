import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      const { data } = response;

      if (response.status === 200) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);

        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          if (data.user.role === "client") navigate("/client-dashboard");
          else if (data.user.role === "lawyer") navigate("/lawyer-dashboard");
        }, 1000);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.msg || "Invalid credentials");
      } else {
        setError("Cannot connect to server. Please check if backend is running.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftPanel}>
        <div style={styles.overlay}></div>
        <div style={styles.brandSection}>
          <div style={styles.logoIcon}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
          </div>
          <h1 style={styles.brandTitle}>LegalConnect</h1>
          <p style={styles.brandTagline}>Connecting Justice, One Case at a Time</p>
        </div>

        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <div style={styles.iconCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <h3 style={styles.infoTitle}>Expert Legal Counsel</h3>
              <p style={styles.infoText}>
                Access top-rated lawyers specialized in various fields of law
              </p>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.iconCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <div>
              <h3 style={styles.infoTitle}>Secure & Confidential</h3>
              <p style={styles.infoText}>
                Your case details are protected with end-to-end encryption
              </p>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.iconCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div>
              <h3 style={styles.infoTitle}>Seamless Experience</h3>
              <p style={styles.infoText}>
                Manage consultations, documents, and communication in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.loginContainer}>
          <div style={styles.loginHeader}>
            <h2 style={styles.heading}>Welcome Back</h2>
            <p style={styles.subheading}>Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login to Workspace"}
            </button>
          </form>

          {message && <p style={styles.success}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine}></span>
          </div>

          <Link to="/signup" style={styles.signupButton}>
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f8f9fa",
  },
  leftPanel: {
    flex: 1,
    backgroundImage: "url('/assets/login_bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "60px 50px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(147, 51, 234, 0.6) 100%)",
    zIndex: 1,
  },
  brandSection: {
    marginBottom: "40px",
    position: "relative",
    zIndex: 2,
  },
  brandTitle: {
    fontSize: "3.5rem",
    fontWeight: "900",
    marginBottom: "10px",
    letterSpacing: "-2px",
    color: "#fff",
  },
  brandTagline: {
    fontSize: "1.2rem",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    position: "relative",
    zIndex: 2,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: "25px",
    borderRadius: "24px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    flexShrink: 0,
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
  },
  logoIcon: {
    marginBottom: "20px",
    color: "#fff",
    background: "rgba(255,255,255,0.15)",
    width: "100px",
    height: "100px",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  infoTitle: {
    fontSize: "1.15rem",
    marginBottom: "5px",
    fontWeight: "700",
    color: "#fff",
  },
  infoText: {
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: "1.6",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#fff",
  },
  loginContainer: {
    width: "100%",
    maxWidth: "480px",
    padding: "20px",
  },
  loginHeader: {
    textAlign: "center",
    marginBottom: "45px",
  },
  heading: {
    fontSize: "2.5rem",
    color: "#0f172a",
    marginBottom: "12px",
    fontWeight: "900",
    letterSpacing: "-1.5px",
  },
  subheading: {
    fontSize: "1.05rem",
    color: "#64748b",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#334155",
    marginLeft: "4px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "20px",
    color: "#94a3b8",
  },
  input: {
    width: "100%",
    padding: "18px 20px 18px 52px",
    fontSize: "1rem",
    borderRadius: "18px",
    border: "2px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    transition: "all 0.3s ease",
    outline: "none",
    color: "#0f172a",
    fontWeight: "500",
  },
  button: {
    padding: "18px",
    fontSize: "1.1rem",
    borderRadius: "18px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    margin: "35px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#f1f5f9",
  },
  dividerText: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  signupButton: {
    display: "block",
    textAlign: "center",
    padding: "18px",
    fontSize: "1rem",
    borderRadius: "18px",
    border: "2px solid #e2e8f0",
    background: "#fff",
    color: "#0f172a",
    fontWeight: "700",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
  success: {
    color: "#10b981",
    marginTop: "20px",
    fontSize: "0.95rem",
    textAlign: "center",
    fontWeight: "700",
    padding: "12px",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: "12px",
  },
  error: {
    color: "#ef4444",
    marginTop: "20px",
    fontSize: "0.95rem",
    textAlign: "center",
    fontWeight: "700",
    padding: "12px",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: "12px",
  },
};
