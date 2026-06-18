import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if already logged in
    const role = localStorage.getItem("userRole");
    if (role === "client") navigate("/client-dashboard");
    else if (role === "lawyer") navigate("/lawyer-dashboard");
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <span style={styles.logoText}><span style={styles.logoAccent}>Legal</span>Connect</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#how-it-works" style={styles.navLink}>Process</a>
            <a href="#features" style={styles.navLink}>Infrastructure</a>
            <a href="#education" style={styles.navLink}>Intelligence</a>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/signup" style={styles.navLinkPrimary}>Initialize Workspace</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Elite Legal Infrastructure
          </div>
          <h1 style={styles.heroTitle}>
            Architecting the Future of <br />
            <span style={styles.accentText}>Legal Intelligence</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Seamlessly synchronize with elite legal experts through high-fidelity digital workspaces.
            Engineered for speed, secured with military-grade precision.
          </p>
          <div style={styles.heroActions}>
            <Link to="/signup" style={styles.ctaButton}>Access Legal Context</Link>
            <Link to="/signup" style={styles.secondaryButton}>Join the Network</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="features" style={styles.section}>
        <div style={styles.contentWrapper}>
          <div style={styles.sectionBadge}>Capabilities</div>
          <h2 style={styles.sectionTitle}>Digital Infrastructure for Global Justice</h2>
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIconBox}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h3 style={styles.featureCardTitle}>Elite Verification</h3>
              <p style={styles.featureCardText}>
                Our network consists exclusively of verified legal intelligence professionals,
                vetted through 12-point authentication protocols.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIconBox}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <h3 style={styles.featureCardTitle}>Real-time Strategy</h3>
              <p style={styles.featureCardText}>
                Execute high-impact consultations instantly with integrated voice, video,
                and data synchronization.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIconBox}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <h3 style={styles.featureCardTitle}>Encrypted Intelligence</h3>
              <p style={styles.featureCardText}>
                Secure your case strategy in high-performance document vaults,
                protected by advanced cryptographic layers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={styles.darkSection}>
        <div style={styles.contentWrapper}>
          <div style={{ ...styles.sectionBadge, backgroundColor: 'rgba(255,255,255,0.1)', color: '#60a5fa' }}>Operational Logic</div>
          <h2 style={{ ...styles.sectionTitle, color: '#fff' }}>The Protocol</h2>
          <div style={styles.stepGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>01</div>
              <h3 style={styles.stepTitle}>Initialize Workspace</h3>
              <p style={styles.stepText}>Establish your secure identity through our high-trust legal verification gateway.</p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>02</div>
              <h3 style={styles.stepTitle}>Context Matching</h3>
              <p style={styles.stepText}>Discover experts using our multi-vector search to find the perfect legal alignment.</p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>03</div>
              <h3 style={styles.stepTitle}>Execute Strategy</h3>
              <p style={styles.stepText}>Initiate high-frequency consultations through our integrated virtual strategy office.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Education Hub Section */}
      <section id="education" style={styles.section}>
        <div style={styles.contentWrapper}>
          <div style={styles.sectionBadge}>Intelligence</div>
          <h2 style={styles.sectionTitle}>Legal Education & Strategy</h2>
          <div style={styles.educationGrid}>
            <div style={styles.educationCard}>
              <div style={styles.eduIconFrame}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
              </div>
              <h3 style={styles.eduTitle}>Video Intelligence</h3>
              <p style={styles.eduText}>Complex legal frameworks decoded through high-impact visual series.</p>
            </div>
            <div style={styles.educationCard}>
              <div style={styles.eduIconFrame}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              <h3 style={styles.eduTitle}>Rights Management</h3>
              <p style={styles.eduText}>Comprehensive analysis of various case-law models and legal structures.</p>
            </div>
            <div style={styles.educationCard}>
              <div style={styles.eduIconFrame}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01" /><path d="M12 16h.01" /><path d="M12 12h.01" /><path d="M12 8h.01" /><path d="M12 4h.01" /><path d="M3 20h.01" /><path d="M3 16h.01" /><path d="M3 12h.01" /><path d="M3 8h.01" /><path d="M3 4h.01" /><path d="M21 20h.01" /><path d="M21 16h.01" /><path d="M21 12h.01" /><path d="M21 8h.01" /><path d="M21 4h.01" /></svg>
              </div>
              <h3 style={styles.eduTitle}>Professional Decryption</h3>
              <p style={styles.eduText}>Deep-dive strategic insights from our most successful legal operators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>LegalConnect</div>
            <p style={styles.footerDesc}>Empowering justice through modern technology and verified expertise across the country.</p>
          </div>
          <div style={styles.footerLinks}>
            <div style={styles.linkGroup}>
              <h4 style={styles.linkGroupTitle}>Platform</h4>
              <a href="#" style={styles.footerLink}>Find Match</a>
              <a href="#" style={styles.footerLink}>Operational Protocal</a>
              <a href="#" style={styles.footerLink}>Legal Heritage</a>
            </div>
            <div style={styles.linkGroup}>
              <h4 style={styles.linkGroupTitle}>Architecture</h4>
              <a href="#" style={styles.footerLink}>Protocols of Service</a>
              <a href="#" style={styles.footerLink}>Data Governance</a>
              <a href="#" style={styles.footerLink}>Security Policy</a>
            </div>
            <div style={styles.linkGroup}>
              <h4 style={styles.linkGroupTitle}>Intelligence Hub</h4>
              <a href="#" style={styles.footerLink}>Strategic Desk</a>
              <a href="#" style={styles.footerLink}>Context Center</a>
              <a href="#" style={styles.footerLink}>Common Queries</a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2026 LegalConnect. High-Performance Legal Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: "#0f172a",
    scrollBehavior: "smooth",
  },
  nav: {
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    padding: "15px 0",
  },
  navContent: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
  },
  logoText: {
    fontSize: "1.4rem",
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: "-0.8px",
  },
  logoAccent: {
    color: "#2563eb",
  },
  navLinks: {
    display: "flex",
    gap: "35px",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#64748b",
    fontWeight: "700",
    fontSize: "0.95rem",
    transition: "color 0.3s",
  },
  navLinkPrimary: {
    textDecoration: "none",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "0.95rem",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
    transition: "all 0.3s ease",
  },
  hero: {
    minHeight: "100vh",
    paddingTop: "100px",
    backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    position: "relative",
  },
  heroOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1000px",
    padding: "0 30px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    border: "1px solid rgba(37, 99, 235, 0.3)",
    padding: "10px 20px",
    borderRadius: "50px",
    fontSize: "0.85rem",
    fontWeight: "800",
    color: "#60a5fa",
    marginBottom: "35px",
    backdropFilter: "blur(8px)",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
  },
  heroTitle: {
    fontSize: "5rem",
    lineHeight: "1.05",
    fontWeight: "900",
    marginBottom: "30px",
    letterSpacing: "-3px",
    color: "#fff",
  },
  accentText: {
    background: "linear-gradient(90deg, #60a5fa, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "1.3rem",
    color: "#94a3b8",
    lineHeight: "1.8",
    maxWidth: "750px",
    margin: "0 auto 50px auto",
    fontWeight: "500",
  },
  heroActions: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaButton: {
    padding: "20px 45px",
    background: "linear-gradient(90deg, #2563eb, #9333ea)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "18px",
    fontWeight: "900",
    fontSize: "1.2rem",
    boxShadow: "0 15px 35px rgba(37, 99, 235, 0.4)",
    transition: "all 0.3s ease",
  },
  secondaryButton: {
    padding: "20px 45px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    textDecoration: "none",
    borderRadius: "18px",
    fontWeight: "900",
    fontSize: "1.2rem",
    backdropFilter: "blur(15px)",
    transition: "all 0.3s ease",
  },
  sectionBadge: {
    display: "inline-block",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "800",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "25px",
  },
  section: {
    padding: "160px 0",
    backgroundColor: "#fff",
  },
  darkSection: {
    padding: "160px 0",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  },
  contentWrapper: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "0 30px",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "3.8rem",
    fontWeight: "900",
    marginBottom: "80px",
    letterSpacing: "-2.5px",
    color: "#0f172a",
    lineHeight: 1,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "40px",
  },
  featureCard: {
    padding: "60px 50px",
    backgroundColor: "#f8fafc",
    borderRadius: "40px",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    textAlign: "left",
    border: "1px solid #f1f5f9",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
  },
  featureIconBox: {
    width: "70px",
    height: "70px",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "35px",
    color: "#fff",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.25)",
  },
  featureCardTitle: {
    fontSize: "1.7rem",
    fontWeight: "900",
    marginBottom: "20px",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  featureCardText: {
    fontSize: "1.1rem",
    color: "#64748b",
    lineHeight: "1.8",
    fontWeight: "500",
  },
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "45px",
  },
  stepCard: {
    padding: "50px",
    textAlign: "left",
    borderRadius: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(5px)",
  },
  stepNumber: {
    fontSize: "5rem",
    fontWeight: "950",
    background: "linear-gradient(90deg, #3b82f6, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    opacity: 0.5,
    lineHeight: 1,
    marginBottom: "20px",
    letterSpacing: "-5px",
  },
  stepTitle: {
    fontSize: "1.9rem",
    fontWeight: "900",
    color: "#f8fafc",
    marginBottom: "20px",
    letterSpacing: "-0.5px",
  },
  stepText: {
    fontSize: "1.15rem",
    color: "#94a3b8",
    lineHeight: "1.8",
    fontWeight: "450",
  },
  educationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "40px",
  },
  educationCard: {
    padding: "55px",
    backgroundColor: "#fff",
    borderRadius: "40px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.03)",
    transition: "all 0.3s ease",
    border: "1px solid #f1f5f9",
    textAlign: "left",
  },
  eduIconFrame: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    marginBottom: "40px",
    border: "1px solid #f1f5f9",
  },
  eduTitle: {
    fontSize: "1.7rem",
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: "15px",
    letterSpacing: "-0.5px",
  },
  eduText: {
    fontSize: "1.1rem",
    color: "#64748b",
    lineHeight: "1.7",
    fontWeight: "500",
  },
  footer: {
    backgroundColor: "#020617",
    padding: "140px 0 70px 0",
    color: "#fff",
  },
  footerContent: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "0 30px 100px 30px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "80px",
  },
  footerBrand: {
    maxWidth: "400px",
  },
  footerLogo: {
    fontSize: "2.2rem",
    fontWeight: "950",
    marginBottom: "30px",
    letterSpacing: "-1.5px",
    background: "linear-gradient(90deg, #fff, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  footerDesc: {
    color: "#94a3b8",
    lineHeight: "1.9",
    fontSize: "1.1rem",
    fontWeight: "500",
  },
  footerLinks: {
    display: "flex",
    gap: "110px",
    flexWrap: "wrap",
  },
  linkGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  linkGroupTitle: {
    fontSize: "1.2rem",
    fontWeight: "900",
    marginBottom: "15px",
    color: "#fff",
    letterSpacing: "0.5px",
  },
  footerLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "1.05rem",
    fontWeight: "600",
    transition: "color 0.3s",
  },
  footerBottom: {
    textAlign: "center",
    paddingTop: "70px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    color: "#475569",
    fontSize: "1rem",
    fontWeight: "600",
    letterSpacing: "1px",
  },
};

// Global styles & animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes scrollAnimation {
      0% { top: 8px; opacity: 1; }
      100% { top: 28px; opacity: 0; }
    }
    
    .scroll-indicator {
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0.6;
    }
    
    .scroll-icon {
      width: 32px;
      height: 54px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      borderRadius: 100px;
      position: relative;
    }
    
    .scroll-icon::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 10px;
      background-color: #fff;
      border-radius: 100px;
      animation: scrollAnimation 2s infinite ease-in-out;
    }
    
    * {
      box-sizing: border-box;
    }
    
    a:hover {
      opacity: 0.8 !important;
    }

    button:hover, .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(37, 99, 235, 0.5);
    }
  `;
  document.head.appendChild(styleSheet);
}