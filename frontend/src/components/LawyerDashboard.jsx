
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function LawyerDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [cases, setCases] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Client Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', caseTitle: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update Case Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCaseToUpdate, setSelectedCaseToUpdate] = useState(null);
  const [updateCaseData, setUpdateCaseData] = useState({ status: '', priority: '', description: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Lawyer";
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (activeMenu === "dashboard") fetchDashboardData();
    if (activeMenu === "clients") fetchClients();
    if (activeMenu === "cases") fetchCases();
    if (activeMenu === "consultations") fetchConsultations();
    if (activeMenu === "payments") fetchPayments();
    if (activeMenu === "messages") navigate("/messages");
  }, [activeMenu]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/payments?userId=${userId}&role=lawyer`);
      setPayments(res.data.payments || []);
    } catch (err) { console.error("Error fetching payments", err); }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats/lawyer/${userId}/clients`);
      setClients(res.data.clients || []);
    } catch (err) { console.error(err); }
  };

  const fetchCases = async () => {
    try {
      const res = await axios.get(`${API_URL}/cases?userId=${userId}&role=lawyer`);
      setCases(res.data.cases || []);
    } catch (err) { console.error(err); }
  };

  const fetchConsultations = async () => {
    try {
      const res = await axios.get(`${API_URL}/consultations?userId=${userId}&role=lawyer`);
      setConsultations(res.data.consultations || []);
    } catch (err) { console.error(err); }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/stats/lawyer/${userId}`);
      const { data } = response;

      setStats(data.stats);
      setRecentCases(data.recentCases || []);

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

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email || !newClient.caseTitle) return;

    setIsSubmitting(true);
    try {
      // 1. Create client account
      const signupRes = await axios.post(`${API_URL}/auth/signup`, {
        name: newClient.name,
        email: newClient.email,
        password: 'password123',
        role: 'client'
      });

      // 2. Create case linking client to lawyer
      await axios.post(`${API_URL}/cases/create`, {
        clientId: signupRes.data.userId,
        lawyerId: userId,
        title: newClient.caseTitle,
        description: `Initial case file for ${newClient.name}`,
        caseType: 'General',
        priority: 'medium'
      });

      setShowAddClientModal(false);
      setNewClient({ name: '', email: '', caseTitle: '' });
      alert("Success! Client registered and case connected.\\n\\nThe client can log in with password: password123");

      // Refresh arrays
      if (activeMenu === 'clients') fetchClients();
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.msg || "Failed to add client. They might already be registered.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedCaseToUpdate) return;

    setIsUpdating(true);
    try {
      await axios.put(`${API_URL}/cases/${selectedCaseToUpdate.id}`, updateCaseData);

      setShowUpdateModal(false);
      setSelectedCaseToUpdate(null);
      alert("Case updated successfully!");

      if (activeMenu === 'cases') fetchCases();
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Failed to update case.");
    } finally {
      setIsUpdating(false);
    }
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
          <p style={styles.logoSubtext}>Lawyer Portal</p>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>{userName}</p>
            <p style={styles.userRole}>Legal Professional</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "dashboard" ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveMenu("dashboard")}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </span>
            Dashboard
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(activeMenu === "clients" ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveMenu("clients")}
          >
            <span style={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </span>
            My Clients
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
            Active Cases
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
            onClick={() => setActiveMenu("messages")}
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
          <h1 style={styles.pageTitle}>Lawyer Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Manage your practice and client relationships
          </p>
        </div>

        <div style={styles.content}>
          {activeMenu === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
                  <div style={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stats?.totalClients || 0}</p>
                    <p style={styles.statLabel}>Total Clients</p>
                  </div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardBlue }}>
                  <div style={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stats?.activeCases || 0}</p>
                    <p style={styles.statLabel}>Active Cases</p>
                  </div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardPurple }}>
                  <div style={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <div>
                    <p style={styles.statValue}>{stats?.todayConsultations || 0}</p>
                    <p style={styles.statLabel}>Today's Meetings</p>
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

              {/* Analytics Chart */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Performance Analytics</h3>
                <div style={styles.chartContainer}>
                  <Bar 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                      datasets: [
                        {
                          label: 'Cases Closed',
                          data: [12, 19, 15, 22, 14, 28, Math.max(stats?.activeCases || 10, 20)],
                          backgroundColor: 'rgba(37, 99, 235, 0.8)',
                          borderRadius: 6,
                        },
                        {
                          label: 'Consultations',
                          data: [20, 25, 22, 30, 28, 35, Math.max(stats?.todayConsultations * 10 || 15, 25)],
                          backgroundColor: 'rgba(147, 51, 234, 0.8)',
                          borderRadius: 6,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                      },
                      scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
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
                            Client: {caseItem.client_name}
                          </p>
                          <p style={styles.caseDetail}>
                            Status: <span style={styles[`status${caseItem.status}`]}>
                              {caseItem.status}
                            </span>
                          </p>
                        </div>
                        <button style={styles.viewButton}>
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div style={styles.quickActions}>
                <h3 style={styles.sectionTitle}>Quick Actions</h3>
                <div style={styles.actionGrid}>
                  <button style={styles.quickActionBtn} onClick={() => setShowAddClientModal(true)}>
                    <span style={styles.quickActionIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
                    </span>
                    <span>Add New Client</span>
                  </button>
                  <button style={styles.quickActionBtn} onClick={() => navigate("/consultations")}>
                    <span style={styles.quickActionIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </span>
                    <span>Schedule Meeting</span>
                  </button>
                  <button style={styles.quickActionBtn} onClick={() => setActiveMenu("cases")}>
                    <span style={styles.quickActionIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                    </span>
                    <span>Create Case File</span>
                  </button>
                  <button style={styles.quickActionBtn} onClick={() => navigate("/messages?newChat=true")}>
                    <span style={styles.quickActionIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><polyline points="9 11 12 14 22 4" /></svg>
                    </span>
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </>
          )}
          {activeMenu === "clients" && (
            <div style={styles.sectionCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>My Clients</h3>
                <button
                  style={{ ...styles.featureButton, padding: '10px 20px', fontSize: '0.95rem' }}
                  onClick={() => setShowAddClientModal(true)}
                >
                  + Add Client
                </button>
              </div>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Active Cases</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                          <div style={{ marginBottom: '15px' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          </div>
                          <h4 style={{ color: '#0f172a', marginBottom: '5px' }}>No Clients Found</h4>
                          <p>You don't have any active clients tied to cases yet.</p>
                        </td>
                      </tr>
                    ) : (
                      clients.map(client => (
                        <tr key={client.id}>
                          <td style={styles.td}>{client.name}</td>
                          <td style={styles.td}>{client.email}</td>
                          <td style={styles.td}>{client.case_count}</td>
                          <td style={styles.td}>
                            <button
                              style={styles.viewButton}
                              onClick={() => navigate(`/messages/${client.id}`)}
                            >
                              Message
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === "dashboard" && (
            <div style={styles.featuresGrid}>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h3 style={styles.featureTitle}>Client Management</h3>
                <p style={styles.featureDesc}>
                  Efficiently manage your client database with secure document storage
                </p>
                <button style={styles.featureButton} onClick={() => setActiveMenu("clients")}>
                  Manage Clients →
                </button>
              </div>

              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <h3 style={styles.featureTitle}>Calendar & Scheduling</h3>
                <p style={styles.featureDesc}>
                  Streamline consultations with automated scheduling and reminders
                </p>
                <button style={styles.featureButton} onClick={() => setActiveMenu("consultations")}>
                  View Schedule →
                </button>
              </div>

              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                </div>
                <h3 style={styles.featureTitle}>Case Tracking</h3>
                <p style={styles.featureDesc}>
                  Monitor case progress, deadlines, and court dates in real-time
                </p>
                <button style={styles.featureButton} onClick={() => setActiveMenu("cases")}>
                  Track Cases →
                </button>
              </div>
            </div>
          )}

          {activeMenu === "cases" && (
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Case Management</h3>
              {cases.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                  </div>
                  <h4>No active cases found</h4>
                  <p>When you take on a new case, it will appear here.</p>
                </div>
              ) : (
                <div style={styles.casesList}>
                  {cases.map(caseItem => (
                    <div key={caseItem.id} style={styles.caseItem}>
                      <div>
                        <h4 style={styles.caseTitle}>{caseItem.title}</h4>
                        <p style={styles.caseDetail}>Client: {caseItem.client_name}</p>
                        <p style={styles.caseDetail}>Status: <span style={styles[`status${caseItem.status}`]}>{caseItem.status}</span></p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          style={styles.viewButton}
                          onClick={() => navigate("/documents")}
                        >
                          Manage Documents
                        </button>
                        <button
                          style={{ ...styles.viewButton, background: '#4ecca3' }}
                          onClick={() => {
                            setSelectedCaseToUpdate(caseItem);
                            setUpdateCaseData({
                              status: caseItem.status || 'pending',
                              priority: caseItem.priority || 'medium',
                              description: caseItem.description || ''
                            });
                            setShowUpdateModal(true);
                          }}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === "consultations" && (
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Upcoming Consultations</h3>
              {consultations.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <h4>No consultations scheduled</h4>
                  <p>Your upcoming meetings with clients will show up here.</p>
                  <button style={styles.viewButton} onClick={() => navigate("/consultations")}>
                    Schedule a Meeting
                  </button>
                </div>
              ) : (
                <div style={styles.casesList}>
                  {consultations.map(consult => (
                    <div key={consult.id} style={styles.caseItem}>
                      <div>
                        <h4 style={styles.caseTitle}>{consult.client_name}</h4>
                        <p style={styles.caseDetail}>Type: {consult.consultation_type}</p>
                        <p style={styles.caseDetail}>
                          Date: {new Date(consult.scheduled_date).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{
                          ...styles.statusbadge,
                          ...(consult.status === 'scheduled' ? styles.statuspending : styles.statusactive)
                        }}>
                          {consult.status}
                        </span>
                        <button style={styles.viewButton} onClick={() => navigate(`/messages/${consult.client_id}`)}>
                          Message Client
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === "payments" && (
            <div style={styles.sectionCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{...styles.sectionTitle, marginBottom: 0}}>Payment History</h3>
                <div style={styles.statCardGreen}>
                  <strong style={{color:"#059669", fontSize:"1.2rem"}}>
                    ${payments.reduce((acc, curr) => curr.status === 'completed' ? acc + parseFloat(curr.amount) : acc, 0).toFixed(2)}
                  </strong> Total Earnings
                </div>
              </div>

              {payments.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  <h4>No Payment Records Found</h4>
                  <p>Invoices for your consultations will appear here once paid by clients.</p>
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Transaction ID</th>
                        <th style={styles.th}>Client Name</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id}>
                          <td style={{...styles.td, color: '#64748b', fontSize: '0.85rem'}}>#{payment.id.substring(0,8)}...</td>
                          <td style={{...styles.td, fontWeight: '700'}}>{payment.client_name}</td>
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

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.sectionTitle}>Add New Client</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setShowAddClientModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>Client Full Name</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  style={styles.modalInput}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>Email Address</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  style={styles.modalInput}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>Issue / Main Case Title</label>
                <input
                  type="text"
                  value={newClient.caseTitle}
                  onChange={(e) => setNewClient({ ...newClient, caseTitle: e.target.value })}
                  style={styles.modalInput}
                  placeholder="e.g. Property Dispute Consultation"
                  required
                />
              </div>

              <button type="submit" style={{ ...styles.featureButton, marginTop: '10px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Add Client & Create File'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Case Modal */}
      {showUpdateModal && selectedCaseToUpdate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.sectionTitle}>Update Case Status</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setShowUpdateModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>Case Status</label>
                <select
                  value={updateCaseData.status}
                  onChange={(e) => setUpdateCaseData({ ...updateCaseData, status: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>Priority Level</label>
                <select
                  value={updateCaseData.priority}
                  onChange={(e) => setUpdateCaseData({ ...updateCaseData, priority: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>Case Details/Notes</label>
                <textarea
                  value={updateCaseData.description}
                  onChange={(e) => setUpdateCaseData({ ...updateCaseData, description: e.target.value })}
                  style={{ ...styles.modalInput, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Update any details regarding this case..."
                />
              </div>

              <button type="submit" style={{ ...styles.featureButton, marginTop: '10px', background: 'linear-gradient(90deg, #10b981, #059669)' }} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Updates'}
              </button>
            </form>
          </div>
        </div>
      )}
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
    backgroundColor: "#020617",
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
    background: "linear-gradient(90deg, #3b82f6, #a855f7)",
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
    background: "linear-gradient(135deg, #3b82f6, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#fff",
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
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "35px",
    maxWidth: "1200px",
  },
  statsGrid: {
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
    boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
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
  },
  statCardGreen: { borderTop: "5px solid #10b981" },
  statCardBlue: { borderTop: "5px solid #2563eb" },
  statCardPurple: { borderTop: "5px solid #9333ea" },
  statCardOrange: { borderTop: "5px solid #f59e0b" },

  sectionCard: {
    backgroundColor: "#fff",
    padding: "35px",
    borderRadius: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: "1.6rem",
    color: "#0f172a",
    marginBottom: "25px",
    fontWeight: "800",
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
  },
  statuspending: { color: "#d97706", backgroundColor: "#fef3c7" },
  statusactive: { color: "#059669", backgroundColor: "#d1fae5" },
  statuscompleted: { color: "#2563eb", backgroundColor: "#dbeafe" },

  viewButton: {
    padding: "12px 24px",
    border: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
  },
  quickActions: {
    backgroundColor: "#fff",
    padding: "35px",
    borderRadius: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  quickActionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "20px",
    border: "2px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: "#0f172a",
  },
  quickActionIcon: {
    fontSize: "1.5rem",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },
  featureCard: {
    backgroundColor: "#fff",
    padding: "40px 35px",
    borderRadius: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  featureIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
    background: "rgba(37, 99, 235, 0.05)",
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: "1.5rem",
    color: "#0f172a",
    marginBottom: "15px",
    fontWeight: "800",
  },
  featureDesc: {
    fontSize: "1.05rem",
    color: "#64748b",
    lineHeight: "1.7",
    marginBottom: "25px",
  },
  featureButton: {
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
  tableResponsive: {
    overflowX: "auto",
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  },
  th: {
    textAlign: "left",
    padding: "18px 24px",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    letterSpacing: "1px",
    borderRadius: "12px",
  },
  td: {
    padding: "24px",
    backgroundColor: "#fff",
    color: "#0f172a",
    fontSize: "1rem",
    fontWeight: "500",
    borderBottom: "1px solid #f1f5f9",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  emptyIcon: {
    fontSize: "4rem",
    opacity: 0.1,
    marginBottom: "10px",
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  modalInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif"
  },
};