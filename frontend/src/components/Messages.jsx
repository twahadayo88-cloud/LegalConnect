import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import API_URL from "../config";
import axios from "axios";

// Helper to get socket connection - ensuring only one instance
let socket;

export default function Messages() {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [contacts, setContacts] = useState([]);

    // Call States
    const [isCalling, setIsCalling] = useState(false);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callType, setCallType] = useState(null);
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    // Voice Message Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const [isUploading, setIsUploading] = useState(false);

    const navigate = useNavigate();
    const { receiverId } = useParams();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('newChat') === 'true') {
            setShowNewChatModal(true);
            fetchContacts();
        }
    }, [location]);
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    // Initialize Socket.io
    useEffect(() => {
        socket = io(API_URL.replace("/api", ""));
        socket.emit("user_connected", userId);

        socket.on("receive_message", (data) => {
            if (activeChat && (data.senderId === activeChat.id || data.senderId === userId)) {
                setMessages(prev => [...prev, data]);
            }
            // Update conversations list with last message
            fetchConversations();
        });

        socket.on("message_sent", (data) => {
            if (activeChat && (data.receiverId === activeChat.id || data.senderId === userId)) {
                setMessages(prev => [...prev, data]);
            }
            fetchConversations();
        });

        socket.on("user_online", (id) => {
            setOnlineUsers(prev => new Set([...prev, id]));
        });

        socket.on("user_offline", (id) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        });

        socket.on("user_typing", (data) => {
            if (activeChat && data.senderId === activeChat.id) {
                setIsTyping(data.isTyping);
            }
        });

        // Signaling Listeners
        socket.on("incoming_call", (data) => {
            setIncomingCall(data);
        });

        socket.on("call_accepted", (data) => {
            setCallAccepted(true);
            if (connectionRef.current && data.signalData) {
                const desc = new RTCSessionDescription(data.signalData);
                connectionRef.current.setRemoteDescription(desc).catch(console.error);
            }
        });

        socket.on("call_rejected", () => {
            alert("Call rejected");
            stopCall();
        });

        socket.on("ice_candidate", (data) => {
            if (connectionRef.current && data.candidate) {
                connectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
            }
        });

        socket.on("call_ended", () => {
            setCallEnded(true);
            stopCall();
        });

        return () => {
            socket.disconnect();
        };
    }, [userId, activeChat]);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, [userId]);

    // Handle active chat selection from URL or manual click
    useEffect(() => {
        if (receiverId) {
            const existing = conversations.find(c => c.id === parseInt(receiverId));
            if (existing) setActiveChat(existing);
            else fetchReceiverInfo(receiverId);
        }
    }, [receiverId, conversations]);

    // Load messages for active chat
    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
        }
    }, [activeChat]);

    // Check for auto-open modal
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("newChat") === "true") {
            setShowNewChatModal(true);
            fetchContacts();
        }
    }, [window.location.search]);

    const fetchContacts = async () => {
        try {
            const endpoint = userRole === 'client' ? 'lawyers' : `stats/lawyer/${userId}/clients`;
            const res = await axios.get(`${API_URL}/${endpoint}`);
            setContacts(userRole === 'client' ? (res.data.lawyers || []) : (res.data.clients || []));
        } catch (err) {
            console.error("Error fetching contacts:", err);
        }
    };

    // Scroll to bottom on new message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/messages/conversations/${userId}`);
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.error("Error fetching conversations:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const res = await axios.get(`${API_URL}/messages/history/${userId}/${chatId}`);
            setMessages(res.data.messages || []);

            // Mark as read
            const unreadIds = res.data.messages
                .filter(m => m.receiver_id === parseInt(userId) && !m.is_read)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                socket.emit("mark_as_read", { messageIds: unreadIds });
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const fetchReceiverInfo = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/auth/user/${id}`);
            setActiveChat(res.data.user);
        } catch (err) {
            console.error("Error fetching user info:", err);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const messageData = {
            senderId: parseInt(userId),
            receiverId: activeChat.id,
            message: newMessage,
            timestamp: new Date()
        };

        socket.emit("send_message", messageData);
        setNewMessage("");
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socket.emit("typing", {
            receiverId: activeChat.id,
            senderId: userId,
            isTyping: e.target.value.length > 0
        });
    };

    // WebRTC Functions
    const startCall = async (type) => {
        setCallType(type);
        setIsCalling(true);
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: type === "video",
                audio: true
            });
            setStream(localStream);
            if (myVideo.current) myVideo.current.srcObject = localStream;

            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stunl.google.com:19302" }]
            });

            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                if (userVideo.current) userVideo.current.srcObject = event.streams[0];
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice_candidate", {
                        receiverId: activeChat.id,
                        candidate: event.candidate
                    });
                }
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            connectionRef.current = peerConnection;

            socket.emit("call_user", {
                receiverId: activeChat.id,
                callerId: userId,
                callerName: userName,
                callType: type,
                signalData: offer
            });
        } catch (err) {
            console.error("Camera/Mic fail:", err);
            stopCall();
        }
    };

    const acceptCall = async () => {
        setCallType(incomingCall.callType);
        setCallAccepted(true);
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: incomingCall.callType === "video",
                audio: true
            });
            setStream(localStream);
            if (myVideo.current) myVideo.current.srcObject = localStream;

            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stunl.google.com:19302" }]
            });

            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                if (userVideo.current) userVideo.current.srcObject = event.streams[0];
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice_candidate", {
                        receiverId: incomingCall.callerId,
                        candidate: event.candidate
                    });
                }
            };

            await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.signalData));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            connectionRef.current = peerConnection;

            socket.emit("call_accepted", {
                callerId: incomingCall.callerId,
                signalData: answer
            });
            setIncomingCall(null);
        } catch (err) {
            console.error("Call accept media error:", err);
        }
    };

    const stopCall = () => {
        setIsCalling(false);
        setCallAccepted(false);
        setIncomingCall(null);
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (activeChat) {
            socket.emit("end_call", { receiverId: activeChat.id });
        }
    };

    const rejectCall = () => {
        socket.emit("call_rejected", { callerId: incomingCall.callerId });
        setIncomingCall(null);
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (stream && stream.getVideoTracks().length > 0) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsCameraOff(!isCameraOff);
        }
    };

    // Voice Message Functions
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(currentStream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append("audio", audioBlob);

                setIsUploading(true);
                try {
                    const res = await axios.post(`${API_URL}/messages/upload-voice`, formData);
                    const fileUrl = res.data.fileUrl;

                    socket.emit("send_message", {
                        senderId: parseInt(userId),
                        receiverId: activeChat.id,
                        message: "Voice Message",
                        type: "voice",
                        fileUrl: fileUrl,
                        timestamp: new Date()
                    });
                } catch (err) {
                    console.error("Upload failed:", err);
                } finally {
                    setIsUploading(false);
                }
                currentStream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Recording error:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeChat) return;

        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);

        try {
            const res = await axios.post(`${API_URL}/messages/upload-file`, formData);
            const type = file.type.startsWith('image/') ? 'image' : 'file';

            socket.emit("send_message", {
                senderId: parseInt(userId),
                receiverId: activeChat.id,
                message: type === 'image' ? "📷 Image" : `📄 ${file.name}`,
                type: type,
                fileUrl: res.data.fileUrl,
                timestamp: new Date()
            });
        } catch (err) {
            console.error("File upload failed:", err);
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar - Conversations List */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div style={styles.sidebarHeaderTop}>
                        <button style={styles.backBtn} onClick={() => navigate(userRole === 'lawyer' ? '/lawyer-dashboard' : '/client-dashboard')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                            Back
                        </button>
                        <button style={styles.newChatBtn} onClick={() => { setShowNewChatModal(true); fetchContacts(); }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                            New Chat
                        </button>
                    </div>
                    <h2 style={styles.sidebarTitle}>Messages</h2>
                </div>

                <div style={styles.convList}>
                    {loading ? (
                        <div style={styles.loading}>Loading chats...</div>
                    ) : conversations.length === 0 ? (
                        <div style={styles.noChats}>No conversations yet</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                style={{
                                    ...styles.convItem,
                                    ...(activeChat?.id === conv.id ? styles.convItemActive : {})
                                }}
                                onClick={() => {
                                    setActiveChat(conv);
                                    navigate(`/messages/${conv.id}`);
                                }}
                            >
                                <div style={styles.convAvatar}>
                                    {conv.name.charAt(0).toUpperCase()}
                                    {onlineUsers.has(conv.id) && <div style={styles.onlineStatus}></div>}
                                </div>
                                <div style={styles.convInfo}>
                                    <div style={styles.convNameRow}>
                                        <h4 style={styles.convName}>{conv.name}</h4>
                                        <span style={styles.convTime}>
                                            {new Date(conv.last_message_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={styles.lastMsg}>
                                        {conv.last_message_type === 'voice' ? "🎤 Voice Message" :
                                            conv.last_message_type === 'image' ? "📷 Image" :
                                                conv.last_message_type === 'file' ? "📄 File" :
                                                    (conv.last_message || "Start a conversation")}
                                    </p>
                                </div>
                                {conv.unread_count > 0 && (
                                    <div style={styles.unreadBadge}>{conv.unread_count}</div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Windows */}
            <div style={styles.chatArea}>
                {activeChat ? (
                    <>
                        <div style={styles.chatHeader}>
                            <div style={styles.headerInfo}>
                                <div style={styles.convAvatarSmall}>
                                    {activeChat.name.charAt(0).toUpperCase()}
                                    {onlineUsers.has(activeChat.id) && <div style={styles.onlineStatus}></div>}
                                </div>
                                <div>
                                    <h3 style={styles.headerName}>{activeChat.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ ...styles.onlineStatusRing, backgroundColor: onlineUsers.has(activeChat.id) ? '#10b981' : '#94a3b8' }}></div>
                                        <p style={{ ...styles.headerPresence, color: onlineUsers.has(activeChat.id) ? '#10b981' : '#94a3b8' }}>
                                            {onlineUsers.has(activeChat.id) ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div style={styles.headerActions}>
                                <button style={styles.whatsappActionBtn} onClick={() => startCall('audio')}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                </button>
                                <button style={styles.whatsappActionBtn} onClick={() => startCall('video')}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                                </button>
                                <button style={styles.whatsappActionBtn}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                </button>
                            </div>
                        </div>

                        <div style={styles.messageList}>
                            {messages.map((msg, idx) => {
                                const isMine = msg.senderId === parseInt(userId) || msg.sender_id === parseInt(userId);
                                return (
                                    <div
                                        key={msg.id || idx}
                                        style={{
                                            ...styles.messageWrapper,
                                            alignSelf: isMine ? "flex-end" : "flex-start"
                                        }}
                                    >
                                        <div style={{
                                            ...styles.messageBubble,
                                            backgroundColor: isMine ? "#2563eb" : "#fff",
                                            color: isMine ? "#fff" : "#0f172a",
                                            boxShadow: isMine ? "0 4px 15px rgba(37, 99, 235, 0.2)" : "0 4px 15px rgba(0,0,0,0.05)",
                                            borderBottomRightRadius: isMine ? "4px" : "18px",
                                            borderBottomLeftRadius: isMine ? "18px" : "4px",
                                        }}>
                                            {msg.type === "voice" || msg.message_type === "voice" ? (
                                                <div style={styles.voiceBubble}>
                                                    <div style={styles.voicePlayer}>
                                                        <button
                                                            style={{ ...styles.voicePlayBtn, color: isMine ? '#fff' : '#2563eb' }}
                                                            onClick={(e) => {
                                                                const audio = e.currentTarget.nextSibling;
                                                                if (audio.paused) audio.play();
                                                                else audio.pause();
                                                            }}
                                                        >
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                        </button>
                                                        <audio
                                                            src={`${API_URL.replace('/api', '')}${msg.fileUrl || msg.file_url}`}
                                                            onPlay={(e) => e.target.previousSibling.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'}
                                                            onPause={(e) => e.target.previousSibling.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'}
                                                        />
                                                        <div style={{ ...styles.voiceWaveform, backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
                                                            <div style={{ ...styles.voiceProgress, backgroundColor: isMine ? '#fff' : '#2563eb' }}></div>
                                                        </div>
                                                    </div>
                                                    <span style={{ ...styles.voiceMicIcon, color: isMine ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                                                    </span>
                                                </div>
                                            ) : msg.type === "image" || msg.message_type === "image" ? (
                                                <div style={styles.imageWrapper}>
                                                    <img
                                                        src={`${API_URL.replace('/api', '')}${msg.fileUrl || msg.file_url}`}
                                                        alt="upload"
                                                        style={styles.msgImage}
                                                        onClick={() => window.open(`${API_URL.replace('/api', '')}${msg.fileUrl || msg.file_url}`, '_blank')}
                                                    />
                                                </div>
                                            ) : msg.type === "file" || msg.message_type === "file" ? (
                                                <div style={styles.fileMessage} onClick={() => window.open(`${API_URL.replace('/api', '')}${msg.fileUrl || msg.file_url}`, '_blank')}>
                                                    <div style={{ ...styles.fileIconBox, color: isMine ? '#fff' : '#2563eb' }}>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                                    </div>
                                                    <div style={styles.fileMsgInfo}>
                                                        <span style={{ ...styles.fileName, color: isMine ? '#fff' : '#0f172a' }}>{msg.message}</span>
                                                        <span style={{ ...styles.fileSize, color: isMine ? 'rgba(255,255,255,0.7)' : '#64748b' }}>Click to download</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                msg.message
                                            )}
                                            <div style={{
                                                ...styles.msgTime,
                                                color: isMine ? "rgba(255,255,255,0.7)" : "#94a3b8"
                                            }}>
                                                {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {isTyping && (
                                <div style={styles.typingIndicator}>
                                    <span></span><span></span><span></span>
                                </div>
                            )}
                            <div ref={scrollRef}></div>
                        </div>

                        {isUploading && (
                            <div style={styles.uploadingOverlay}>
                                <div style={styles.recordingPulse}></div>
                                <span>Uploading...</span>
                            </div>
                        )}

                        <form style={styles.inputArea} onSubmit={handleSendMessage}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <button
                                type="button"
                                style={styles.whatsappAttachBtn}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                            </button>

                            <div style={styles.whatsappInputWrapper}>
                                {isRecording ? (
                                    <div style={styles.recordingText}>
                                        <div style={styles.recordingPulse}></div>
                                        <span>Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                        <button type="button" onClick={stopRecording} style={styles.cancelRecordingBtn}>Cancel</button>
                                    </div>
                                ) : (
                                    <input
                                        style={styles.pillInput}
                                        placeholder="Type your message here..."
                                        value={newMessage}
                                        onChange={handleTyping}
                                    />
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {isRecording ? (
                                    <button type="button" onClick={stopRecording} style={styles.whatsappSendBtnActive}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                    </button>
                                ) : newMessage.trim() ? (
                                    <button type="submit" style={styles.whatsappSendBtnActive}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                    </button>
                                ) : (
                                    <button type="button" onClick={startRecording} style={styles.whatsappMicBtn}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                ) : (
                    <div style={styles.noActiveChat}>
                        <div style={styles.noChatIcon}>
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <h3 style={styles.noChatTitle}>Select a Conversation</h3>
                        <p style={styles.noChatText}>Choose a contact from the workspace to initiate a secure encrypted message.</p>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Start New Conversation</h3>
                            <button style={styles.closeBtn} onClick={() => setShowNewChatModal(false)}>✕</button>
                        </div>
                        <div style={styles.contactsList}>
                            {contacts.length === 0 ? (
                                <div style={styles.noContacts}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px', color: '#94a3b8' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <p>No contacts found.</p>
                                </div>
                            ) : (
                                contacts.map(contact => (
                                    <div
                                        key={contact.id}
                                        style={styles.contactItem}
                                        onClick={() => {
                                            setActiveChat(contact);
                                            setShowNewChatModal(false);
                                            navigate(`/messages/${contact.id}`);
                                        }}
                                    >
                                        <div style={styles.convAvatarSmall}>
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={styles.contactInfo}>
                                            <p style={styles.contactName}>{contact.name}</p>
                                            <p style={styles.contactRole}>{contact.role || contact.specialization || 'Contact'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Incoming Call Overlay */}
            {incomingCall && (
                <div style={styles.incomingCallOverlay}>
                    <div style={styles.callModal}>
                        <div style={styles.callAvatarLarge}>
                            {incomingCall.callerName.charAt(0).toUpperCase()}
                        </div>
                        <h2 style={{ color: '#0f172a' }}>{incomingCall.callerName}</h2>
                        <p style={{ color: '#64748b' }}>Incoming {incomingCall.callType} call...</p>
                        <div style={styles.callActions}>
                            <button style={styles.acceptBtn} onClick={acceptCall}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                Accept
                            </button>
                            <button style={styles.rejectBtn} onClick={rejectCall}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-Call Screen Overlay */}
            {(isCalling || callAccepted) && (
                <div style={styles.callOverlay}>
                    <div style={styles.activeCallWindow}>
                        {callType === 'video' ? (
                            <div style={styles.videoContainer}>
                                {callAccepted ? (
                                    <video playsInline ref={userVideo} autoPlay style={styles.fullVideo} />
                                ) : (
                                    <div style={styles.callingState}>
                                        <div style={styles.callAvatarLarge}>
                                            {activeChat?.name.charAt(0).toUpperCase()}
                                        </div>
                                        <h2>{activeChat?.name}</h2>
                                        <p>Ringing...</p>
                                    </div>
                                )}
                                <div style={styles.pipVideo}>
                                    <video playsInline muted ref={myVideo} autoPlay style={styles.localVideoBox} />
                                </div>
                            </div>
                        ) : (
                            <div style={styles.audioCallInterface}>
                                <div style={styles.callAvatarLarge}>
                                    {activeChat?.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 style={{ color: '#fff' }}>{activeChat?.name}</h2>
                                <p style={{ color: '#94a3b8' }}>{callAccepted ? "Connected" : "Calling..."}</p>
                            </div>
                        )}

                        <div style={styles.callFooter}>
                            <div style={styles.callControlsRow}>
                                <button style={{ ...styles.controlBtn, backgroundColor: isMuted ? '#ef4444' : 'rgba(255,255,255,0.1)' }} onClick={toggleMute}>
                                    {isMuted ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                    )}
                                </button>
                                {callType === 'video' && (
                                    <button style={{ ...styles.controlBtn, backgroundColor: isCameraOff ? '#ef4444' : 'rgba(255,255,255,0.1)' }} onClick={toggleCamera}>
                                        {isCameraOff ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                        )}
                                    </button>
                                )}
                                <button style={styles.whatsappEndBtn} onClick={stopCall}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter', sans-serif",
    },
    sidebar: {
        width: "380px",
        backgroundColor: "#fff",
        borderRight: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        zIndex: 5,
        boxShadow: "5px 0 15px rgba(0,0,0,0.02)",
    },
    sidebarHeader: {
        padding: "30px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        backgroundColor: "#fff",
    },
    sidebarHeaderTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    newChatBtn: {
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "12px",
        fontSize: "0.9rem",
        fontWeight: "800",
        cursor: "pointer",
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
    },
    backBtn: {
        background: "transparent",
        border: "none",
        color: "#64748b",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "0.95rem",
        display: 'flex',
        alignItems: 'center',
    },
    sidebarTitle: {
        margin: 0,
        fontSize: "2rem",
        color: "#0f172a",
        fontWeight: "900",
        letterSpacing: "-1px",
    },
    convList: {
        flex: 1,
        overflowY: "auto",
        padding: "15px 15px",
    },
    convItem: {
        display: "flex",
        padding: "15px",
        gap: "15px",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: "18px",
        marginBottom: "8px",
        position: "relative",
    },
    convItemActive: {
        backgroundColor: "#f1f5f9",
        boxShadow: "inset 0 0 0 1px #e2e8f0",
    },
    convAvatar: {
        width: "56px", height: "56px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4rem", fontWeight: "900",
        position: "relative",
        flexShrink: 0,
    },
    onlineStatus: {
        position: "absolute", bottom: "-2px", right: "-2px",
        width: "16px", height: "16px",
        borderRadius: "50%", backgroundColor: "#10b981",
        border: "3px solid #fff",
    },
    convInfo: {
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    convNameRow: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "6px",
    },
    convName: {
        margin: 0, fontSize: "1.05rem", color: "#0f172a",
        fontWeight: "800", whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis", letterSpacing: "-0.3px"
    },
    convTime: {
        fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600",
    },
    lastMsg: {
        margin: 0, fontSize: "0.9rem", color: "#64748b",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        fontWeight: "500",
    },
    unreadBadge: {
        background: "#ef4444", color: "#fff",
        borderRadius: "20px", padding: "4px 8px",
        fontSize: "0.7rem", fontWeight: "800",
        marginLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '24px'
    },
    chatArea: {
        flex: 1, display: "flex", flexDirection: "column",
        position: "relative",
        backgroundColor: "#f8fafc",
    },
    chatHeader: {
        height: "90px", backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #f1f5f9",
        padding: "0 40px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        zIndex: 4, position: "sticky", top: 0,
    },
    headerInfo: { display: "flex", alignItems: "center", gap: "18px" },
    headerActions: { display: "flex", alignItems: "center", gap: "10px" },
    convAvatarSmall: {
        width: "50px", height: "50px", borderRadius: "18px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "1.2rem", fontWeight: "900",
        position: 'relative'
    },
    headerName: { margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px", marginBottom: "4px" },
    headerPresence: { margin: 0, fontSize: "0.85rem", fontWeight: "700" },
    onlineStatusRing: { width: "10px", height: "10px", borderRadius: "50%" },
    whatsappActionBtn: {
        width: "44px", height: "44px", borderRadius: "14px", border: "1px solid #f1f5f9",
        background: "#fff", color: "#475569", cursor: "pointer",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
    },
    messageList: {
        flex: 1, padding: "30px 40px", display: "flex",
        flexDirection: "column", gap: "15px", overflowY: "auto",
        backgroundImage: "url('/assets/chat_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
    },
    messageWrapper: { maxWidth: "75%", display: "flex", flexDirection: "column", position: 'relative' },
    messageBubble: {
        padding: "12px 18px",
        fontSize: "0.95rem", lineHeight: "1.5", position: "relative",
        fontWeight: "500",
    },
    msgTime: { fontSize: "0.7rem", marginTop: "6px", textAlign: "right", fontWeight: "600" },
    imageWrapper: { marginBottom: '5px' },
    msgImage: { maxWidth: '100%', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.05)' },
    fileMessage: {
        display: 'flex', alignItems: 'center', gap: '15px',
        padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.04)',
        cursor: 'pointer', transition: 'background 0.2s'
    },
    fileIconBox: { fontSize: '1.8rem', display: 'flex', alignItems: 'center' },
    fileMsgInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
    fileName: { fontWeight: '700', fontSize: '0.95rem' },
    fileSize: { fontSize: '0.8rem', fontWeight: '500' },
    voiceBubble: {
        display: 'flex', alignItems: 'center', gap: '15px',
        minWidth: '250px', padding: '5px 0'
    },
    voicePlayer: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
    voicePlayBtn: {
        background: 'transparent', border: 'none', cursor: 'pointer',
        padding: 0, display: 'flex', alignItems: 'center'
    },
    voiceWaveform: { flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden' },
    voiceProgress: { width: '0%', height: '100%', borderRadius: '2px' },
    voiceMicIcon: { display: 'flex', alignItems: 'center' },
    inputArea: {
        minHeight: "80px", backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)", borderTop: "1px solid #f1f5f9",
        padding: "15px 40px", display: "flex", alignItems: "flex-end", gap: "15px",
        position: "sticky", bottom: 0,
    },
    whatsappAttachBtn: {
        background: '#f1f5f9', border: 'none', width: '45px', height: '45px',
        borderRadius: '14px', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'all 0.2s', marginBottom: '4px'
    },
    whatsappInputWrapper: {
        flex: 1, background: '#f8fafc', borderRadius: '20px',
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        minHeight: '52px', border: '1px solid #e2e8f0',
        marginBottom: '2px',
    },
    pillInput: {
        width: '100%', border: 'none', outline: 'none',
        fontSize: '1.05rem', color: '#0f172a', background: 'transparent',
        fontWeight: '500'
    },
    recordingText: {
        display: 'flex', alignItems: 'center', gap: '15px', width: '100%',
        color: '#ef4444', fontWeight: '700'
    },
    cancelRecordingBtn: {
        marginLeft: 'auto', background: 'transparent', border: 'none',
        color: '#64748b', fontWeight: '800', cursor: 'pointer', padding: '5px 10px',
    },
    whatsappMicBtn: {
        width: "50px", height: "50px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        border: "none", color: "#fff", cursor: "pointer",
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '16px', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
        marginBottom: '1px',
    },
    whatsappSendBtnActive: {
        width: "50px", height: "50px", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        border: "none", borderRadius: "16px", color: "#fff",
        cursor: "pointer", display: 'flex', alignItems: 'center',
        justifyContent: "center", boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
        marginBottom: '1px', transition: 'all 0.2s',
    },
    uploadingOverlay: {
        position: 'absolute', bottom: '100px', right: '40px',
        background: 'rgba(255,255,255,0.95)', padding: '15px 25px',
        borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: '15px',
        zIndex: 10, animation: 'fadeIn 0.3s', border: '1px solid #f1f5f9',
        fontWeight: '700', color: '#0f172a'
    },
    recordingOverlay: {
        flex: 1, height: '50px', background: '#fee2e2', borderRadius: '14px',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: '15px'
    },
    recordingPulse: {
        width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%',
        animation: 'pulse 1s infinite'
    },
    stopRecordingBtn: {
        marginLeft: 'auto', background: '#fff', border: 'none',
        padding: '5px 12px', borderRadius: '8px', color: '#ef4444',
        fontWeight: '700', cursor: 'pointer'
    },
    noActiveChat: {
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", color: "#64748b",
        backgroundColor: "#f8fafc",
    },
    noChatIcon: {
        color: '#cbd5e1', marginBottom: "25px"
    },
    noChatTitle: {
        fontSize: "1.6rem", color: "#0f172a", fontWeight: "900", marginBottom: "12px", letterSpacing: "-0.5px"
    },
    noChatText: {
        fontSize: "1rem", color: "#64748b", maxWidth: "350px", textAlign: "center", lineHeight: "1.6"
    },
    modalOverlay: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    },
    modal: {
        backgroundColor: "#fff", borderRadius: "32px", width: "90%",
        maxWidth: "450px", padding: "40px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    modalTitle: { margin: 0, color: "#0f172a", fontWeight: "900", fontSize: "1.5rem", letterSpacing: "-0.5px" },
    closeBtn: { background: "#f1f5f9", border: "none", borderRadius: "10px", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: "bold" },
    contactsList: { display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto", paddingRight: "5px" },
    contactItem: {
        display: "flex", alignItems: "center", gap: "18px", padding: "16px",
        borderRadius: "20px", cursor: "pointer", border: "1px solid #f1f5f9",
        transition: "all 0.2s", backgroundColor: "#fff"
    },
    contactInfo: { display: "flex", flexDirection: "column", gap: "2px" },
    contactName: { margin: 0, fontWeight: "800", color: "#0f172a", fontSize: "1.1rem" },
    contactRole: { margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
    noContacts: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 0', color: '#64748b', fontWeight: '600'
    },
    incomingCallOverlay: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(15,23,42,0.95)", backdropFilter: "blur(15px)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 2000,
    },
    callModal: {
        backgroundColor: "#fff", padding: "50px", borderRadius: "40px",
        textAlign: "center", width: "380px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    },
    callAvatarLarge: {
        width: "110px", height: "110px", borderRadius: "35px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "3rem", fontWeight: "900",
        margin: "0 auto 30px", boxShadow: "0 15px 30px rgba(15, 23, 42, 0.2)"
    },
    callActions: { display: "flex", gap: "15px", marginTop: "40px" },
    acceptBtn: { flex: 1, padding: "16px", borderRadius: "18px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", fontWeight: "800", fontSize: "1.05rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)" },
    rejectBtn: { flex: 1, padding: "16px", borderRadius: "18px", background: "#f1f5f9", color: "#ef4444", fontWeight: "800", fontSize: "1.05rem", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    callOverlay: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "#020617", zIndex: 3000,
    },
    activeCallWindow: { width: "100%", height: "100%", position: "relative", display: 'flex', flexDirection: 'column' },
    videoContainer: { flex: 1, position: 'relative' },
    fullVideo: { width: '100%', height: '100%', objectFit: 'cover' },
    pipVideo: {
        position: 'absolute', top: '40px', right: '40px',
        width: '180px', height: '260px', borderRadius: '24px',
        overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)',
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)", backgroundColor: "#0f172a"
    },
    localVideoBox: { width: '100%', height: '100%', objectFit: 'cover' },
    callingState: {
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: '#fff'
    },
    audioCallInterface: {
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '20px'
    },
    callFooter: { padding: '50px', background: 'linear-gradient(0deg, rgba(2,6,23,0.9) 0%, rgba(2,6,23,0) 100%)' },
    callControlsRow: { display: 'flex', justifyContent: 'center', gap: '25px' },
    controlBtn: {
        width: '65px', height: '65px', borderRadius: '22px', border: 'none',
        fontSize: '1.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)', color: '#fff', transition: 'all 0.2s',
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
    },
    whatsappEndBtn: {
        width: '65px', height: '65px', borderRadius: '22px', border: 'none',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', fontSize: '1.8rem',
        transform: 'rotate(135deg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)"
    }
};

// Add CSS animation for pulse
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);
