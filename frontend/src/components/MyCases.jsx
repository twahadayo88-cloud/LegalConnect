import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

export default function MyCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    caseType: "Civil Law",
    priority: "medium"
  });

  // Match-making states
  const [matchingCase, setMatchingCase] = useState(null);
  const [matchedLawyer, setMatchedLawyer] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/cases?userId=${userId}&role=${userRole}`
      );
      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/cases/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: userId,
          ...newCase
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewCase({ title: "", description: "", caseType: "Civil Law", priority: "medium" });
        fetchCases();
        alert("Case created successfully!");
      }
    } catch (error) {
      console.error("Error creating case:", error);
      alert("Failed to create case");
    }
  };

  const handleAutoMatch = async (caseItem) => {
    setMatchingCase(caseItem);
    setIsMatching(true);
    setMatchedLawyer(null);

    try {
      // Simulate Deep Matching process
      const response = await fetch(`${API_URL}/lawyers?specialization=${encodeURIComponent(caseItem.case_type)}&minRating=4.0`);
      const data = await response.json();
      
      setTimeout(() => {
        if (data.lawyers && data.lawyers.length > 0) {
          setMatchedLawyer(data.lawyers[0]); // Recommended Top Lawyer
        }
        setIsMatching(false);
      }, 2000); // UI delay for 'analyzing' effect

    } catch (error) {
      console.error("Match error:", error);
      setIsMatching(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#fd7e14",
      active: "#28a745",
      completed: "#4B79A1",
      cancelled: "#dc3545"
    };
    return colors[status] || "#6c757d";
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: "🟢",
      medium: "🟡",
      high: "🟠",
      urgent: "🔴"
    };
    return icons[priority] || "⚪";
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate("/client-dashboard")}>
          ← Back to Dashboard
        </button>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>My Cases</h1>
            <p style={styles.subtitle}>View and manage all your legal cases</p>
          </div>
          <button
            style={styles.createButton}
            onClick={() => setShowCreateForm(true)}
          >
            + Create New Case
          </button>
        </div>
      </div>

      {/* Create Case Form Modal */}
      {showCreateForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Case</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Case Title *</label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Property Dispute Case"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  style={styles.textarea}
                  placeholder="Describe your case in detail..."
                  rows="4"
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Case Type *</label>
                  <select
                    value={newCase.caseType}
                    onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                    style={styles.select}
                  >
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Tax Law">Tax Law</option>
                    <option value="Real Estate Law">Real Estate Law</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Priority *</label>
                  <select
                    value={newCase.priority}
                    onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
                    style={styles.select}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cases List */}
      {loading ? (
        <div style={styles.loading}>Loading cases...</div>
      ) : cases.length === 0 ? (
        <div style={styles.noCases}>
          <div style={styles.noCasesIcon}>📋</div>
          <h3 style={styles.noCasesTitle}>No Cases Yet</h3>
          <p style={styles.noCasesText}>Create your first case to get started</p>
          <button
            style={styles.createFirstButton}
            onClick={() => setShowCreateForm(true)}
          >
            + Create Your First Case
          </button>
        </div>
      ) : (
        <div style={styles.casesGrid}>
          {cases.map((caseItem) => (
            <div key={caseItem.id} style={styles.caseCard}>
              <div style={styles.caseHeader}>
                <div>
                  <h3 style={styles.caseTitle}>{caseItem.title}</h3>
                  <p style={styles.caseType}>{caseItem.case_type}</p>
                </div>
                <div style={styles.priorityBadge}>
                  {getPriorityIcon(caseItem.priority)} {caseItem.priority}
                </div>
              </div>

              <p style={styles.caseDescription}>
                {caseItem.description?.substring(0, 150)}
                {caseItem.description?.length > 150 ? "..." : ""}
              </p>

              <div style={styles.caseInfo}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Status:</span>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(caseItem.status) + "20",
                      color: getStatusColor(caseItem.status)
                    }}
                  >
                    {caseItem.status}
                  </span>
                </div>

                {caseItem.lawyer_name && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Lawyer:</span>
                    <span style={styles.infoValue}>{caseItem.lawyer_name}</span>
                  </div>
                )}

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Created:</span>
                  <span style={styles.infoValue}>
                    {new Date(caseItem.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={styles.caseActions}>
                <button style={styles.viewButton}>
                  View Details
                </button>
                {!caseItem.lawyer_id && (
                  <>
                    <button
                      style={{...styles.hireLawyerButton, background: '#fff', color: '#2563eb', border: '2px solid #2563eb', boxShadow: 'none'}}
                      onClick={() => navigate("/find-lawyers")}
                    >
                      Browse manually
                    </button>
                    <button
                      style={styles.hireLawyerButton}
                      onClick={() => handleAutoMatch(caseItem)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                      Smart Match
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Match Modal */}
      {matchingCase && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '500px', textAlign: 'center'}}>
            
            {isMatching ? (
              <div style={{ padding: '40px 20px' }}>
                <div style={styles.radarIcon}>
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="spin-anim"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                </div>
                <h2 style={{fontSize: '1.6rem', fontWeight: '800', marginBottom: '10px'}}>Analyzing Case Variables...</h2>
                <p style={{color: '#64748b'}}>Deep matching with top {matchingCase.case_type} professionals on our network based on ratings and experience.</p>
              </div>
            ) : matchedLawyer ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={styles.closeButton} onClick={() => setMatchingCase(null)}>✕</button>
                </div>
                <div style={styles.matchBadge}>98% Match</div>
                <h2 style={{fontSize: '1.8rem', fontWeight: '900', marginBottom: '20px'}}>Perfect Expert Found</h2>
                
                <div style={styles.matchedProfileCard}>
                  <div style={{...styles.aiHeaderIcon, background: 'linear-gradient(135deg, #10b981, #059669)', width: '70px', height: '70px'}}>
                    {matchedLawyer.name.charAt(0)}
                  </div>
                  <h3 style={{fontSize: '1.5rem', fontWeight: '800', margin: '15px 0 5px 0'}}>
                    {matchedLawyer.name}
                    {matchedLawyer.is_verified && (
                      <span style={{ marginLeft: "6px", color: "#3b82f6" }} title="Verified">✓</span>
                    )}
                  </h3>
                  <p style={{color: '#2563eb', fontWeight: '700', marginBottom: '15px'}}>{matchedLawyer.specialization}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <span style={{display:'block', fontWeight: '800', fontSize: '1.2rem'}}>{matchedLawyer.rating}</span>
                      <span style={{fontSize: '0.8rem', color: '#64748b'}}>Rating</span>
                    </div>
                    <div>
                      <span style={{display:'block', fontWeight: '800', fontSize: '1.2rem'}}>{matchedLawyer.years_of_experience || 0} Yrs</span>
                      <span style={{fontSize: '0.8rem', color: '#64748b'}}>Exp</span>
                    </div>
                  </div>

                  <p style={{color: '#475569', fontSize: '0.95rem', marginBottom: '25px', padding: '0 20px'}}>
                    {matchedLawyer.bio ? matchedLawyer.bio.substring(0, 80) + "..." : "Elite professional recognized for outstanding results."}
                  </p>

                  <button 
                    style={{...styles.submitButton, width: '100%', padding: '16px'}}
                    onClick={() => navigate(`/messages/${matchedLawyer.id}`)}
                  >
                    Initiate Contact
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={styles.closeButton} onClick={() => setMatchingCase(null)}>✕</button>
                </div>
                <div style={styles.radarIcon}>
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h2 style={{fontSize: '1.8rem', fontWeight: '900', marginBottom: '10px'}}>No Exact Match Found</h2>
                <p style={{color: '#64748b', marginBottom: '20px'}}>We couldn't auto-match an elite lawyer for this specific criteria right now.</p>
                <button style={{...styles.submitButton, width: '100%'}} onClick={() => navigate("/find-lawyers")}>
                  Browse Manually
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styles for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      ` }} />
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
    padding: "12px 24px",
    border: "none",
    backgroundColor: "#fff",
    color: "#2563eb",
    borderRadius: "12px",
    fontSize: "0.95rem",
    cursor: "pointer",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    fontWeight: "700",
    border: "1px solid #f1f5f9",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "2.5rem",
    color: "#0f172a",
    marginBottom: "10px",
    fontWeight: "900",
    letterSpacing: "-1.5px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
  },
  createButton: {
    padding: "14px 28px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "32px",
    padding: "40px",
    width: "90%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  modalTitle: {
    fontSize: "2rem",
    color: "#0f172a",
    fontWeight: "900",
    letterSpacing: "-1px",
  },
  closeButton: {
    border: "none",
    backgroundColor: "#f1f5f9",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#64748b",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    padding: "14px 20px",
    fontSize: "1rem",
    border: "2px solid #f1f5f9",
    borderRadius: "14px",
    outline: "none",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontWeight: "500",
  },
  textarea: {
    padding: "14px 20px",
    fontSize: "1rem",
    border: "2px solid #f1f5f9",
    borderRadius: "14px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontWeight: "500",
  },
  select: {
    padding: "14px 20px",
    fontSize: "1rem",
    border: "2px solid #f1f5f9",
    borderRadius: "14px",
    outline: "none",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "500",
  },
  formActions: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "10px",
  },
  cancelButton: {
    padding: "14px 28px",
    border: "1px solid #e2e8f0",
    backgroundColor: "transparent",
    color: "#64748b",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  submitButton: {
    padding: "14px 28px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
  },
  loading: {
    textAlign: "center",
    padding: "80px",
    fontSize: "1.3rem",
    color: "#64748b",
    fontWeight: "600",
  },
  noCases: {
    textAlign: "center",
    padding: "100px 40px",
    backgroundColor: "#fff",
    borderRadius: "28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
  },
  noCasesIcon: {
    fontSize: "5rem",
    marginBottom: "25px",
    opacity: 0.1,
  },
  noCasesTitle: {
    fontSize: "2rem",
    color: "#0f172a",
    marginBottom: "10px",
    fontWeight: "800",
  },
  noCasesText: {
    fontSize: "1.1rem",
    color: "#64748b",
    marginBottom: "30px",
    fontWeight: "500",
  },
  createFirstButton: {
    padding: "16px 32px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "16px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
  },
  casesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "30px",
  },
  caseCard: {
    backgroundColor: "#fff",
    borderRadius: "28px",
    padding: "35px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.3s ease",
  },
  caseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  caseTitle: {
    fontSize: "1.5rem",
    color: "#0f172a",
    marginBottom: "6px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  caseType: {
    fontSize: "0.95rem",
    color: "#2563eb",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  priorityBadge: {
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    border: "1px solid #f1f5f9",
  },
  caseDescription: {
    fontSize: "0.95rem",
    color: "#475569",
    lineHeight: "1.6",
    marginBottom: "25px",
  },
  caseInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  infoLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: "0.9rem",
    color: "#0f172a",
    fontWeight: "700",
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  caseActions: {
    display: "flex",
    gap: "12px",
  },
  viewButton: {
    flex: 1,
    padding: "14px",
    border: "2px solid #f1f5f9",
    backgroundColor: "#fff",
    color: "#0f172a",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  hireLawyerButton: {
    flex: 1,
    padding: "14px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "14px",
    fontSize: "0.95rem",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(37, 99, 235, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  radarIcon: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 30px auto"
  },
  matchBadge: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#d1fae5",
    color: "#059669",
    borderRadius: "20px",
    fontWeight: "900",
    fontSize: "0.85rem",
    marginBottom: "15px",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  matchedProfileCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "24px",
    padding: "30px",
    border: "1px solid #f1f5f9"
  },
  aiHeaderIcon: {
    borderRadius: "20px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    fontSize: "2rem",
    fontWeight: "900",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  }
};