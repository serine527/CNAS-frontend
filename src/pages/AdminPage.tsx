// src/pages/AdminPage.tsx

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { 
  FaUsers, 
  FaDesktop, 
  FaClock, 
  FaBell, 
  FaSignOutAlt, 
  FaChartLine, 
  FaChartBar,
  FaPlus 
} from "react-icons/fa";

import { Line, Bar } from "react-chartjs-2";
import CNASLogo from "../assets/CNAS_logo.png";
import "./AdminPage.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // State for total agents (dynamic)
  const [totalAgents, setTotalAgents] = useState(15);
  
  // Optional: list of agents (you can display it later if you want)
  const [agents, setAgents] = useState<string[]>([
    "أحمد محمد", "سارة علي", "خالد حسن", "نور الدين", "فاطمة زهرة"
  ]);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");

  const lineData = {
    labels: ["08:00", "10:00", "12:00", "14:00", "16:00"],
    datasets: [{
      label: "التذاكر المعالجة",
      data: [35, 60, 40, 75, 50],
      borderColor: "#0066FF",
      backgroundColor: "rgba(0, 102, 255, 0.1)",
      tension: 0.4,
      fill: true,
    }]
  };

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const handleAddAgent = () => {
    if (newAgentName.trim() === "") return;
    
    setAgents(prev => [...prev, newAgentName.trim()]);
    setTotalAgents(prev => prev + 1);
    setNewAgentName("");
    setShowAddModal(false);
  };

  return (
    <div className="admin-root">
      {/* HEADER */}
      <header className="admin-header">
        <div className="header-right-section">
          <img src={CNASLogo} alt="CNAS" className="admin-header-logo" />
          <div className="header-text-box">
            <span className="header-main-title">لوحة التحكم الإدارية</span>
            <span className="header-sub-title">نظام إدارة الطوابير - CNAS</span>
          </div>
        </div>

        <div className="header-left-section">
          <div className="notification-wrapper">
            <FaBell />
            <span className="notification-badge"></span>
          </div>
          <div className="admin-profile-pill">
            <div className="admin-avatar-circle">AD</div>
            <span className="admin-profile-name">مدير النظام</span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> تسجيل الخروج
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="admin-container">
        {/* Stats Row */}
        <section className="admin-stats-row">
          
          {/* Total Agents Card with + Button */}
          <div className="admin-stat-card">
            <div className="stat-icon-wrap blue"><FaUsers /></div>
            <div className="stat-data">
              <span className="stat-label">إجمالي الوكلاء</span>
              <span className="stat-value">{totalAgents}</span>
            </div>
            {/* + Button */}
            <button 
              className="add-agent-btn"
              onClick={() => setShowAddModal(true)}
              title="إضافة وكيل جديد"
            >
              <FaPlus />
            </button>
          </div>

          {/* Other stat cards */}
          <div className="admin-stat-card">
            <div className="stat-icon-wrap orange"><FaDesktop /></div>
            <div className="stat-data">
              <span className="stat-label">الشبابيك النشطة</span>
              <span className="stat-value">08</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon-wrap green"><FaUsers /></div>
            <div className="stat-data">
              <span className="stat-label">المواطنون في الانتظار</span>
              <span className="stat-value">43</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon-wrap blue"><FaClock /></div>
            <div className="stat-data">
              <span className="stat-label">متوسط وقت الانتظار</span>
              <span className="stat-value">12 دقيقة</span>
            </div>
          </div>
        </section>

        {/* Charts and Table (unchanged) */}
        <section className="admin-charts-grid">
          <div className="admin-chart-box">
            <div className="chart-header">
              <FaChartLine /> <h3>إحصائيات التذاكر اليومية</h3>
            </div>
            <div className="chart-wrapper">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="admin-chart-box">
            <div className="chart-header">
              <FaChartBar /> <h3>وقت الانتظار لكل مصلحة</h3>
            </div>
            <div className="chart-wrapper">
              <Bar data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </section>

        <section className="admin-table-section">
          <div className="table-header-box">
            <h3>ملخص الخدمات الحالية</h3>
          </div>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>المصلحة</th>
                <th>المستخدمون في الانتظار</th>
                <th>متوسط الوقت</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "التقاعد والمنح", count: 10, time: "15 دقيقة", status: "نشط" },
                { name: "الرقابة الطبية", count: 5, time: "8 دقائق", status: "نشط" },
                { name: "تأمين المرض", count: 8, time: "12 دقيقة", status: "نشط" },
                { name: "الأداءات والتعويضات", count: 12, time: "10 دقائق", status: "نشط" },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="font-bold">{row.name}</td>
                  <td><span className="waiting-pill">{row.count}</span></td>
                  <td>{row.time}</td>
                  <td><span className="status-badge-active">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>إضافة وكيل جديد</h3>
            <input
              type="text"
              placeholder="اسم الوكيل"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="modal-input"
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowAddModal(false)}>
                إلغاء
              </button>
              <button className="modal-add" onClick={handleAddAgent}>
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}