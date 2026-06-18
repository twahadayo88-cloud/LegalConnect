import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

export default function ClientDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [cases, setCases] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [payments, setPayments] = useState([]);
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Client";
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (activeMenu === "dashboard") fetchDashboardData();
    if (activeMenu === "cases") fetchCases();
    if (activeMenu === "consultations") fetchConsultations();
    if (activeMenu === "lawyers") fetchLawyers();
    if (activeMenu === "payments") fetchPayments();
    if (activeMenu === "messages") { setActiveMenu("dashboard"); navigate("/messages"); }
  }, [activeMenu]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/payments?userId=${userId}&role=client`);
      setPayments(res.data.payments || []);
    } catch (err) { console.error("Error fetching payments", err); }
  };

  const fetchLawyers = async () => {
    try {
      let url = `${API_URL}/lawyers?`;
      if (searchTerm) url += `search=${searchTerm}&`;
      if (specialization) url += `specialization=${specialization}&`;
      const res = await axios.get(url);
      setLawyers(res.data.lawyers || []);
    } catch (err) { console.error(err); }
  };

  const fetchCases = async () => {
    try {
      const res = await axios.get(`${API_URL}/cases?userId=${userId}&role=client`);
      setCases(res.data.cases || []);
    } catch (err) { console.error(err); }
  };

  const fetchConsultations = async () => {
    try {
      const res = await axios.get(`${API_URL}/consultations?userId=${userId}&role=client`);
      setConsultations(res.data.consultations || []);
    } catch (err) { console.error(err); }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/stats/client/${userId}`);
      const { data } = response;

      setStats(data.stats);
      setRecentCases(data.recentCases || []);
      setUpcomingConsultations(data.upcomingConsultations || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <div style={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h2 style={styles.logoText}>LegalConnect</h2>
          <p style={styles.logoSubtext}>Client Portal</p>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>{userName}</p>
            <p style={styles.userRole}>Client Account</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "dashboard" ? styles.navButtonActive : {})
            }}
            onClick={() => {
              setActiveMenu("dashboard");
              navigate("/client-dashboard");
            }}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </span>
            Dashboard
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "lawyers" ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveMenu("lawyers")}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            Find Lawyers
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "cases" ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveMenu("cases")}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
            </span>
            My Cases
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "consultations" ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveMenu("consultations")}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </span>
            Consultations
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "payments" ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveMenu("payments")}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </span>
            Payments
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "messages" ? styles.navButtonActive : {})
            }}
            onClick={() => navigate("/messages")}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </span>
            Messages
          </button>
        </nav>

        <button style={styles.logoutButton} onClick={handleLogout}>
          <span style={styles.navIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </span>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>
            {activeMenu === "dashboard" && "Dashboard Overview"}
            {activeMenu === "lawyers" && "Find Expert Lawyers"}
            {activeMenu === "cases" && "My Legal Cases"}
            {activeMenu === "consultations" && "Your Consultations"}
          </h1>
          <p style={styles.pageSubtitle}>
            {activeMenu === "dashboard" && "Welcome back! Here's your legal case overview"}
            {activeMenu === "lawyers" && "Browse our network of verified legal professionals"}
            {activeMenu === "cases" && "Manage your ongoing legal matters and progress"}
            {activeMenu === "consultations" && "View and join your upcoming legal meetings"}
          </p>
        </div>

        <div style={styles.content}>
          {activeMenu === "lawyers" && (
            <>
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Find Expert Lawyers</h3>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input
                      placeholder="Search by name or bio..."
                      style={{ ...styles.input, paddingLeft: '45px' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    style={styles.select}
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  >
                    <option value="">All Specializations</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Civil Law">Civil Law</option>
                  </select>
                  <button style={styles.searchButton} onClick={fetchLawyers}>
                    Search
                  </button>
                </div>

                <div style={styles.lawyersGrid}>
                  {lawyers.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No lawyers found matching your criteria.</p>
                  ) : (
                    lawyers.map(lawyer => (
                      <div key={lawyer.id} style={styles.lawyerCard}>
                        <div style={styles.lawyerHeader}>
                          <div style={styles.lawyerAvatar}>
                            {(lawyer.name || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 style={styles.lawyerName}>{lawyer.name || 'Lawyer'}</h4>
                            <p style={styles.lawyerSpec}>{lawyer.specialization || 'General Practice'}</p>
                            <p style={styles.lawyerRating}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" style={{ marginRight: '4px' }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                              {lawyer.rating ? Number(lawyer.rating).toFixed(1) : '0.0'} ({lawyer.total_reviews || 0} reviews)
                            </p>
                          </div>
                        </div>
                        <div style={styles.lawyerActions}>
                          <button style={styles.whatsappActionBtnProfile} onClick={() => navigate(`/messages/${lawyer.id}`)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            Message
                          </button>
                          <button style={styles.whatsappActionBtnProfilePrimary} onClick={() => navigate(`/consultations?lawyerId=${lawyer.id}`)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Schedule
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeMenu === "dashboard" && (
            <>
              {/* AI Feature Card */}
              <div style={styles.aiCard}>
                <div style={styles.aiCardContent}>
                  <div style={styles.aiIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M12 12L2.69 7a10 10 0 0 1 18.62 0L12 12z" /><path d="M12 12l9.31 5a10 10 0 0 1-18.62 0L12 12z" /></svg>
                  </div>
                  <div>
                    <h3 style={styles.aiTitle}>Not sure where to start?</h3>
                    <p style={styles.aiText}>Use our AI-powered risk assessor to understand your legal standing in minutes.</p>
                  </div>
                </div>
                <button style={styles.aiButton} onClick={() => navigate("/assessor")}>
                  Try AI Assessor
                </button>
              </div>

              {/* Stats Cards */}
              <div style={styles.dashboardGrid}>
                <div style={{ ...styles.statCard, ...styles.statCardBlue }}>
                  <div style={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stats?.activeCases || 0}</p>
                    <p style={styles.statLabel}>Active Cases</p>
                  </div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
                  <div style={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stats?.consultations || 0}</p>
                    <p style={styles.statLabel}>Consultations</p>
                  </div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardPurple }}>
                  <div style={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stats?.lawyersHired || 0}</p>
                    <p style={styles.statLabel}>Lawyers Hired</p>
                  </div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardOrange }}>
                  <div style={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stats?.unreadMessages || 0}</p>
                    <p style={styles.statLabel}>New Messages</p>
                  </div>
                </div>
              </div>

              {/* Recent Cases */}
              {recentCases.length > 0 && (
                <div style={styles.sectionCard}>
                  <h3 style={styles.sectionTitle}>Recent Cases</h3>
                  <div style={styles.casesList}>
                    {recentCases.map(caseItem => (
                      <div key={caseItem.id} style={styles.caseItem}>
                        <div>
                          <h4 style={styles.caseTitle}>{caseItem.title}</h4>
                          <p style={styles.caseDetail}>
                            Lawyer: {caseItem.lawyer_name || 'Not assigned yet'}
                          </p>
                          <p style={styles.caseDetail}>
                            Status: <span style={styles[`status${caseItem.status}`]}>
                              {caseItem.status}
                            </span>
                          </p>
                        </div>
                        <button
                          style={styles.viewButtonDashboard}
                          onClick={() => setActiveMenu("cases")}
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Consultations */}
              {upcomingConsultations.length > 0 && (
                <div style={styles.sectionCard}>
                  <h3 style={styles.sectionTitle}>Upcoming Consultations</h3>
                  <div style={styles.consultationsList}>
                    {upcomingConsultations.map(consultation => (
                      <div key={consultation.id} style={styles.consultationItem}>
                        <div style={styles.consultationIconBox}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={styles.consultationTitle}>
                            {consultation.lawyer_name}
                          </h4>
                          <p style={styles.consultationDate}>
                            {new Date(consultation.scheduled_date).toLocaleString()}
                          </p>
                          <p style={styles.consultationType}>
                            Type: {consultation.consultation_type}
                          </p>
                        </div>
                        <button
                          style={styles.whatsappActionBtnProfilePrimary}
                          onClick={() => setActiveMenu("consultations")}
                        >
                          Join Meeting
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Cards */}
              <div style={styles.actionGrid}>
                <div style={styles.actionCard}>
                  <div style={styles.actionIconBoxBlue}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                  <h3 style={styles.actionTitle}>Find Expert Lawyers</h3>
                  <p style={styles.actionDesc}>
                    Browse through our network of verified legal professionals
                  </p>
                  <button
                    style={styles.actionButton}
                    onClick={() => setActiveMenu("lawyers")}
                  >
                    Browse Lawyers
                  </button>
                </div>

                <div style={styles.actionCard}>
                  <div style={styles.actionIconBoxPurple}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <h3 style={styles.actionTitle}>Schedule Consultation</h3>
                  <p style={styles.actionDesc}>
                    Book instant consultations with lawyers
                  </p>
                  <button
                    style={styles.actionButton}
                    onClick={() => setActiveMenu("consultations")}
                  >
                    View Schedule
                  </button>
                </div>

                <div style={styles.actionCard}>
                  <div style={styles.actionIconBoxGreen}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                  </div>
                  <h3 style={styles.actionTitle}>Manage Documents</h3>
                  <p style={styles.actionDesc}>
                    Securely upload and manage all your legal documents
                  </p>
                  <button
                    style={styles.actionButton}
                    onClick={() => navigate("/documents")}
                  >
                    My Documents
                  </button>
                </div>
              </div>
            </>
          )}

          {activeMenu === "cases" && (
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>My Cases</h3>
              {cases.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIconBox}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                  </div>
                  <h4>No legal cases found</h4>
                  <p>Hire a lawyer or use our AI assessor to start a new case.</p>
                  <button style={styles.whatsappActionBtnProfilePrimary} onClick={() => setActiveMenu("lawyers")}>Find a Lawyer</button>
                </div>
              ) : (
                <div style={styles.casesList}>
                  {cases.map(caseItem => (
                    <div key={caseItem.id} style={styles.caseItem}>
                      <div>
                        <h4 style={styles.caseTitle}>{caseItem.title}</h4>
                        <p style={styles.caseDetail}>Lawyer: {caseItem.lawyer_name || "Searching..."}</p>
                        <p style={styles.caseDetail}>Status: <span style={styles[`status${caseItem.status}`]}>{caseItem.status}</span></p>
                      </div>
                      <button style={styles.viewButtonDashboard} onClick={() => navigate("/documents")}>Documents</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === "consultations" && (
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Consultations</h3>
              {consultations.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIconBox}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <h4>No scheduled meetings</h4>
                  <p>Book a consultation with our verified legal experts.</p>
                  <button style={styles.whatsappActionBtnProfilePrimary} onClick={() => setActiveMenu("lawyers")}>Book Now</button>
                </div>
              ) : (
                <div style={styles.casesList}>
                  {consultations.map(c => (
                    <div key={c.id} style={styles.caseItem}>
                      <div>
                        <h4 style={styles.caseTitle}>{c.lawyer_name}</h4>
                        <p style={styles.caseDetail}>Type: {c.consultation_type}</p>
                        <p style={styles.caseDetail}>Date: {new Date(c.scheduled_date).toLocaleString()}</p>
                      </div>
                      <button style={styles.whatsappActionBtnProfile} onClick={() => navigate(`/messages/${c.lawyer_id}`)}>Message</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === "payments" && (
            <div style={styles.sectionCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{...styles.sectionTitle, marginBottom: 0}}>Billing History</h3>
              </div>

              {payments.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIconBox}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  <h4>No Payment Records Found</h4>
                  <p>Invoices for your hired lawyers will appear here.</p>
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Transaction ID</th>
                        <th style={styles.th}>Paid To (Lawyer)</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id}>
                          <td style={{...styles.td, color: '#64748b', fontSize: '0.85rem'}}>#{payment.id.substring(0,8)}...</td>
                          <td style={{...styles.td, fontWeight: '700'}}>{payment.lawyer_name}</td>
                          <td style={styles.td}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td style={{...styles.td, fontWeight: '800', color: '#0f172a'}}>${payment.amount}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusbadge,
                              ...(payment.status === 'pending' ? styles.statuspending : styles.statuscompleted)
                            }}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f9fafb",
  },
  sidebar: {
    width: "280px",
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: "35px 20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 25px rgba(0,0,0,0.05)",
    zIndex: 10,
  },
  logo: {
    marginBottom: "40px",
    paddingBottom: "25px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    textAlign: "center",
  },
  logoText: {
    fontSize: "1.6rem",
    fontWeight: "900",
    marginBottom: "5px",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-1px",
  },
  logoSubtext: {
    fontSize: "0.8rem",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "600",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "35px",
    padding: "18px",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#fff",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
  },
  userName: {
    fontSize: "0.95rem",
    fontWeight: "700",
    marginBottom: "2px",
    color: "#f8fafc",
  },
  userRole: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    border: "none",
    backgroundColor: "transparent",
    color: "#94a3b8",
    fontSize: "0.95rem",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "14px",
    transition: "all 0.3s ease",
    fontWeight: "600",
  },
  navButtonActive: {
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
  },
  navIcon: {
    fontSize: "1.2rem",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 18px",
    border: "none",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    fontSize: "0.95rem",
    cursor: "pointer",
    borderRadius: "14px",
    marginTop: "25px",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },
  mainContent: {
    flex: 1,
    padding: "50px",
    overflowY: "auto",
    backgroundColor: "#f9fafb",
  },
  header: {
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "2.5rem",
    color: "#0f172a",
    marginBottom: "10px",
    fontWeight: "900",
    letterSpacing: "-1.5px",
  },
  pageSubtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    fontWeight: "400",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "35px",
    maxWidth: "1200px",
  },
  aiCard: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "35px",
    borderRadius: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  aiCardContent: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  aiIcon: {
    fontSize: "3.5rem",
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "22px",
    backdropFilter: "blur(10px)",
  },
  aiTitle: {
    fontSize: "1.6rem",
    fontWeight: "800",
    marginBottom: "8px",
  },
  aiText: {
    fontSize: "1.05rem",
    color: "#94a3b8",
    maxWidth: "400px",
    lineHeight: "1.6",
  },
  aiButton: {
    padding: "16px 32px",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.4)",
    zIndex: 2,
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "25px",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.3s ease",
  },
  statIcon: {
    fontSize: "2rem",
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "2.2rem",
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: "2px",
    letterSpacing: "-1px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statCardBlue: { borderTop: "5px solid #2563eb" },
  statCardGreen: { borderTop: "5px solid #10b981" },
  statCardPurple: { borderTop: "5px solid #9333ea" },
  statCardOrange: { borderTop: "5px solid #f59e0b" },

  sectionCard: {
    backgroundColor: "#fff",
    padding: "35px",
    borderRadius: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: "1.6rem",
    color: "#0f172a",
    marginBottom: "25px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  casesList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  caseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
  },
  caseTitle: {
    fontSize: "1.2rem",
    color: "#0f172a",
    marginBottom: "10px",
    fontWeight: "700",
  },
  caseDetail: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "6px",
  },
  statusbadge: {
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statuspending: { backgroundColor: "#fef3c7", color: "#d97706" },
  statusactive: { backgroundColor: "#d1fae5", color: "#059669" },
  statuscompleted: { backgroundColor: "#dbeafe", color: "#2563eb" },

  input: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "2px solid #f1f5f9",
    outline: "none",
    flex: 1,
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  select: {
    padding: "12px",
    borderRadius: "12px",
    border: "2px solid #f1f5f9",
    outline: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  lawyersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  lawyerCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #f1f5f9",
  },
  lawyerHeader: {
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
  },
  lawyerAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    fontWeight: "800",
  },
  lawyerName: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#0f172a",
    fontWeight: "700",
  },
  lawyerSpec: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#2563eb",
    fontWeight: "600",
  },
  lawyerRating: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#f59e0b",
    fontWeight: "600",
    marginTop: "2px",
  },
  lawyerActions: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  whatsappActionBtnProfile: {
    padding: "10px 18px",
    background: "#fff",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.85rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
  },
  whatsappActionBtnProfilePrimary: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.85rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
  },
  searchButton: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
  },
  viewButtonDashboard: {
    padding: "8px 16px",
    background: "rgba(37, 99, 235, 0.05)",
    color: "#2563eb",
    border: "1px solid rgba(37, 99, 235, 0.1)",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  consultationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  consultationItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
  },
  consultationIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#f1f5f9",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  consultationTitle: {
    fontSize: "1.2rem",
    color: "#0f172a",
    marginBottom: "6px",
    fontWeight: "700",
  },
  consultationDate: {
    fontSize: "1rem",
    color: "#475569",
    marginBottom: "4px",
  },
  consultationType: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "500",
  },
  joinButton: {
    padding: "12px 24px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(37, 99, 235, 0.2)",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },
  actionCard: {
    backgroundColor: "#fff",
    padding: "40px 35px",
    borderRadius: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    textAlign: "left",
  },
  actionIconBoxBlue: {
    width: "50px", height: "50px", borderRadius: "14px",
    background: "#dbeafe", color: "#2563eb",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "15px"
  },
  actionIconBoxPurple: {
    width: "50px", height: "50px", borderRadius: "14px",
    background: "#f3e8ff", color: "#9333ea",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "15px"
  },
  actionIconBoxGreen: {
    width: "50px", height: "50px", borderRadius: "14px",
    background: "#dcfce7", color: "#10b981",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "15px"
  },
  actionTitle: {
    fontSize: "1.5rem",
    color: "#0f172a",
    marginBottom: "15px",
    fontWeight: "800",
  },
  actionDesc: {
    fontSize: "1.05rem",
    color: "#64748b",
    lineHeight: "1.7",
    marginBottom: "25px",
  },
  actionButton: {
    padding: "14px 28px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  loading: {
    fontSize: "1.5rem",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "800",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  emptyIconBox: {
    width: "80px", height: "80px", borderRadius: "22px",
    background: "#f1f5f9", color: "#64748b",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "20px"
  },
};
