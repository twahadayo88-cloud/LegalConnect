import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    specialization: "General Practice",
  });

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
      const response = await axios.post(`${API_URL}/auth/signup`, formData);

      if (response.status === 200) {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.msg || "Something went wrong. Please try again.");
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
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
          </div>
          <h1 style={styles.brandTitle}>Join LegalConnect</h1>
          <p style={styles.brandTagline}>Your Gateway to Professional Legal Services</p>
        </div>

        <div style={styles.benefitsSection}>
          <h3 style={styles.benefitsTitle}>The Network for Justice</h3>

          <div style={styles.benefitItem}>
            <div style={styles.benefitIconBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <h4 style={styles.benefitHeading}>For Clients</h4>
              <p style={styles.benefitText}>
                Connect with verified lawyers, schedule consultations instantly
              </p>
            </div>
          </div>

          <div style={styles.benefitItem}>
            <div style={styles.benefitIconBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
            </div>
            <div>
              <h4 style={styles.benefitHeading}>For Lawyers</h4>
              <p style={styles.benefitText}>
                Expand your client base and streamline case management
              </p>
            </div>
          </div>

          <div style={styles.benefitItem}>
            <div style={styles.benefitIconBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div>
              <h4 style={styles.benefitHeading}>Real-time Support</h4>
              <p style={styles.benefitText}>
                End-to-end encrypted communication for all your legal needs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.signupContainer}>
          <div style={styles.signupHeader}>
            <h2 style={styles.heading}>Create Your Account</h2>
            <p style={styles.subheading}>Get started in less than a minute</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>I am joining as...</label>
              <div style={styles.roleSelector}>
                <label style={{
                  ...styles.roleOption,
                  ...(formData.role === "client" ? styles.roleOptionActive : {})
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === "client"}
                    onChange={handleChange}
                    style={styles.radioInput}
                  />
                  <div>
                    <div style={styles.roleIconBox}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div style={styles.roleTitle}>Client</div>
                    <div style={styles.roleDesc}>Looking for legal help</div>
                  </div>
                </label>

                <label style={{
                  ...styles.roleOption,
                  ...(formData.role === "lawyer" ? styles.roleOptionActive : {})
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="lawyer"
                    checked={formData.role === "lawyer"}
                    onChange={handleChange}
                    style={styles.radioInput}
                  />
                  <div>
                    <div style={styles.roleIconBox}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
                    </div>
                    <div style={styles.roleTitle}>Lawyer</div>
                    <div style={styles.roleDesc}>Offering legal services</div>
                  </div>
                </label>
              </div>
            </div>

            {formData.role === "lawyer" && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Legal Specialization</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                  </span>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="General Practice">General Practice</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Tax Law">Tax Law</option>
                    <option value="Real Estate Law">Real Estate Law</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Free Account"}
            </button>
          </form>

          {message && <p style={styles.success}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine}></span>
          </div>

          <Link to="/login" style={styles.loginButton}>
            Sign in to Your Account
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
    backgroundImage: "url('/assets/signup_bg.png')",
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
    color: "#fff",
  },
  logoIcon: {
    marginBottom: "20px",
    color: "#fff",
    background: "rgba(255,255,255,0.15)",
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  brandTitle: {
    fontSize: "3rem",
    fontWeight: "900",
    marginBottom: "10px",
    letterSpacing: "-2px",
    color: "#fff",
  },
  brandTagline: {
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
  },
  benefitsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
    zIndex: 2,
    color: "#fff",
  },
  benefitsTitle: {
    fontSize: "1.3rem",
    marginBottom: "5px",
    fontWeight: "700",
    color: "#fff",
  },
  benefitItem: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: "20px",
    borderRadius: "20px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  benefitIconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    flexShrink: 0,
  },
  benefitHeading: {
    fontSize: "1rem",
    marginBottom: "4px",
    fontWeight: "700",
    color: "#fff",
  },
  benefitText: {
    fontSize: "0.85rem",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: "1.5",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#fff",
  },
  signupContainer: {
    width: "100%",
    maxWidth: "520px",
    padding: "20px",
  },
  signupHeader: {
    textAlign: "center",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "2.5rem",
    color: "#0f172a",
    marginBottom: "10px",
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
    gap: "22px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
    left: "18px",
    color: "#94a3b8",
  },
  input: {
    width: "100%",
    padding: "14px 18px 14px 48px",
    fontSize: "1rem",
    borderRadius: "16px",
    border: "2px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    transition: "all 0.3s ease",
    outline: "none",
    color: "#0f172a",
    fontWeight: "500",
  },
  roleSelector: {
    display: "flex",
    gap: "15px",
  },
  roleOption: {
    flex: 1,
    padding: "20px 15px",
    border: "2px solid #f1f5f9",
    borderRadius: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc",
  },
  roleOptionActive: {
    borderColor: "#2563eb",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
    boxShadow: "0 0 0 1px #2563eb",
  },
  radioInput: {
    display: "none",
  },
  roleIconBox: {
    fontSize: "1.8rem",
    marginBottom: "12px",
    color: "#2563eb",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: {
    fontSize: "1rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "4px",
  },
  roleDesc: {
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: "500",
  },
  button: {
    padding: "18px",
    fontSize: "1.1rem",
    borderRadius: "16px",
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
    margin: "30px 0",
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
  loginButton: {
    display: "block",
    textAlign: "center",
    padding: "16px",
    fontSize: "1rem",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    background: "#fff",
    color: "#0f172a",
    fontWeight: "700",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
  success: {
    color: "#10b981",
    marginTop: "15px",
    fontSize: "0.95rem",
    textAlign: "center",
    fontWeight: "700",
    padding: "10px",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: "12px",
  },
  error: {
    color: "#ef4444",
    marginTop: "15px",
    fontSize: "0.95rem",
    textAlign: "center",
    fontWeight: "700",
    padding: "10px",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: "12px",
  },
};
