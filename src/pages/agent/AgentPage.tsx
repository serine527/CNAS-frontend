// src/pages/AgentPage.tsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  useSystem,
  allServices,
  getCategoryForService,
  type ServiceCategory,
} from "../../context/SystemContext";
import CNASLogo from "../../assets/CNAS_logo.png";
import { AiFillSound } from "react-icons/ai";
import "./AgentPage.css";
import { FaSignOutAlt } from "react-icons/fa";
import {
  FiUser,
  FiLock,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
// ─── Types ────────────────────────────────────────────────────────────────────
type TicketStatus = "waiting" | "serving" | "paused" | "done" | "skipped";

interface Ticket {
  id: number;
  number: string;
  service: string;
  arrivalTime: string;
  status: TicketStatus;
  waitMinutes: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<TicketStatus, string> = {
  waiting: "في الانتظار",
  serving: "قيد الخدمة",
  paused: "موقوف",
  done: "تمت الخدمة",
  skipped: "تم التخطي",
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  waiting: "#94a3b8",
  serving: "#16a84c",
  paused: "#d19c40",
  done: "#3b82f6",
  skipped: "#a72222",
};

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  prestation: "خدمات الاستحقاقات",
  medical: "الخدمات الطبية",
};

const CATEGORY_COLOR: Record<ServiceCategory, { bg: string; text: string; border: string }> = {
  prestation: { bg: "rgba(0,71,171,0.09)", text: "#0047ab", border: "#0047ab" },
  medical:    { bg: "rgba(22,168,76,0.10)", text: "#16a84c", border: "#16a84c" },
};

// ─── Mock queue generator ─────────────────────────────────────────────────────
const generateQueue = (filterService?: string): Ticket[] => {
  const pool = filterService ? [filterService] : allServices;
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    number: `A${String(i + 1).padStart(3, "0")}`,
    service: pool[i % pool.length],
    arrivalTime: `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
    status: i === 0 ? "serving" : "waiting",
    waitMinutes: (i + 1) * 7,
  }));
};

// ─── Audio ────────────────────────────────────────────────────────────────────
const playDing = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);
    oscillator.onended = () => ctx.close();
  } catch (e) {
    console.warn("Audio playback failed:", e);
  }
};

/*     ////////////////////////////////////////////////////
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <>{time.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</>
  );
}  */

// ─── Mode Badge (header button showing current mode) ─────────────────────────
function ModeBadge({ isMulti, assignedService, category }: {
  isMulti: boolean;
  assignedService?: string;
  category?: ServiceCategory;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mode-badge-wrapper" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <div className={`mode-badge ${isMulti ? "mode-badge--multi" : "mode-badge--single"}`}>
        <span className="mode-badge__dot" />
        <span className="mode-badge__icon">{isMulti ? "⫶" : "◈"}</span>
        <span className="mode-badge__label">
          {isMulti ? "نظام متعدد الشبابيك" : "نظام شباك واحد"}
        </span>
      </div>

      {showTooltip && (
        <div className="mode-tooltip">
          <div className="mode-tooltip__title">
            {isMulti ? "وضع متعدد الشبابيك" : "وضع الشباك الواحد"}
          </div>
          {isMulti && assignedService ? (
            <>
              <div className="mode-tooltip__row">
                <span className="mode-tooltip__key">التصنيف</span>
                <span
                  className="mode-tooltip__val mode-tooltip__chip"
                  style={category ? {
                    background: CATEGORY_COLOR[category].bg,
                    color: CATEGORY_COLOR[category].text,
                    border: `1px solid ${CATEGORY_COLOR[category].border}`,
                  } : {}}
                >
                  {category ? CATEGORY_LABEL[category] : "—"}
                </span>
              </div>
              <div className="mode-tooltip__row">
                <span className="mode-tooltip__key">الخدمة المخصصة</span>
                <span className="mode-tooltip__val mode-tooltip__service">{assignedService}</span>
              </div>
              <p className="mode-tooltip__note">
                هذا الشباك مخصص حصراً لهذه الخدمة. التذاكر المعروضة مفلترة تلقائياً.
              </p>
            </>
          ) : (
            <p className="mode-tooltip__note">
              يعالج هذا الشباك جميع الخدمات. لا يوجد تصفية مطبّقة.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Assigned Service Banner (shown inside main col in multi mode) ────────────
function AssignedServiceBanner({ service, category }: { service: string; category: ServiceCategory }) {
  const colors = CATEGORY_COLOR[category];
  return (
    <div className="assigned-banner" style={{ borderColor: colors.border, background: colors.bg }}>
      <div className="assigned-banner__left">
        <span className="assigned-banner__chip" style={{ color: colors.text, borderColor: colors.border }}>
          {CATEGORY_LABEL[category]}
        </span>
        <span className="assigned-banner__label" style={{ color: colors.text }}>الخدمة المخصصة لهذا الشباك</span>
      </div>
      <div className="assigned-banner__service" style={{ color: colors.text }}>
        {service}
      </div>
      <div className="assigned-banner__badge" style={{ background: colors.text }}>
        مقيّد
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AgentPage() {
  const navigate = useNavigate();
  const { logout, agentId, username } = useContext(AuthContext);
  const { isMulti, getAgent } = useSystem();

  // Resolve this agent's assignment from the agents roster in SystemContext
  const agentRecord      = agentId != null ? getAgent(agentId) : undefined;
  const assignedService  = isMulti ? (agentRecord?.assignedService ?? undefined) : undefined;
  const assignedCategory = isMulti && assignedService ? getCategoryForService(assignedService) : undefined;

  // Queue is filtered to assigned service in multi mode, otherwise all services
  const [queue, setQueue] = useState<Ticket[]>(() => generateQueue(assignedService));
  const [isPaused, setIsPaused] = useState(false);
  const [servedToday, setServedToday] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

// ─── Profile Modal State ─────────────────────────────
const [showProfile, setShowProfile] = useState(false);
const [showMenu, setShowMenu] = useState(false);
const [profileMenu, setProfileMenu] = useState(false);
const [view, setView] = useState<"dashboard" | "profile" | "password">("dashboard");

const [profileData, setProfileData] = useState({
  name: "",
  lastName: "",
  username: username || "",
  guichet: "",
  service: assignedService || "",
  sousService: assignedCategory || "",
  password: "",
});

const [passwordData, setPasswordData] = useState({
  current: "",
  new: "",
  confirm: "",
});

const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Re-generate queue whenever mode or assigned service changes
  useEffect(() => {
    setQueue(generateQueue(isMulti ? assignedService : undefined));
    setServedToday(0);
    setIsPaused(false);
  }, [isMulti, assignedService]);

  useEffect(() => {
  if (agentRecord) {
    setProfileData((prev) => ({
      ...prev,
      name: agentRecord.name || "",
      lastName: agentRecord.lastName || "",
    }));
  }
}, [agentRecord]);

  const current = queue.find((t) => t.status === "serving") ?? null;
  const waiting = queue.filter((t) => t.status === "waiting");
  const done    = queue.filter((t) => t.status === "done" || t.status === "skipped");

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const callNext = () => {
    if (isPaused) return notify("الخدمة موقوفة. يرجى رفع الإيقاف أولاً.");
    const nextWaiting = queue.find((t) => t.status === "waiting");
    if (!nextWaiting) return notify("لا توجد تذاكر في الانتظار.");
    setQueue((prev) =>
      prev.map((t) => {
        if (t.status === "serving") return { ...t, status: "done" };
        if (t.id === nextWaiting.id) return { ...t, status: "serving" };
        return t;
      })
    );
    if (current) setServedToday((n) => n + 1);
    notify(`تم استدعاء التذكرة ${nextWaiting.number}`);
  };

  const togglePause = () => {
    setIsPaused((p) => {
      notify(p ? "تم استئناف الخدمة" : "تم إيقاف الخدمة مؤقتاً");
      return !p;
    });
  };

  const skipCurrent = () => {
    if (!current) return;
    setQueue((prev) =>
      prev.map((t) => (t.id === current.id ? { ...t, status: "skipped" } : t))
    );
    notify(`تم تخطي التذكرة ${current.number}`);
  };

  const recallCurrent = () => {
    if (!current) return;
    playDing();
    notify(`إعادة استدعاء التذكرة ${current.number}`);
  };

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const statCards = [
    { label: "في الانتظار",  value: waiting.length,  color: "#3b82f6" },
    { label: "تمت خدمتهم",  value: servedToday,      color: "#22c55e" },
    { label: "إجمالي اليوم", value: queue.length,     color: "#8b5cf6" },
  ];

  return (
    <div className={`agent-root ${showMenu ? "menu-open" : ""}`}>
      <div className="agent-layout"></div>
      <div className="agent-bg-circle-1" />
      <div className="agent-bg-circle-2" />

      {/* Toast */}
      {notification && (
        <div className="agent-toast">
          <span>{notification}</span>
        </div>
      )}

      {/* ── HEADER ── */}
       
      <header className="agent-header">
        <div className="agent-header-left">
          <img src={CNASLogo} alt="CNAS" className="agent-header-logo" />
          <div className="agent-header-text">
            <span className="agent-header-title">الصندوق الوطني للتأمينات الاجتماعية</span>
            <span className="agent-header-sub">{username ? `الوكيل: ${username}` : "لوحة تحكم الوكيل"}</span>
          </div>
        </div>

       {/* <div className="agent-header-center">
          <div className="agent-clock-box">
            <Clock />
            <span className="agent-clock-date">
              {new Date().toLocaleDateString("ar-DZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>*/}

       <div className="agent-header-right">
  <ModeBadge
    isMulti={isMulti}
    assignedService={assignedService}
    category={assignedCategory}
  />

  <div className={`agent-status-badge ${isPaused ? "paused" : "active"}`}>
    <div className={`agent-status-dot ${isPaused ? "paused" : "active"}`} />
    {isPaused ? "موقوف" : "نشط"}
  </div>

  {/* ✅ MENU BUTTON HERE */}
  <div className="agent-menu-wrapper">
    <button
      className="agent-menu-btn"
      onClick={(e) => {
        e.stopPropagation();
        setShowMenu((prev) => !prev);
      }}
    >
      <FiMenu />
    </button>
  </div>

  <button onClick={handleLogout} className="agent-logout-btn">
    <FaSignOutAlt /> تسجيل الخروج
  </button>
 </div>
         </header>

           {/* ── MAIN ── */}
          <div className="agent-content">
          <main className="agent-main">
             {view === "dashboard" && (
    <>
             {/* Sidebar */}
           <aside className="agent-sidebar">
          <div className="agent-stats-row">
            {statCards.map((s) => (
              <div key={s.label} className="agent-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <span className="agent-stat-value" style={{ color: s.color }}>{s.value}</span>
                <span className="agent-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Queue Panel */}
          <div className="agent-queue-panel">
            <div className="agent-panel-header">
              <span className="agent-panel-title">قائمة الانتظار</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isMulti && assignedCategory && (
                  <span
                    className="queue-category-chip"
                    style={{
                      background: CATEGORY_COLOR[assignedCategory].bg,
                      color: CATEGORY_COLOR[assignedCategory].text,
                      border: `1px solid ${CATEGORY_COLOR[assignedCategory].border}`,
                    }}
                  >
                    {CATEGORY_LABEL[assignedCategory]}
                  </span>
                )}
                <span className="agent-queue-count">{waiting.length} متبقٍ</span>
              </div>
            </div>
            <div className="agent-ticket-list">
              {queue.map((ticket) => {
                const ticketCategory = getCategoryForService(ticket.service);
                const catColors = CATEGORY_COLOR[ticketCategory];
                return (
                  <div key={ticket.id} className={`agent-ticket-row ${ticket.status}`}>
                    <span className="agent-ticket-num" style={{ color: STATUS_COLOR[ticket.status] }}>
                      {ticket.number}
                    </span>
                    <div className="agent-ticket-info">
                      <span className="agent-ticket-service">{ticket.service}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        {!isMulti && (
                          <span
                            className="ticket-cat-pill"
                            style={{ background: catColors.bg, color: catColors.text }}
                          >
                            {CATEGORY_LABEL[ticketCategory]}
                          </span>
                        )}
                        <span className="agent-ticket-time">
                          وصل: {ticket.arrivalTime}
                          {ticket.status === "waiting" && ` · انتظر ${ticket.waitMinutes} د`}
                        </span>
                      </div>
                    </div>
                    <span
                      className="agent-ticket-badge"
                      style={{
                        backgroundColor: STATUS_COLOR[ticket.status] + "22",
                        color: STATUS_COLOR[ticket.status],
                      }}
                    >
                      {STATUS_LABEL[ticket.status]}
                    </span>
                    
                  </div>
                );
              })}
              
            </div>
            
          </div>
          
        </aside>

        {/* Main Column */}
        <section className="agent-main-col">

          {/* Assigned Service Banner — multi mode only */}
          {isMulti && assignedService && assignedCategory && (
            <AssignedServiceBanner service={assignedService} category={assignedCategory} />
          )}

          {/* Warning: multi mode but agent has no assignment yet */}
          {isMulti && !assignedService && (
            <div className="agent-unassigned-warning">
              <span className="agent-unassigned-icon">⚠</span>
              <div className="agent-unassigned-text">
                <strong>لم يتم تخصيص خدمة لهذا الشباك بعد.</strong>
                <span>يرجى مراجعة المدير لتعيين الخدمة المناسبة.</span>
              </div>
            </div>
          )}

          {/* Current Ticket Card */}
          <div className="agent-current-card">
            <div className="agent-current-card-header">
              <div className="agent-pulse-ring" />
              <span className="agent-current-label">التذكرة الحالية</span>
              {current && !isMulti && (
                <span
                  className="current-cat-chip"
                  style={{
                    background: CATEGORY_COLOR[getCategoryForService(current.service)].bg,
                    color:      CATEGORY_COLOR[getCategoryForService(current.service)].text,
                    border:    `1px solid ${CATEGORY_COLOR[getCategoryForService(current.service)].border}`,
                  }}
                >
                  {CATEGORY_LABEL[getCategoryForService(current.service)]}
                </span>
              )}
            </div>

            {current ? (
              <div className="agent-current-body">
                <div className="agent-big-ticket-num">{current.number}</div>
                <div className="agent-current-service">{current.service}</div>
                <div className="agent-current-meta">
                  <div className="agent-meta-item">
                    <span className="agent-meta-key">وقت الوصول</span>
                    <span className="agent-meta-val">{current.arrivalTime}</span>
                  </div>
                  <div className="agent-meta-divider" />
                  <div className="agent-meta-item">
                    <span className="agent-meta-key">وقت الانتظار</span>
                    <span className="agent-meta-val">{current.waitMinutes} دقيقة</span>
                  </div>
                  <div className="agent-meta-divider" />
                  <div className="agent-meta-item">
                    <span className="agent-meta-key">التذكرة التالية</span>
                    <span className="agent-meta-val">{waiting[0]?.number ?? "—"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="agent-empty-state">
                <div className="agent-empty-icon">⏳</div>
                <p className="agent-empty-text">لا توجد تذكرة قيد الخدمة</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="agent-actions-grid">
            <button
              onClick={togglePause}
              className={`agent-action-btn ${isPaused ? "agent-btn-resume" : "agent-btn-pause"}`}
            >
              <span className="agent-btn-icon">{isPaused ? "▶" : "⏸"}</span>
              {isPaused ? "استئناف الخدمة" : "إيقاف مؤقت"}
            </button>

            <button
              onClick={callNext}
              disabled={isPaused || waiting.length === 0}
              className="agent-action-btn agent-btn-primary"
              style={{ opacity: isPaused || waiting.length === 0 ? 0.5 : 1 }}
            >
              <span className="agent-btn-icon">▶▶</span>
              استدعاء التذكرة التالية
              {waiting[0] && <span className="agent-btn-sub">{waiting[0].number}</span>}
            </button>

            <button
              onClick={skipCurrent}
              disabled={!current}
              className="agent-action-btn agent-btn-danger"
              style={{ opacity: current ? 1 : 0.4 }}
            >
              <span className="agent-btn-icon">⏭</span>
              تخطي التذكرة
            </button>
          </div>

          <button
            onClick={recallCurrent}
            disabled={!current}
            className="agent-action-btn agent-btn-secondary"
            style={{ marginTop: "12px", opacity: current ? 1 : 0.4 }}
          >
            <span className="agent-btn-icon"><AiFillSound /></span>
            إعادة الاستدعاء
          </button>

          {/* Done Log */}
          {done.length > 0 && (
            <div className="agent-done-panel">
              <span className="agent-panel-title">السجل الأخير</span>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                {done.slice(-5).reverse().map((t) => (
                  <div key={t.id} className="agent-done-row">
                    <span className="agent-done-num" style={{ color: STATUS_COLOR[t.status] }}>
                      {t.number}
                    </span>
                    <span className="agent-done-service">{t.service}</span>
                    <span
                      className="agent-done-badge"
                      style={{
                        color: STATUS_COLOR[t.status],
                        backgroundColor: STATUS_COLOR[t.status] + "18",
                      }}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        </>
  )}

  {view === "profile" && (

   

    <div className="profile-page">

     

      <div className="profile-card">

         <h2>الملف الشخصي</h2>
        <p><strong>اسم المستخدم:</strong> {username}</p>

       <p>
   <strong>الاسم:</strong>
   <input
    className="profile-input"
    value={profileData.name}
    onChange={(e) =>
      setProfileData({ ...profileData, name: e.target.value })
    }
   />
   </p>

   <p>
    <strong>اللقب:</strong>
    <input
    className="profile-input"
    value={profileData.lastName}
    onChange={(e) =>
      setProfileData({ ...profileData, lastName: e.target.value })
    }
   />
   </p>

        <p><strong>الهيكل:</strong> {agentRecord?.structure || "-"}</p>

        <p><strong>الشباك / الطابور:</strong> {agentRecord?.queue || "-"}</p>

        <p><strong>الخدمة:</strong> {assignedService || "-"}</p>

        {isMulti && (
          <>
            <p>
              <strong>التصنيف:</strong>{" "}
              {assignedCategory === "medical"
                ? "الخدمات الطبية"
                : assignedCategory === "prestation"
                ? "خدمات الاستحقاقات"
                : "-"}
            </p>

            <p>
              <strong>الخدمة الفرعية:</strong>{" "}
              {agentRecord?.subService || "-"}
            </p>
          </>
        )}
      </div>
    
    </div>
   )}

  
      </main>
    </div>
     {/* ─── PROFILE MODAL ───────────────────────────── */}
     {showProfile && (
     <div className="profile-modal-overlay">
       <div className="profile-modal">

      <h3>Profile</h3>

      <div className="profile-section">
        <label>Name</label>
        <input
          value={profileData.name}
          onChange={(e) =>
            setProfileData({ ...profileData, name: e.target.value })
          }
        />
      </div>

      <div className="profile-section">
        <label>Last Name</label>
        <input
          value={profileData.lastName}
          onChange={(e) =>
            setProfileData({ ...profileData, lastName: e.target.value })
          }
        />
      </div>

      <div className="profile-section">
        <label>Username</label>
        <input value={profileData.username} disabled />
      </div>

      <div className="profile-section">
        <label>Guichet</label>
        <input value={profileData.guichet} disabled />
      </div>

      <div className="profile-section">
        <label>Service</label>
        <input value={profileData.service} disabled />
      </div>

      <div className="profile-section">
        <label>Sous Service</label>
        <input value={profileData.sousService} disabled />
      </div>

      <div className="profile-section">
        <label>Mot de passe</label>
        <input
          type="password"
          value={profileData.password}
          onChange={(e) =>
            setProfileData({ ...profileData, password: e.target.value })
          }
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="save-btn" onClick={() => setShowProfile(false)}>
          Save
        </button>

        <button className="close-btn" onClick={() => setShowProfile(false)}>
          Close
        </button>
      </div>

    </div>
  </div>
)}
{view === "password" && (
  <div className="profile-page">
    <div className="profile-card">

      <h2>تغيير كلمة المرور</h2>

      <p>
        <strong>كلمة المرور الحالية:</strong>
        <input
          type="password"
          className="profile-input"
          value={passwordData.current}
          onChange={(e) =>
            setPasswordData({ ...passwordData, current: e.target.value })
          }
        />
      </p>

      <p>
        <strong>كلمة المرور الجديدة:</strong>
        <input
          type="password"
          className="profile-input"
          value={passwordData.new}
          onChange={(e) =>
            setPasswordData({ ...passwordData, new: e.target.value })
          }
        />
      </p>

      <p>
        <strong>تأكيد كلمة المرور:</strong>
        <input
          type="password"
          className="profile-input"
          value={passwordData.confirm}
          onChange={(e) =>
            setPasswordData({ ...passwordData, confirm: e.target.value })
          }
        />
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="save-btn" onClick={() => setShowConfirmPopup(true)}>
          حفظ
        </button>

        <button className="close-btn" onClick={() => setView("dashboard")}>
          إلغاء
        </button>
      </div>

    </div>
  </div>
)}
 <div className={`agent-drawer ${showMenu ? "open" : ""}`}>
  
  <div className="agent-drawer-header">
    <div className="drawer-user">
      <div className="drawer-avatar">
        {username ? username.charAt(0).toUpperCase() : "A"}
      </div>
      <div>
        <div className="drawer-name">{username}</div>
        <div className="drawer-role">Agent CNAS</div>
      </div>
    </div>

    <button onClick={() => setShowMenu(false)}>✕</button>
  </div>

  <div className="agent-drawer-content">
    <button
  className="drawer-item"
  onClick={() => setProfileMenu((p) => !p)}
 >
  <FiUser /> الملف الشخصي
 </button>
 {profileMenu && (
  <div className="drawer-submenu">
    
    {/* Profile view */}
    <button
      className="drawer-subitem"
      onClick={() => {
        setView("profile");
        setProfileMenu(false);
      }}
    >
      عرض الملف الشخصي
    </button>

    {/* Password view */}
    <button
      className="drawer-subitem"
      onClick={() => {
        setView("password");
        setProfileMenu(false);
      }}
    >
      تغيير كلمة المرور
    </button>

  </div>
)}

<button
  className="drawer-item"
  onClick={() => {
    setView("dashboard");
    setShowMenu(false);
  }}
>
   ⬅ العودة إلى الرئيسية
</button>

    <button
      className="drawer-item logout"
      onClick={handleLogout}
    >
      <FaSignOutAlt /> تسجيل الخروج
    </button>
  </div>

</div>

    </div>
  );
}