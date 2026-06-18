import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    lawyerId: "",
    clientId: "",
    type: "Initial Consultation",
    date: "",
    duration: "30",
    notes: ""
  });
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]); // This will hold either lawyers or clients based on role

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    fetchConsultations();
    fetchUsers();

    // Check for pre-selected lawyer from URL
    const params = new URLSearchParams(window.location.search);
    const preLawyerId = params.get("lawyerId");
    if (preLawyerId) {
      setFormData(prev => ({ ...prev, lawyerId: preLawyerId }));
      setShowModal(true);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const endpoint = userRole === 'client' ? 'lawyers' : 'stats/lawyer/' + userId + '/clients';
      const res = await fetch(`${API_URL}/${endpoint}`);
      const data = await res.json();
      setUsers(userRole === 'client' ? (data.lawyers || []) : (data.clients || []));
    } catch (err) { console.error(err); }
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/consultations?userId=${userId}&role=${userRole}`
      );
      const data = await response.json();
      setConsultations(data.consultations || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/consultations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: userRole === 'client' ? userId : formData.clientId,
          lawyerId: userRole === 'lawyer' ? userId : formData.lawyerId,
          type: formData.type,
          scheduledDate: formData.date,
          duration: formData.duration,
          notes: formData.notes
        })
      });

      if (res.ok) {
        alert("Consultation scheduled successfully!");
        setShowModal(false);
        fetchConsultations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "#fd7e14",
      confirmed: "#28a745",
      completed: "#4B79A1",
      cancelled: "#dc3545"
    };
    return colors[status] || "#6c757d";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          style={styles.backButton}
          onClick={() => navigate(userRole === 'client' ? "/client-dashboard" : "/lawyer-dashboard")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Workspace
        </button>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Consultation Hub</h1>
            <p style={styles.subtitle}>Synchronize your legal meetings and strategy sessions</p>
          </div>
          <button style={styles.scheduleBtn} onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Schedule Meeting
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div className="spinner"></div>
          <p>Synchronizing Meeting Data...</p>
        </div>
      ) : consultations.length === 0 ? (
        <div style={styles.noData}>
          <div style={styles.noDataIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <h3 style={styles.noDataTitle}>No Active Consultations</h3>
          <p style={styles.noDataText}>Initialize your first strategy session with a legal expert.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {consultations.map((consult) => (
            <div key={consult.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderInfo}>
                  <div style={styles.userIconCircle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <div>
                    <h3 style={styles.cardTitle}>
                      {userRole === 'client' ? consult.lawyer_name : consult.client_name}
                    </h3>
                    <p style={styles.consultType}>{consult.consultation_type}</p>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(consult.status) + "15",
                    color: getStatusColor(consult.status)
                  }}
                >
                  {consult.status}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <div style={styles.infoIconBox}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <span>{new Date(consult.scheduled_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoIconBox}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <span>{new Date(consult.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={styles.infoRow}>
                  <div style={styles.infoIconBox}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <span>{consult.duration} min session</span>
                </div>
                {consult.fee && (
                  <div style={styles.infoRow}>
                    <div style={styles.infoIconBox}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <span>Fee: ${consult.fee}</span>
                  </div>
                )}
              </div>

              <div style={styles.cardActions}>
                {consult.status === 'scheduled' && (
                  <button style={styles.joinButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                    Join Workspace
                  </button>
                )}
                <button style={styles.detailsButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  Review Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ color: '#304352', marginBottom: '20px' }}>Schedule Consultation</h2>
            <form onSubmit={handleSchedule} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select {userRole === 'client' ? 'Lawyer' : 'Client'}</label>
                <select
                  value={userRole === 'client' ? formData.lawyerId : formData.clientId}
                  required
                  onChange={e => setFormData({
                    ...formData,
                    [userRole === 'client' ? 'lawyerId' : 'clientId']: e.target.value
                  })}
                  style={styles.input}
                >
                  <option value="">Choose a {userRole === 'client' ? 'lawyer' : 'client'}...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.specialization ? `(${u.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Consultation Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  style={styles.input}
                >
                  <option value="Initial Consultation">Initial Consultation</option>
                  <option value="Case Review">Case Review</option>
                  <option value="Legal Advice">Legal Advice</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Book Now</button>
              </div>
            </form>
          </div>
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
  loading: {
    textAlign: "center",
    padding: "100px",
    color: "#64748b",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  noData: {
    textAlign: "center",
    padding: "120px 40px",
    backgroundColor: "#fff",
    borderRadius: "32px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  noDataIcon: {
    color: "#cbd5e1",
    marginBottom: "25px",
  },
  noDataTitle: {
    fontSize: "1.6rem",
    color: "#0f172a",
    fontWeight: "800",
    marginBottom: "12px",
  },
  noDataText: {
    color: "#64748b",
    maxWidth: "400px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.25s, box-shadow 0.25s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },
  cardHeaderInfo: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  userIconCircle: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "1.3rem",
    color: "#0f172a",
    marginBottom: "4px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  consultType: {
    fontSize: "0.85rem",
    color: "#2563eb",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statusBadge: {
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "0.75rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  cardBody: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.9rem",
    color: "#475569",
    fontWeight: "600",
  },
  infoIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  cardActions: {
    display: "flex",
    gap: "15px",
  },
  joinButton: {
    flex: 1.2,
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
  detailsButton: {
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
  },
  scheduleBtn: {
    padding: "16px 28px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "16px",
    fontWeight: "800",
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
    display: "flex",
    alignItems: "center",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOverlay: {
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
  modal: {
    backgroundColor: "#fff",
    padding: "45px",
    borderRadius: "36px",
    width: "520px",
    boxShadow: "0 40px 80px rgba(0,0,0,0.2)",
  },
  form: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "16px 20px",
    borderRadius: "16px",
    border: "2px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    fontSize: "1rem",
    color: "#0f172a",
    outline: "none",
    fontWeight: "500",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "16px 28px",
    borderRadius: "16px",
    border: "none",
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: "700",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "16px 28px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
  },
};
