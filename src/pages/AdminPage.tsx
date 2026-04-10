// src/pages/AdminPage.tsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  useSystem,
  prestationServices,
  medicalServices,
  type ServiceCategory,
  type Agent,
} from "../context/SystemContext";

import {
  FaUsers, FaDesktop, FaClock, FaBell, FaSignOutAlt,
  FaChartLine, FaChartBar, FaPlus, FaTrash, FaEdit, FaCheck,
} from "react-icons/fa";

import { Line, Bar } from "react-chartjs-2";
import CNASLogo from "../assets/CNAS_logo.png";
import "./AdminPage.css";

import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Title, Tooltip, Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend
);

interface Service {
  id: number;
  name: string;
  count: number;
  time: string;
}

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  prestation: "خدمات الاستحقاقات",
  medical: "الخدمات الطبية",
};

const CATEGORY_COLOR: Record<ServiceCategory, { bg: string; text: string; border: string }> = {
  prestation: { bg: "rgba(0,71,171,0.09)", text: "#0047ab", border: "#0047ab" },
  medical:    { bg: "rgba(22,168,76,0.10)", text: "#16a84c", border: "#16a84c" },
};

// ─── Agent Assignment Row ─────────────────────────────────────────────────────
function AgentAssignmentRow({ agent }: { agent: Agent }) {
  const { updateAgent } = useSystem();
  const [editing, setEditing]     = useState(false);
  const [category, setCategory]   = useState<ServiceCategory | "">(agent.category ?? "");
  const [service, setService]     = useState<string>(agent.assignedService ?? "");

  const serviceOptions = category === "prestation"
    ? prestationServices
    : category === "medical"
    ? medicalServices
    : [];

  const handleSave = () => {
    if (!category || !service) return;
    updateAgent(agent.id, { category, assignedService: service });
    setEditing(false);
  };

  const handleCategoryChange = (cat: ServiceCategory) => {
    setCategory(cat);
    setService(""); // reset service when category changes
  };

  const colors = agent.category ? CATEGORY_COLOR[agent.category] : null;

  return (
    <tr>
      <td className="font-bold">{agent.name}</td>
      <td>
        {editing ? (
          <select
            className="assign-select"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as ServiceCategory)}
          >
            <option value="">— اختر التصنيف —</option>
            <option value="prestation">{CATEGORY_LABEL.prestation}</option>
            <option value="medical">{CATEGORY_LABEL.medical}</option>
          </select>
        ) : agent.category ? (
          <span
            className="assign-chip"
            style={{ background: colors!.bg, color: colors!.text, border: `1px solid ${colors!.border}` }}
          >
            {CATEGORY_LABEL[agent.category]}
          </span>
        ) : (
          <span className="assign-empty">غير مخصص</span>
        )}
      </td>
      <td>
        {editing ? (
          <select
            className="assign-select"
            value={service}
            onChange={(e) => setService(e.target.value)}
            disabled={!category}
          >
            <option value="">— اختر الخدمة —</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : agent.assignedService ? (
          <span className="assign-service">{agent.assignedService}</span>
        ) : (
          <span className="assign-empty">—</span>
        )}
      </td>
      <td>
        {editing ? (
          <button
            className="assign-save-btn"
            onClick={handleSave}
            disabled={!category || !service}
            title="حفظ"
          >
            <FaCheck />
          </button>
        ) : (
          <button
            className="assign-edit-btn"
            onClick={() => setEditing(true)}
            title="تعديل"
          >
            <FaEdit />
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { config, setConfig, addAgent, removeAgent } = useSystem();

  const counterMode    = config.mode;
  const setCounterMode = (mode: "multi" | "single") => setConfig({ ...config, mode });

  // ── Services (local — not yet in context) ────────────────────────────────
  const [services, setServices] = useState<Service[]>([
    { id: 1, name: "التقاعد والمنح",      count: 10, time: "15 دقيقة" },
    { id: 2, name: "الرقابة الطبية",       count: 5,  time: "8 دقائق"  },
    { id: 3, name: "تأمين المرض",          count: 8,  time: "12 دقيقة" },
    { id: 4, name: "الأداءات والتعويضات", count: 12, time: "10 دقائق" },
  ]);

  // ── Modals ───────────────────────────────────────────────────────────────
  const [showAddAgentModal,   setShowAddAgentModal]   = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newAgentName,        setNewAgentName]        = useState("");
  const [newServiceName,      setNewServiceName]      = useState("");

  // ── Chart data ───────────────────────────────────────────────────────────
  const lineData = {
    labels: ["08:00", "10:00", "12:00", "14:00", "16:00"],
    datasets: [{
      label: "التذاكر المعالجة",
      data: [35, 60, 40, 75, 50],
      borderColor: "#0066FF",
      backgroundColor: "rgba(0, 102, 255, 0.1)",
      tension: 0.4,
      fill: true,
    }],
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = () => { logout?.(); navigate("/"); };

  const handleAddAgent = () => {
    if (!newAgentName.trim()) return;
    addAgent(newAgentName.trim());
    setNewAgentName("");
    setShowAddAgentModal(false);
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setServices((prev) => [
      ...prev,
      { id: Date.now(), name: newServiceName.trim(), count: 0, time: "—" },
    ]);
    setNewServiceName("");
    setShowAddServiceModal(false);
  };

  const handleDeleteService = (id: number) =>
    setServices((prev) => prev.filter((s) => s.id !== id));

  const unassignedCount = config.agents.filter(
    (a) => !a.assignedService
  ).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-root">

      {/* ── HEADER ── */}
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
            <span className="notification-badge" />
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

      {/* ── MAIN ── */}
      <main className="admin-container">

        {/* Stat Cards */}
        <section className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="stat-icon-wrap blue"><FaUsers /></div>
            <div className="stat-data">
              <span className="stat-label">إجمالي الوكلاء</span>
              <span className="stat-value">{config.agents.length}</span>
            </div>
            <button className="add-agent-btn" onClick={() => setShowAddAgentModal(true)} title="إضافة وكيل جديد">
              <FaPlus />
            </button>
          </div>
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

        {/* Charts */}
        <section className="admin-charts-grid">
          <div className="admin-chart-box">
            <div className="chart-header"><FaChartLine /><h3>إحصائيات التذاكر اليومية</h3></div>
            <div className="chart-wrapper">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="admin-chart-box">
            <div className="chart-header"><FaChartBar /><h3>وقت الانتظار لكل مصلحة</h3></div>
            <div className="chart-wrapper">
              <Bar data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </section>

        {/* ── Counter Mode Toggle ── */}
        <section className="admin-mode-section">
          <div className="mode-toggle-card">
            <div className="mode-toggle-label"><FaDesktop /><span>وضع العداد</span></div>
            <div className="mode-toggle-group">
              <button
                className={`mode-btn ${counterMode === "multi" ? "active" : ""}`}
                onClick={() => setCounterMode("multi")}
              >
                متعدد الشبابيك
              </button>
              <button
                className={`mode-btn ${counterMode === "single" ? "active" : ""}`}
                onClick={() => setCounterMode("single")}
              >
                شباك واحد
              </button>
            </div>
            <span className="mode-current-label">
              الوضع الحالي: {counterMode === "multi" ? "متعدد الشبابيك" : "شباك واحد"}
            </span>
          </div>
        </section>

        {/* ── Agents Table ── */}
        <section className="admin-table-section" style={{ marginBottom: 24 }}>
          <div className="table-header-box">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h3>الوكلاء</h3>
              {counterMode === "multi" && unassignedCount > 0 && (
                <span className="unassigned-warning">
                  ⚠ {unassignedCount} وكيل بدون تخصيص
                </span>
              )}
            </div>
            <button className="add-service-btn" onClick={() => setShowAddAgentModal(true)}>
              <FaPlus /> إضافة وكيل
            </button>
          </div>

          <table className="admin-data-table">
            <thead>
              <tr>
                <th>اسم الوكيل</th>
                {counterMode === "multi" && <th>التصنيف</th>}
                {counterMode === "multi" && <th>الخدمة المخصصة</th>}
                {counterMode === "multi" && <th>تعديل</th>}
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {counterMode === "multi" ? (
                config.agents.map((agent) => (
                  <tr key={agent.id}>
                    {/* Inline AgentAssignmentRow cells */}
                    <AgentAssignmentRowCells agent={agent} />
                    <td>
                      <button
                        className="delete-service-btn"
                        onClick={() => removeAgent(agent.id)}
                        title="حذف الوكيل"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                config.agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="font-bold">{agent.name}</td>
                    <td>
                      <button
                        className="delete-service-btn"
                        onClick={() => removeAgent(agent.id)}
                        title="حذف الوكيل"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* ── Services Table ── */}
        <section className="admin-table-section">
          <div className="table-header-box">
            <h3>ملخص الخدمات الحالية</h3>
            <button className="add-service-btn" onClick={() => setShowAddServiceModal(true)}>
              <FaPlus /> إضافة خدمة
            </button>
          </div>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>المصلحة</th>
                <th>المستخدمون في الانتظار</th>
                <th>متوسط الوقت</th>
                <th>الحالة</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {services.map((row) => (
                <tr key={row.id}>
                  <td className="font-bold">{row.name}</td>
                  <td><span className="waiting-pill">{row.count}</span></td>
                  <td>{row.time}</td>
                  <td><span className="status-badge-active">نشط</span></td>
                  <td>
                    <button className="delete-service-btn" onClick={() => handleDeleteService(row.id)} title="حذف الخدمة">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* ── Modal: Add Agent ── */}
      {showAddAgentModal && (
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
              <button className="modal-cancel" onClick={() => setShowAddAgentModal(false)}>إلغاء</button>
              <button className="modal-add" onClick={handleAddAgent}>إضافة</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Service ── */}
      {showAddServiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>إضافة خدمة جديدة</h3>
            <input
              type="text"
              placeholder="اسم الخدمة"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="modal-input"
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowAddServiceModal(false)}>إلغاء</button>
              <button className="modal-add" onClick={handleAddService}>إضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Extracted cells component for multi-mode agent rows ─────────────────────
function AgentAssignmentRowCells({ agent }: { agent: Agent }) {
  const { updateAgent } = useSystem();
  const [editing, setEditing]   = useState(false);
  const [category, setCategory] = useState<ServiceCategory | "">(agent.category ?? "");
  const [service, setService]   = useState<string>(agent.assignedService ?? "");

  const serviceOptions = category === "prestation"
    ? prestationServices
    : category === "medical"
    ? medicalServices
    : [];

  const handleSave = () => {
    if (!category || !service) return;
    updateAgent(agent.id, { category, assignedService: service });
    setEditing(false);
  };

  const handleCategoryChange = (cat: ServiceCategory) => {
    setCategory(cat);
    setService("");
  };

  const colors = agent.category ? CATEGORY_COLOR[agent.category] : null;

  return (
    <>
      <td className="font-bold">{agent.name}</td>
      <td>
        {editing ? (
          <select
            className="assign-select"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as ServiceCategory)}
          >
            <option value="">— التصنيف —</option>
            <option value="prestation">{CATEGORY_LABEL.prestation}</option>
            <option value="medical">{CATEGORY_LABEL.medical}</option>
          </select>
        ) : agent.category ? (
          <span
            className="assign-chip"
            style={{ background: colors!.bg, color: colors!.text, border: `1px solid ${colors!.border}` }}
          >
            {CATEGORY_LABEL[agent.category]}
          </span>
        ) : (
          <span className="assign-empty">غير مخصص</span>
        )}
      </td>
      <td>
        {editing ? (
          <select
            className="assign-select"
            value={service}
            onChange={(e) => setService(e.target.value)}
            disabled={!category}
          >
            <option value="">— الخدمة —</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : agent.assignedService ? (
          <span className="assign-service">{agent.assignedService}</span>
        ) : (
          <span className="assign-empty">—</span>
        )}
      </td>
      <td>
        {editing ? (
          <button
            className="assign-save-btn"
            onClick={handleSave}
            disabled={!category || !service}
            title="حفظ"
          >
            <FaCheck />
          </button>
        ) : (
          <button className="assign-edit-btn" onClick={() => setEditing(true)} title="تعديل">
            <FaEdit />
          </button>
        )}
      </td>
    </>
  );
}