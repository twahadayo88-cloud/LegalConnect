# LegalConnect

LegalConnect is a comprehensive, AI-driven legal matching and management platform built to bridge the gap between people seeking legal advice and professional vetted lawyers. It offers a secure, end-to-end environment capable of handling legal discovery, dynamic appointments, real-time multimedia communication, and encrypted file sharing.

The platform provides dedicated, specialized web portal environments customized individually for **Clients** and **Lawyers**, connected via a robust, real-time matching system

## 🚀 Features

### **For Clients**
* **Instant Lawyer Discovery:** Search for top-rated attorneys based on legal specialization and name queries.
* **AI Risk Assessor:** Specialized AI-driven analysis tool designed to summarize case risk-factors before you hire an attorney.
* **Secured Workspace Dashboards:** An intuitive, transparent workspace displaying case metrics, updates, and pending consultation requests.
* **Encrypted File Management:** Private, tokenized file-upload environment designed to handle legally sensitive documents smoothly.
* **Direct Consultations:** Schedule remote video or audio appointments instantly from directly within a lawyer's profile.

### **For Lawyers**
* **High-Level Case Management:** Sort, manage, and escalate multi-client cases efficiently with live status-tracking tokens.
* **Client Overview Directory:** Manage multiple client profiles simultaneously along with embedded messaging shortcuts.
* **Automated Meeting Logs:** Receive, confirm, or modify online consultations dynamically alongside real-time dashboard updates.
* **Analytics & Performance Tracking:** Native dashboard data calculating running cases and client volume per month.

### **Universal Core Engine Capabilities**
* **WhatsApp-Inspired Secure Messenger:** A fully integrated application chat client featuring deep WebRTC real-time synchronization. Supports multi-faceted interactions like standard text, emojis, instantaneous voice memo recording (with rendering audio wave-forms), and file/image transfers.
* **WebRTC Video & Voice Calls:** Integrated P2P (peer-to-peer) secure calling technology allowing users to run face-to-face video checks and low-latency audio calls through Socket.IO signaling.
* **Live Notifications:** Stay updated on case progression, chat messages, active calls, and UI presence.

---

## 🛠 Tech Stack

**Frontend Framework:** React 18 / Vite 
**Component Design / UI:** Custom "Vanilla" CSS focusing heavily on Premium Glassmorphism, Micro-Animations, and custom CSS-Tokens (No Tailwind bloat).
**Data Exchange:** Axios 
**Real-Time & Calls:** Socket.io-client, Open WebRTC APIs
**Routing:** React Router DOM V6 

**Backend Engine:** Node.js (v18+) & Express.js
**Database:** MySQL 8.0 with `mysql2` connection pooling
**Real-Time Subsystem:** Socket.io configurations supporting media file streams and signaling.
**Storage:** Configured Multer-based persistent storage.
**Security Checks:** CORS, Standardized authentication token systems (Bcrypt).

---

## ⚙️ How to Setup and Run Locally

Ensure you have **Node.js (v18+)** and **MySQL Server (v8.0+)** running locally. 

### 1. Database Configuration
1. Open up your MySQL CLI or Workbench.
2. Run the file `backend/schema.sql` completely into your active MySQL instance. This will provision the `legalconnect` database schema, generate required tables (users, roles, messages, cases, consultations), verify table links, and inject preliminary dummy testing data.

### 2. Configure Backend Variables
1. Navigate into the `/backend` folder.
2. Verify or modify the connection strings in `backend/config/db.js` if your MySQL username and password deviate from standard variables (i.e., 'root'). Or configure them using a local `.env` file containing:
   ```
   DB_HOST=localhost
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   PORT=
   ```
3. Once configured, open the terminal in `/backend` and install dependencies:
   ```bash
   npm install
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Start Frontend Interface
1. In a split/second terminal, navigate to the `/frontend` directory. 
2. Install standard frontend requirements:
   ```bash
   npm install
   ```
3. Run the optimized Vite environment:
   ```bash
   npm run dev
   ```
4. The web application will launch at `http://localhost:5173`. 

---

## 🚦 System Testing Data Credentials

For quick system verification (as seeded individually from your `schema.sql`), you can simulate the platform's multi-directional logic using the following baseline accounts:

**Lawyer Mode Simulation**
- Email: 
- Password: 

**Client Mode Simulation**
- Email: 
- Password:

---

## 📁 Repository Structure

```text
/LegalConnect
│
├── /backend                    - REST API Core + Socket Engine
│   ├── /config                 - MySQL DB connection initialization
│   ├── /middleware             - Protection logic & routing interceptors
│   ├── /routes                 - API endpoint controllers 
│   ├── /uploads                - Binary & Blob data staging server 
│   ├── package.json            - Backend Dependencies
│   ├── schema.sql              - Master Database definition file
│   └── server.js               - Node execution entry point
│
└── /frontend                   - View Engine
    ├── /public                 - Raw, unprocessed static graphic assets
    ├── /src                    
    │    ├── /assets            - Media and bundled resources
    │    ├── /components        - Core view routing files (Pages & Elements)
    │    ├── App.jsx            - Virtual DOM Root Routing Array
    │    ├── config.js          - Master routing target file
    │    ├── index.css          - Comprehensive Global styling rules
    │    └── main.jsx           - Primary React Bootstrapper
    │
    ├── index.html              - Skeleton base
    ├── package.json            - Frontend Dependencies
    └── vite.config.js          - Dev execution module mapping
```

---

## ✨ Design Language Note
The frontend utilizes a customized user-experience implementation heavily focused on high-trust, premium branding interactions. Noticeable features include CSS-based micro-animations matching modern industry-leading software metrics (specifically WhatsApp for chat portals), dynamic SVG manipulation handling resolution shifts natively, and layout-independent component arrays to resist viewport fracturing.

