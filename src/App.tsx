import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import BeneficiaryPage from "./pages/Beneficiary/BeneficiaryPage";
import AgentPage from "./pages/agent/AgentPage";
import AdminPage from "./pages/AdminPage";
import AgentProfilePage from "./pages/agent/AgentProfilePage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/beneficiary" element={<BeneficiaryPage />} />
      <Route path="/agent" element={<AgentPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/agent/profile" element={<AgentProfilePage />} />
    </Routes>
  );
}