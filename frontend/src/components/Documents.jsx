import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import axios from "axios";

export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [file, setFile] = useState(null);

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    useEffect(() => {
        fetchCases();
    }, []);

    useEffect(() => {
        if (selectedCase) {
            fetchDocuments(selectedCase);
        } else {
            setDocuments([]);
            setLoading(false);
        }
    }, [selectedCase]);

    const fetchCases = async () => {
        try {
            const response = await axios.get(`${API_URL}/cases?userId=${userId}&role=${userRole}`);
            setCases(response.data.cases || []);
            if (response.data.cases?.length > 0) {
                setSelectedCase(response.data.cases[0].id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
            setLoading(false);
        }
    };

    const fetchDocuments = async (caseId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/documents/case/${caseId}`);
            setDocuments(response.data.documents || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedCase) {
            alert("Please select a file and a case");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("document", file);
        formData.append("caseId", selectedCase);
        formData.append("userId", userId);

        try {
            // Note: Backend upload route needs to be implemented/verified
            const response = await axios.post(`${API_URL}/documents/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.status === 201) {
                alert("Document uploaded successfully!");
                setShowUploadModal(false);
                setFile(null);
                fetchDocuments(selectedCase);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload document (Verify backend upload route)");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = (filePath) => {
        const backendHost = API_URL.replace("/api", "");
        window.open(`${backendHost}/${filePath}`, "_blank");
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await axios.delete(`${API_URL}/documents/${docId}`);
            fetchDocuments(selectedCase);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete document");
        }
    };

    const getFileIcon = (type) => {
        if (type?.includes("pdf")) return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
        );
        if (type?.includes("image")) return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        );
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backButton} onClick={() => navigate(-1)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back
                </button>
                <div style={styles.headerContent}>
                    <div>
                        <h1 style={styles.title}>Legal Workspace</h1>
                        <p style={styles.subtitle}>Secure infrastructure for your case intelligence</p>
                    </div>
                    <button
                        style={styles.uploadButton}
                        onClick={() => setShowUploadModal(true)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Upload Intelligence
                    </button>
                </div>
            </div>

            <div style={styles.caseSelector}>
                <div style={styles.caseSelectorIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={styles.label}>Active Case Context</label>
                    <select
                        style={styles.select}
                        value={selectedCase}
                        onChange={(e) => setSelectedCase(e.target.value)}
                    >
                        <option value="">-- Choose Data Context --</option>
                        {cases.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={styles.loading}>
                    <div className="spinner"></div>
                    <p>Synchronizing Case Data...</p>
                </div>
            ) : documents.length === 0 ? (
                <div style={styles.noDocuments}>
                    <div style={styles.noDocsIcon}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <h3 style={styles.noDocsTitle}>No Case Data Found</h3>
                    <p style={styles.noDocsText}>Initialize your legal record by uploading a document or selecting an active case context.</p>
                </div>
            ) : (
                <div style={styles.docGrid}>
                    {documents.map(doc => (
                        <div key={doc.id} style={styles.docCard}>
                            <div style={styles.docIconBox}>{getFileIcon(doc.file_type)}</div>
                            <div style={styles.docInfo}>
                                <h4 style={styles.docName}>{doc.file_name}</h4>
                                <div style={styles.docMetaRow}>
                                    <span style={styles.docMetaItem}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        {doc.uploaded_by_name}
                                    </span>
                                    <span style={styles.docMetaItem}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div style={styles.docActionGroup}>
                                <button style={styles.actionIconButton} onClick={() => handleDownload(doc.file_path)} title="Download">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                </button>
                                <button style={{ ...styles.actionIconButton, backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }} onClick={() => handleDelete(doc.id)} title="Delete">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUploadModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Upload New Document</h3>
                        <form onSubmit={handleFileUpload} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label>Select File:</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={styles.fileInput}
                                />
                            </div>
                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={styles.submitBtn}
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Upload"}
                                </button>
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
        cursor: "pointer",
        marginBottom: "30px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        fontWeight: "700",
        border: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        transition: "all 0.2s",
    },
    headerContent: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: "2.5rem",
        color: "#0f172a",
        margin: 0,
        fontWeight: "900",
        letterSpacing: "-1.5px",
    },
    subtitle: {
        fontSize: "1.1rem",
        color: "#64748b",
        marginTop: "8px",
        fontWeight: "500",
    },
    uploadButton: {
        padding: "16px 28px",
        border: "none",
        background: "linear-gradient(90deg, #2563eb, #9333ea)",
        color: "#fff",
        borderRadius: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
        display: "flex",
        alignItems: "center",
    },
    caseSelector: {
        backgroundColor: "#fff",
        padding: "25px 30px",
        borderRadius: "24px",
        marginBottom: "40px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
        display: "flex",
        alignItems: "center",
        gap: "25px",
        border: "1px solid #f1f5f9",
    },
    caseSelectorIcon: {
        width: "54px",
        height: "54px",
        borderRadius: "18px",
        backgroundColor: "rgba(37, 99, 235, 0.05)",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontWeight: "800",
        color: "#64748b",
        fontSize: "0.85rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        display: "block",
        marginBottom: "8px",
    },
    select: {
        padding: "12px 0",
        borderRadius: "0",
        border: "none",
        borderBottom: "2px solid #f1f5f9",
        outline: "none",
        fontSize: "1.1rem",
        width: "100%",
        backgroundColor: "transparent",
        color: "#0f172a",
        cursor: "pointer",
        fontWeight: "700",
        transition: "border-color 0.2s",
    },
    loading: {
        textAlign: "center",
        padding: "100px",
        color: "#64748b",
        fontSize: "1.1rem",
        fontWeight: "600",
    },
    noDocuments: {
        textAlign: "center",
        padding: "120px 40px",
        backgroundColor: "#fff",
        borderRadius: "32px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.02)",
        border: "1px solid #f1f5f9",
    },
    noDocsIcon: {
        color: "#cbd5e1",
        marginBottom: "25px",
    },
    noDocsTitle: {
        fontSize: "1.6rem",
        color: "#0f172a",
        fontWeight: "800",
        marginBottom: "12px",
    },
    noDocsText: {
        color: "#64748b",
        maxWidth: "400px",
        margin: "0 auto",
        lineHeight: "1.6",
    },
    docGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "30px",
    },
    docCard: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "28px",
        display: "flex",
        gap: "20px",
        alignItems: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.02)",
        border: "1px solid #f1f5f9",
        transition: "transform 0.25s, box-shadow 0.25s",
    },
    docIconBox: {
        width: "64px",
        height: "64px",
        borderRadius: "20px",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    docInfo: {
        flex: 1,
    },
    docName: {
        margin: "0 0 8px 0",
        fontSize: "1.2rem",
        color: "#0f172a",
        fontWeight: "800",
        letterSpacing: "-0.5px",
    },
    docMetaRow: {
        display: "flex",
        gap: "15px",
    },
    docMetaItem: {
        fontSize: "0.85rem",
        color: "#64748b",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
    },
    docActionGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    actionIconButton: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "rgba(37, 99, 235, 0.05)",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
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
        padding: "45px",
        borderRadius: "36px",
        width: "480px",
        boxShadow: "0 40px 80px rgba(0,0,0,0.2)",
    },
    form: {
        marginTop: "30px",
    },
    formGroup: {
        marginBottom: "30px",
    },
    fileInput: {
        marginTop: "15px",
        display: "block",
        width: "100%",
        padding: "20px",
        borderRadius: "16px",
        border: "2px dashed #f1f5f9",
        cursor: "pointer",
        backgroundColor: "#f8fafc",
    },
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "15px",
        marginTop: "35px",
    },
    cancelBtn: {
        padding: "16px 28px",
        borderRadius: "16px",
        border: "none",
        background: "#f1f5f9",
        color: "#64748b",
        cursor: "pointer",
        fontWeight: "700",
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
    }
};
