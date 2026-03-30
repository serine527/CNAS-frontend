// src/pages/LandingPage.tsx

import { useState, useContext } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";
import CNASLogo from "../assets/CNAS_logo.png";
import bgImage from "../assets/queue.jpg"; // ⚠️ CHANGE this to your image name

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"agent" | "admin">("agent");

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password, role);

    if (role === "agent") navigate("/agent");
    if (role === "admin") navigate("/admin");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* 🔥 DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />

      {/* 🔥 CONTENT */}
      <div style={{ position: "relative", zIndex: 2 }}>
        
        {/* HEADER */}
        <header style={{ textAlign: "center", padding: "30px" }}>
          <img src={CNASLogo} alt="CNAS Logo" style={{ height: "60px" }} />
          <p style={{ color: "#ddd", marginTop: "10px" }}>
            وزارة العمل والتشغيل والضمان الاجتماعي
          </p>
        </header>

        {/* HERO */}
        <section style={{ textAlign: "center", marginTop: "80px", color: "#fff" }}>
          <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
            نظام إدارة الطوابير
          </h1>

          <p style={{ fontSize: "18px", marginBottom: "40px" }}>
            تنظيم أفضل، انتظار أقل، خدمة أسرع
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            
            {/* BENEFICIARY */}
            <button
              onClick={() => navigate("/beneficiary")}
              style={{
                fontSize: "24px",
                padding: "25px 60px",
                borderRadius: "12px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              دخول كمستفيد
            </button>

            {/* LOGIN */}
            <button
              onClick={() => setShowLogin(true)}
              style={{
                fontSize: "18px",
                padding: "20px 40px",
                borderRadius: "12px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              تسجيل الدخول
            </button>

          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            position: "absolute",
            bottom: "20px",
            width: "100%",
            textAlign: "center",
            color: "#ccc",
          }}
        >
          جميع الحقوق محفوظة © CNAS 2026
        </footer>
      </div>

      {/* 🔥 LOGIN MODAL */}
      {showLogin && (
        <div
          onClick={() => setShowLogin(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "12px",
              minWidth: "320px",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              تسجيل الدخول
            </h2>

            <form onSubmit={handleLogin}>
              {/* USERNAME */}
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 40px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
                <FaUser style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }} />
              </div>

              {/* PASSWORD */}
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 40px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
                <FaLock style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }} />
              </div>

              {/* ROLE */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "agent" | "admin")}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                }}
              >
                <option value="agent">وكيل</option>
                <option value="admin">مسؤول</option>
              </select>

              {/* BUTTON */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}