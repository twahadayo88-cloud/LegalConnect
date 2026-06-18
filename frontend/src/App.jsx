import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ClientDashboard from "./components/ClientDashboard";
import LawyerDashboard from "./components/LawyerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./components/Home";
import FindLawyers from "./components/FindLawyers";
import MyCases from "./components/MyCases";
import Consultations from "./components/Consultations";
import Messages from "./components/Messages";
import Documents from "./components/Documents";
import LegalAssessor from "./components/LegalAssessor";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Client Routes */}
        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-lawyers"
          element={
            <ProtectedRoute>
              <FindLawyers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-cases"
          element={
            <ProtectedRoute>
              <MyCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultations"
          element={
            <ProtectedRoute>
              <Consultations />
            </ProtectedRoute>
          }
        />

        {/* Lawyer Routes */}
        <Route
          path="/lawyer-dashboard"
          element={
            <ProtectedRoute>
              <LawyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:receiverId"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessor"
          element={
            <ProtectedRoute>
              <LegalAssessor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;