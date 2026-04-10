// src/pages/LandingPage.tsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaClock, FaUsers, FaChartBar, FaEnvelope } from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";
import CNASLogo from "../assets/CNAS_logo.png";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.landing}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={CNASLogo} style={{ height: "45px" }} />
          <span>وزارة العمل والتشغيل والضمان الاجتماعي</span>
        </div>

        <nav className={styles.nav}>
          <span onClick={() => scrollTo("how-it-works")}>كيف يعمل النظام؟</span>
          <span onClick={() => scrollTo("services")}>الخدمات</span>
          <span onClick={() => scrollTo("contact")}>اتصل بنا</span>
        </nav>

        <button className={styles.loginButton} onClick={() => navigate("/login")}>
          تسجيل الدخول
        </button>
      </header>

      {/* HERO */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url('/queue.jpg')` }}
      >
        <div className={styles.overlay}></div>
        <div className={styles.heroContent}>
          <h1>نظام إدارة الطوابير CNAS</h1>
          <p>تجربة رقمية حديثة لتنظيم الخدمات وتقليل وقت الانتظار</p>
          <button className={styles.getTicketButton} onClick={() => navigate("/beneficiary")}>
            الحصول على تذكرة
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={styles.section}>
        <h2>كيف يعمل النظام؟</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "40px", flexWrap: "wrap" }}>
          <div><FaUser size={30} /><p>اختيار الخدمة</p></div>
          <div><FaClock size={30} /><p>انتظار الدور</p></div>
          <div><FaUsers size={30} /><p>التوجه للشباك</p></div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className={`${styles.section} ${styles.servicesSection}`}>
        <h2>الخدمات</h2>
        <div className={styles.serviceCards}>
          <div
            className={styles.serviceCard}
            onClick={() => navigate("/beneficiary")}
            style={{ cursor: "pointer" }}
          >
            <h3>الاداءات</h3>
            <p>خدمات الضمان الاجتماعي المختلفة</p>
          </div>
          <div
            className={styles.serviceCard}
            onClick={() => navigate("/beneficiary")}
            style={{ cursor: "pointer" }}
          >
            <h3>المراقبة الطبية</h3>
            <p>متابعة الحالات الصحية والتحقق</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={`${styles.section} ${styles.statsSection}`}>
        <h2>إحصائيات</h2>
        <div className={styles.statsCards}>
          <div><FaChartBar size={30} /><h3>+500</h3><p>تذكرة يومياً</p></div>
          <div><FaUsers size={30} /><h3>+1000</h3><p>مستفيد</p></div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className={`${styles.section} ${styles.contactSection}`}>
        <h2>اتصل بنا</h2>
        <p>البريد الإلكتروني: contact@cnas.dz</p>
        <p>الهاتف: +213 21 123 456</p>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div style={{ marginBottom: "10px" }}>
          <FaEnvelope style={{ marginRight: "5px" }} />
          contact@cnas.dz
        </div>
        © CNAS 2026 - جميع الحقوق محفوظة
      </footer>
    </div>
  );
}