import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { useSystem } from "../context/SystemContext";

import CNASLogo from "../assets/CNAS_logo.png";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { config } = useSystem();

  if (!auth) throw new Error("AuthContext not found");

  const { login } = auth;

  const [tab, setTab] = useState<"agent" | "admin">("agent");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول.");
      return;
    }

    setLoading(true);

    try {
      const data = await login(username, password);

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/agent");
      }

    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login-root">
      <div className="login-bg-shape login-bg-shape--1" />
      <div className="login-bg-shape login-bg-shape--2" />
      <div className="login-bg-shape login-bg-shape--3" />

      <div className="login-card">
        <div className="login-logo-wrap">
          <img src={CNASLogo} alt="CNAS" className="login-logo" />
          <div className="login-logo-text">
            <span className="login-logo-title">
              الصندوق الوطني للتأمينات الاجتماعية
            </span>
            <span className="login-logo-sub">نظام إدارة الطوابير</span>
          </div>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === "agent" ? "active" : ""}`}
            onClick={() => {
              setTab("agent");
              setUsername("");
              setPassword("");
              setError(null);
            }}
          >
            وكيل
          </button>

          <button
            className={`login-tab ${tab === "admin" ? "active" : ""}`}
            onClick={() => {
              setTab("admin");
              setUsername("");
              setPassword("");
              setError(null);
            }}
          >
            مدير
          </button>
        </div>

        <div className="login-form">
          <div className="login-field">
            <label className="login-label">
              {tab === "agent" ? "اسم الوكيل" : "اسم المستخدم"}
            </label>

            {tab === "agent" ? (
              <select
                className="login-select"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
          </div>

          <div className="login-field">
            <label className="login-label">كلمة المرور</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && <div className="login-error">⚠ {error}</div>}

          <button
            className="login-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "..." : "تسجيل الدخول"}
          </button>
        </div>
      </div>
    </div>
  );
}