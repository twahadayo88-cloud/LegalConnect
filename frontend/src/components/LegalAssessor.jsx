import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

export default function LegalAssessor() {
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "Hello! I am the LegalConnect AI Assessor. Please describe your legal situation or problem, and I will evaluate the risk level and suggest the right type of lawyer for you.",
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages((prev) => [
                    ...prev, 
                    { 
                        sender: "ai", 
                        text: data.reply || "I couldn't generate a response.",
                        riskLevel: data.riskLevel,
                        suggestedLawyerType: data.suggestedLawyerType 
                    }
                ]);
            } else {
                setMessages((prev) => [...prev, { sender: "ai", text: data.error || "An error occurred." }]);
            }
        } catch (error) {
            console.error("AI chat error:", error);
            setMessages((prev) => [...prev, { sender: "ai", text: "Failed to connect to the AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (riskLevel) => {
        const risk = riskLevel?.toLowerCase() || "";
        if (risk.includes("critical")) return "#dc3545";
        if (risk.includes("high")) return "#fd7e14";
        if (risk.includes("moderate")) return "#ffc107";
        return "#28a745"; // Low or generic
    };

    return (
        <div style={styles.container}>
            <div style={styles.chatContainer}>
                {/* Header Section */}
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back
                    </button>
                    <div style={styles.headerTitleContainer}>
                        <div style={styles.aiHeaderIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M12 12L2.69 7a10 10 0 0 1 18.62 0L12 12z" /><path d="M12 12l9.31 5a10 10 0 0 1-18.62 0L12 12z" /></svg>
                        </div>
                        <h2 style={styles.title}>AI Legal Assessor</h2>
                        <div style={styles.badge}>Powered by Gemini</div>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={styles.messagesArea}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            ...styles.messageWrapper,
                            justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
                        }}>
                            {msg.sender === "ai" && (
                                <div style={styles.messageAvatarAI}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /></svg>
                                </div>
                            )}
                            <div style={{
                                ...styles.messageBubble,
                                backgroundColor: msg.sender === "user" ? "#2563eb" : "#f1f5f9",
                                color: msg.sender === "user" ? "#fff" : "#0f172a",
                                borderBottomRightRadius: msg.sender === "user" ? "4px" : "20px",
                                borderBottomLeftRadius: msg.sender === "ai" ? "4px" : "20px",
                            }}>
                                <p style={styles.messageText}>{msg.text}</p>

                                {msg.riskLevel && msg.suggestedLawyerType && (
                                    <div style={styles.aiMetadataContainer}>
                                        <div style={styles.metaBadge}>
                                            <span style={styles.metaLabel}>Risk Level:</span>
                                            <span style={{...styles.metaValue, color: getRiskColor(msg.riskLevel)}}>
                                                {msg.riskLevel}
                                            </span>
                                        </div>
                                        <div style={styles.metaBadge}>
                                            <span style={styles.metaLabel}>Recommended:</span>
                                            <span style={{...styles.metaValue, color: "#2563eb"}}>
                                                {msg.suggestedLawyerType}
                                            </span>
                                        </div>
                                        
                                        <button 
                                            style={styles.hireBtn} 
                                            onClick={() => navigate(`/find-lawyers?specialization=${msg.suggestedLawyerType}`)}
                                        >
                                            Find {msg.suggestedLawyerType}s →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ ...styles.messageWrapper, justifyContent: "flex-start" }}>
                            <div style={styles.messageAvatarAI}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /></svg>
                            </div>
                            <div style={styles.typingIndicator}>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} style={styles.inputArea}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your legal issue (e.g. 'I received a notice from my landlord...')"
                        style={styles.input}
                        disabled={loading}
                    />
                    <button type="submit" style={styles.sendButton} disabled={loading || !input.trim()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                </form>
            </div>

            {/* Global style for typing animation */}
            <style dangerouslySetInnerHTML={{ __html: `
                .dot {
                    width: 8px;
                    height: 8px;
                    background-color: #94a3b8;
                    border-radius: 50%;
                    animation: bounce 1.5s infinite ease-in-out both;
                }
                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            ` }} />
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
    },
    chatContainer: {
        width: "100%",
        maxWidth: "800px",
        height: "85vh",
        backgroundColor: "#fff",
        borderRadius: "24px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        border: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    header: {
        padding: "20px 30px",
        borderBottom: "1px solid #f1f5f9",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
    },
    backBtn: {
        border: "none",
        background: "none",
        color: "#64748b",
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        transition: "color 0.2s",
    },
    headerTitleContainer: {
        display: "flex",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        gap: "10px",
    },
    aiHeaderIcon: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: "1.3rem",
        color: "#0f172a",
        fontWeight: "800",
        margin: 0,
        letterSpacing: "-0.5px",
    },
    badge: {
        padding: "4px 10px",
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        color: "#2563eb",
        borderRadius: "12px",
        fontSize: "0.7rem",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    messagesArea: {
        flex: 1,
        padding: "30px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        backgroundColor: "#f8fafc",
    },
    messageWrapper: {
        display: "flex",
        gap: "12px",
        alignItems: "flex-end",
    },
    messageAvatarAI: {
        width: "32px",
        height: "32px",
        borderRadius: "10px",
        backgroundColor: "#1e293b",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    messageBubble: {
        maxWidth: "75%",
        padding: "16px 20px",
        borderRadius: "20px",
        fontSize: "0.95rem",
        lineHeight: "1.6",
        boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    },
    messageText: {
        margin: 0,
        whiteSpace: "pre-wrap",
    },
    aiMetadataContainer: {
        marginTop: "15px",
        paddingTop: "15px",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    metaBadge: {
        backgroundColor: "#fff",
        padding: "8px 14px",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #e2e8f0",
    },
    metaLabel: {
        fontSize: "0.85rem",
        color: "#64748b",
        fontWeight: "600",
    },
    metaValue: {
        fontSize: "0.85rem",
        fontWeight: "800",
    },
    hireBtn: {
        marginTop: "5px",
        padding: "10px",
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
        textAlign: "center",
        transition: "background 0.2s",
    },
    typingIndicator: {
        maxWidth: "75%",
        padding: "16px 20px",
        borderRadius: "20px",
        backgroundColor: "#f1f5f9",
        borderBottomLeftRadius: "4px",
        display: "flex",
        gap: "6px",
        alignItems: "center",
    },
    inputArea: {
        padding: "20px",
        backgroundColor: "#fff",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        gap: "12px",
        alignItems: "center",
    },
    input: {
        flex: 1,
        padding: "16px 24px",
        fontSize: "1rem",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        outline: "none",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        fontWeight: "500",
        transition: "border 0.2s",
    },
    sendButton: {
        width: "55px",
        height: "55px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "transform 0.2s, background 0.2s",
        boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
    }
};
