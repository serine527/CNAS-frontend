// src/pages/AgentPage.tsx

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CNASLogo from "../assets/CNAS_logo.png";
import "./AgentPage.css";

// ─── Types ───────────────────────────────────────────────────────────────────
type TicketStatus = "waiting" | "serving" | "paused" | "done" | "skipped";

interface Ticket {
  id: number;
  number: string;
  service: string;
  arrivalTime: string;
  status: TicketStatus;
  waitMinutes: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const generateQueue = (): Ticket[] =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    number: `A${String(i + 1).padStart(3, "0")}`,
    service: ["تسوية المنازعات", "منح التعويضات", "استفسارات الضمان", "تحديث الملفات", "شهادات العمل"][i % 5],
    arrivalTime: `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
    status: i === 0 ? "serving" : "waiting",
    waitMinutes: (i + 1) * 7,
  }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<TicketStatus, string> = {
  waiting:  "في الانتظار",
  serving:  "قيد الخدمة",
  paused:   "موقوف",
  done:     "تمت الخدمة",
  skipped:  "تم التخطي",
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  waiting: "#94a3b8",
  serving: "#22c55e",
  paused:  "#f59e0b",
  done:    "#3b82f6",
  skipped: "#ef4444",
};

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

// ─── Clock Sub-component ──────────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <>{time.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AgentPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [queue, setQueue]               = useState<Ticket[]>(generateQueue());
  const [isPaused, setIsPaused]         = useState(false);
  const [servedToday, setServedToday]   = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

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
        if (t.status === "serving")   return { ...t, status: "done" };
        if (t.id === nextWaiting.id)  return { ...t, status: "serving" };
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
    playDing()
    notify(`إعادة استدعاء التذكرة ${current.number}`);
  };

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const statCards = [
    { label: "في الانتظار",  value: waiting.length, color: "#3b82f6" },
    { label: "تمت خدمتهم",   value: servedToday,    color: "#22c55e" },
    { label: "إجمالي اليوم", value: queue.length,   color: "#8b5cf6" },
  ];

  return (
    <div className="agent-root">

      {/* Background decorations */}
      <div className="agent-bg-circle-1" />
      <div className="agent-bg-circle-2" />

      {/* Toast Notification */}
      {notification && (
        <div className="agent-toast">
          <span>{notification}</span>
        </div>
      )}

      {/* ══════════════ HEADER ══════════════ */}
      <header className="agent-header">

        <div className="agent-header-left">
          <img src={CNASLogo} alt="CNAS" className="agent-header-logo" />
          <div className="agent-header-text">
            <span className="agent-header-title">الصندوق الوطني للتأمينات الاجتماعية</span>
            <span className="agent-header-sub">لوحة تحكم الوكيل</span>
          </div>
        </div>

        <div className="agent-header-center">
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
        </div>

        <div className="agent-header-right">
          <div className={`agent-status-badge ${isPaused ? "paused" : "active"}`}>
            <div className={`agent-status-dot ${isPaused ? "paused" : "active"}`} />
            {isPaused ? "موقوف" : "نشط"}
          </div>
          <button onClick={handleLogout} className="agent-logout-btn">
            تسجيل الخروج
          </button>
        </div>

      </header>

      {/* ══════════════ MAIN ══════════════ */}
      <main className="agent-main">

        {/* ── Sidebar: Stats + Queue List ── */}
        <aside className="agent-sidebar">

          {/* Stats */}
          <div className="agent-stats-row">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="agent-stat-card"
                style={{ borderTop: `3px solid ${s.color}` }}
              >
                <span className="agent-stat-value" style={{ color: s.color }}>
                  {s.value}
                </span>
                <span className="agent-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Queue List */}
          <div className="agent-queue-panel">
            <div className="agent-panel-header">
              <span className="agent-panel-title">قائمة الانتظار</span>
              <span className="agent-queue-count">{waiting.length} متبقٍ</span>
            </div>

            <div className="agent-ticket-list">
              {queue.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`agent-ticket-row ${ticket.status}`}
                >
                  <span
                    className="agent-ticket-num"
                    style={{ color: STATUS_COLOR[ticket.status] }}
                  >
                    {ticket.number}
                  </span>

                  <div className="agent-ticket-info">
                    <span className="agent-ticket-service">{ticket.service}</span>
                    <span className="agent-ticket-time">
                      وصل: {ticket.arrivalTime}
                      {ticket.status === "waiting" && ` · انتظر ${ticket.waitMinutes} د`}
                    </span>
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
              ))}
            </div>
          </div>

        </aside>

        {/* ── Main Column: Current Ticket + Controls ── */}
        <section className="agent-main-col">

          {/* Current Ticket Card */}
          <div className="agent-current-card">
            <div className="agent-current-card-header">
              <div className="agent-pulse-ring" />
              <span className="agent-current-label">التذكرة الحالية</span>
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
              onClick={callNext}
              disabled={isPaused || waiting.length === 0}
              className="agent-action-btn agent-btn-primary"
              style={{ opacity: isPaused || waiting.length === 0 ? 0.5 : 1 }}
            >
              <span className="agent-btn-icon">▶▶</span>
              استدعاء التذكرة التالية
              {waiting[0] && (
                <span className="agent-btn-sub">{waiting[0].number}</span>
              )}
            </button>

            <button
              onClick={togglePause}
              className={`agent-action-btn ${isPaused ? "agent-btn-resume" : "agent-btn-pause"}`}
            >
              <span className="agent-btn-icon">{isPaused ? "▶" : "⏸"}</span>
              {isPaused ? "استئناف الخدمة" : "إيقاف مؤقت"}
            </button>

            <button
              onClick={recallCurrent}
              disabled={!current}
              className="agent-action-btn agent-btn-secondary"
              style={{ opacity: current ? 1 : 0.4 }}
            >
              <span className="agent-btn-icon">🔊</span>
              إعادة الاستدعاء
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

          {/* Done / Skipped Log */}
          {done.length > 0 && (
            <div className="agent-done-panel">
              <span className="agent-panel-title">السجل الأخير</span>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                {done.slice(-5).reverse().map((t) => (
                  <div key={t.id} className="agent-done-row">
                    <span
                      className="agent-done-num"
                      style={{ color: STATUS_COLOR[t.status] }}
                    >
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
      </main>
    </div>
  );
}
