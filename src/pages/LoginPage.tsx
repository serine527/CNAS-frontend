// src/pages/LoginPage.tsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSystem } from "../context/SystemContext";
import CNASLogo from "../assets/CNAS_logo.png";
import "./LoginPage.css";

// ─── Hardcoded credentials ────────────────────────────────────────────────────
// Agent passwords are keyed by agentId — in a real app this comes from a backend
const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

const AGENT_PASSWORDS: Record<number, string> = {
  1: "agent001",
  2: "agent002",
  3: "agent003",
  4: "agent004",
  5: "agent005",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { config } = useSystem();

  const [tab, setTab]           = useState<"agent" | "admin">("agent");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      if (tab === "admin") {
        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          login(username, password, "admin");
          navigate("/admin");
        } else {
          setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
        }
        return;
      }

      // Agent login — match by name against the agents list in SystemContext
      const matched = config.agents.find(
        (a) => a.name === username.trim()
      );

      if (!matched) {
        setError("لم يتم العثور على الوكيل. تحقق من الاسم.");
        return;
      }

      const expectedPassword = AGENT_PASSWORDS[matched.id];
      if (password !== expectedPassword) {
        setError("كلمة المرور غير صحيحة.");
        return;
      }

      login(username, password, "agent", matched.id);
      navigate("/agent");
    }, 600); // small delay for UX feel
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login-root">
      {/* Background shapes */}
      <div className="login-bg-shape login-bg-shape--1" />
      <div className="login-bg-shape login-bg-shape--2" />
      <div className="login-bg-shape login-bg-shape--3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <img src={CNASLogo} alt="CNAS" className="login-logo" />
          <div className="login-logo-text">
            <span className="login-logo-title">الصندوق الوطني للتأمينات الاجتماعية</span>
            <span className="login-logo-sub">نظام إدارة الطوابير</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === "agent" ? "active" : ""}`}
            onClick={() => { setTab("agent"); setError(null); }}
          >
            وكيل
          </button>
          <button
            className={`login-tab ${tab === "admin" ? "active" : ""}`}
            onClick={() => { setTab("admin"); setError(null); }}
          >
            مدير
          </button>
        </div>

        {/* Form */}
        <div className="login-form">
          <div className="login-field">
            <label className="login-label">
              {tab === "agent" ? "اسم الوكيل" : "اسم المستخدم"}
            </label>
            {tab === "agent" ? (
              // Agents pick their name from a dropdown populated from SystemContext
              <select
                className="login-select"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
              >
                <option value="">— اختر اسمك —</option>
                {config.agents.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="login-input"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                autoComplete="username"
              />
            )}
          </div>

          <div className="login-field">
            <label className="login-label">كلمة المرور</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            className="login-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </div>

        {/* Footer hint */}
        <p className="login-hint">
          {tab === "agent"
            ? "اختر اسمك من القائمة وأدخل كلمة المرور الخاصة بك."
            : 'أدخل بيانات حساب المدير للوصول إلى لوحة التحكم.'}
        </p>
      </div>
    </div>
  );
}