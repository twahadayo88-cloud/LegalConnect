import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

export default function FindLawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [minRating, setMinRating] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);

      let url = `${API_URL}/lawyers?`;
      if (searchTerm) url += `search=${searchTerm}&`;
      if (specialization) url += `specialization=${specialization}&`;
      if (minRating) url += `minRating=${minRating}&`;

      const response = await fetch(url);
      const data = await response.json();

      setLawyers(data.lawyers || []);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLawyers();
  };

  const handleBackToDashboard = () => {
    navigate("/client-dashboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleBackToDashboard}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Workspace
        </button>
        <div style={styles.headerTitleRow}>
          <div>
            <h1 style={styles.title}>Legal Experts</h1>
            <p style={styles.subtitle}>Curated network of high-performance legal intelligence</p>
          </div>
          <div style={styles.verifiedBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            100% Verified
          </div>
        </div>
      </div>

      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.inputWrapper}>
            <svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Search expertise, name, or legal domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            style={styles.select}
          >
            <option value="">All Domains</option>
            <option value="Criminal Law">Criminal Law</option>
            <option value="Corporate Law">Corporate Law</option>
            <option value="Family Law">Family Law</option>
            <option value="Civil Law">Civil Law</option>
            <option value="Tax Law">Tax Law</option>
            <option value="Real Estate Law">Real Estate Law</option>
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            style={styles.select}
          >
            <option value="">Any Rating</option>
            <option value="4.5">Elite (4.5+)</option>
            <option value="4.0">Highly Rated (4.0+)</option>
            <option value="3.5">Verified Professionals</option>
          </select>

          <button type="submit" style={styles.searchButton}>
            Search Context
          </button>
        </form>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div className="spinner"></div>
          <p>Synchronizing Expert Data...</p>
        </div>
      ) : lawyers.length === 0 ? (
        <div style={styles.noResults}>
          <div style={styles.noResultsIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <h3 style={styles.noResultsTitle}>No Experts Found</h3>
          <p style={styles.noResultsText}>Refine your search parameters to discover legal intelligence.</p>
        </div>
      ) : (
        <div style={styles.lawyersGrid}>
          {lawyers.map((lawyer) => (
            <div key={lawyer.id} style={styles.lawyerCard}>
              <div style={styles.lawyerHeader}>
                <div style={styles.lawyerAvatarBox}>
                  {lawyer.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.lawyerInfo}>
                  <h3 style={styles.lawyerName}>
                    {lawyer.name}
                    {lawyer.is_verified ? (
                      <span style={{ marginLeft: "8px", color: "#3b82f6", display: "inline-flex", alignItems: "center" }} title="KYC Verified">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" /></svg>
                      </span>
                    ) : null}
                  </h3>
                  <p style={styles.lawyerSpecialization}>{lawyer.specialization || 'General Practice'}</p>
                  <div style={styles.rating}>
                    <div style={styles.starsBox}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    </div>
                    <span style={styles.ratingValue}>{Number(lawyer.rating).toFixed(1)}</span>
                    <span style={styles.reviewCount}>{lawyer.total_reviews || 0} Reviews</span>
                  </div>
                </div>
              </div>

              <div style={styles.lawyerDetails}>
                {lawyer.bio && (
                  <p style={styles.lawyerBio}>{lawyer.bio.substring(0, 100)}...</p>
                )}

                <div style={styles.lawyerMeta}>
                  <div style={styles.metaItem}>
                    <div style={styles.metaIconCircle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <span style={styles.metaText}>
                      {lawyer.years_of_experience || 0}y Experience
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <div style={styles.metaIconCircle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <span style={styles.metaText}>
                      ${lawyer.consultation_fee}/Session
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.lawyerActions}>
                <button
                  style={styles.messageButton}
                  onClick={() => navigate(`/messages/${lawyer.id}`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  Message
                </button>
                <button
                  style={styles.hireButton}
                  onClick={() => navigate(`/consultations?lawyerId=${lawyer.id}`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    padding: "50px",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "40px",
  },
  backButton: {
    padding: "12px 20px",
    border: "none",
    backgroundColor: "#fff",
    color: "#64748b",
    borderRadius: "14px",
    fontSize: "0.95rem",
    cursor: "pointer",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    fontWeight: "700",
    border: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },
  headerTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: "2.5rem",
    color: "#0f172a",
    marginBottom: "5px",
    fontWeight: "900",
    letterSpacing: "-1.5px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    fontWeight: "500",
  },
  verifiedBadge: {
    padding: "8px 16px",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  searchSection: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "28px",
    marginBottom: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  searchForm: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.8fr 0.8fr auto",
    gap: "20px",
    alignItems: "center",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "16px 20px 16px 52px",
    fontSize: "1rem",
    border: "2px solid #f1f5f9",
    borderRadius: "16px",
    outline: "none",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  select: {
    padding: "16px 20px",
    fontSize: "1rem",
    border: "2px solid #f1f5f9",
    borderRadius: "16px",
    outline: "none",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "600",
    appearance: "none",
  },
  searchButton: {
    padding: "16px 35px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
  },
  loading: {
    textAlign: "center",
    padding: "100px",
    color: "#64748b",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  noResults: {
    textAlign: "center",
    padding: "120px 40px",
    backgroundColor: "#fff",
    borderRadius: "32px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  noResultsIcon: {
    color: "#cbd5e1",
    marginBottom: "25px",
  },
  noResultsTitle: {
    fontSize: "1.6rem",
    color: "#0f172a",
    fontWeight: "800",
    marginBottom: "12px",
  },
  noResultsText: {
    color: "#64748b",
    maxWidth: "400px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  lawyersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
  },
  lawyerCard: {
    backgroundColor: "#fff",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.25s, box-shadow 0.25s",
  },
  lawyerHeader: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
  },
  lawyerAvatarBox: {
    width: "70px",
    height: "70px",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: "900",
    flexShrink: 0,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    fontSize: "1.35rem",
    color: "#0f172a",
    marginBottom: "4px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
  },
  lawyerSpecialization: {
    fontSize: "0.85rem",
    color: "#2563eb",
    marginBottom: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  starsBox: {
    color: "#f59e0b",
    display: "flex",
  },
  ratingValue: {
    fontSize: "0.95rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  reviewCount: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: "600",
  },
  lawyerDetails: {
    marginBottom: "25px",
  },
  lawyerBio: {
    fontSize: "0.95rem",
    color: "#475569",
    lineHeight: "1.6",
    marginBottom: "20px",
    fontWeight: "450",
  },
  lawyerMeta: {
    display: "flex",
    gap: "15px",
    padding: "18px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  metaIconCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  metaText: {
    fontSize: "0.85rem",
    color: "#475569",
    fontWeight: "700",
  },
  lawyerActions: {
    display: "flex",
    gap: "15px",
  },
  messageButton: {
    flex: 1,
    padding: "16px",
    border: "2px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#0f172a",
    borderRadius: "16px",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  hireButton: {
    flex: 1,
    padding: "16px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "16px",
    fontSize: "0.95rem",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
