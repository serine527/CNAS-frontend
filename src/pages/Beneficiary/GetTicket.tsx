// src/pages/Beneficiary/GetTicket.tsx
import { useState, useEffect } from "react";
import styles from "./GetTicket.module.css";
import CNASLogo from "../../assets/CNAS_logo.png";

export default function GetTicket() {
  const [service, setService] = useState<"prestation" | "medical" | "">("");
  const [subService, setSubService] = useState<string>("");
  const [priority, setPriority] = useState(false);
  const [ticketTaken, setTicketTaken] = useState(false);

  const [ticketNumber, setTicketNumber] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const [currentTicket, setCurrentTicket] = useState<string>("");

  const prestationServices: string[] = [
    "تحديث بطاقة الشفاء",
    "طلب بطاقة الشفاء أو نسخة منها",
    "طلب استرجاع: توقف عن العمل، إجازة الأمومة، منتجات صيدلية، رأس المال عند الوفاة، خدمات طبية",
    "طلب تمديد إجازة الأمومة",
    "تحديث ملف المؤمن عليه الاجتماعي",
    "فتح حقوق المؤمن عليه الاجتماعي وأفراد عائلته",
    "طلب شهادة انتساب أو عدم انتساب",
    "طلب تغطية لتجهيزات طبية أو علاج حراري",
    "إبلاغ عن حادث عمل"
  ];

  const medicalServices: string[] = [
    "فحص طبي بعد توقف عن العمل",
    "تمديد إجازة الأمومة",
    "فحص قبلي",
    "استرجاع تكاليف العلاج الطبي",
    "طلبات أخرى مرتبطة بالمتابعة الطبية"
  ];

  const generateTicketNumber = () => {
    const letter = service === "prestation" ? "A" : "B";
    const number = Math.floor(Math.random() * 99) + 1;
    return `${letter}${number}`;
  };

  const handleTakeTicket = () => {
    if (!service || !subService) {
      alert("يرجى اختيار الخدمة والخدمة الفرعية");
      return;
    }

    const newTicket = generateTicketNumber();
    const letter = service === "prestation" ? "A" : "B";
    const fakeQueue = Array.from({ length: 5 }, () => {
      return `${letter}${Math.floor(Math.random() * 99) + 1}`;
    });
    const fullQueue = [...fakeQueue, newTicket];

    setTicketNumber(newTicket);
    setQueue(fullQueue);
    setCurrentTicket(fullQueue[0]);
    setTicketTaken(true);
  };

  useEffect(() => {
    if (!ticketTaken) return;
    const interval = setInterval(() => {
      setQueue((prev) => {
        if (prev.length <= 1) return prev;
        const [, ...rest] = prev;
        setCurrentTicket(rest[0]);
        return rest;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [ticketTaken]);

  const queuePosition = queue.indexOf(ticketNumber);
  const peopleAhead = queuePosition > 0 ? queuePosition : 0;
  const estWait = peopleAhead * 5;
  const serviceLabel = service === "prestation" ? "الاداءات" : "المراقبة الطبية";

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <img src={CNASLogo} alt="CNAS" />
        <h2>نظام التذاكر - CNAS</h2>
      </div>

      <div className={styles.card}>
        {!ticketTaken ? (
          /* ── ORIGINAL SELECTION PAGE — UNCHANGED ── */
          <>
            <h3>اختر الخدمة</h3>

            <div className={styles.serviceList}>
              <button
                className={`${styles.serviceItem} ${service === "prestation" ? styles.active : ""}`}
                onClick={() => { setService("prestation"); setSubService(""); }}
              >
                <div>
                  <strong>الاداءات</strong>
                  <p>خدمات الضمان الاجتماعي</p>
                </div>
              </button>

              <button
                className={`${styles.serviceItem} ${service === "medical" ? styles.active : ""}`}
                onClick={() => { setService("medical"); setSubService(""); }}
              >
                <div>
                  <strong>المراقبة الطبية</strong>
                  <p>متابعة الحالات الصحية</p>
                </div>
              </button>
            </div>

            {service && (
              <div className={styles.subServiceSection}>
                <label>الخدمة الفرعية</label>
                <select value={subService} onChange={(e) => setSubService(e.target.value)}>
                  <option value="">اختر...</option>
                  {(service === "prestation" ? prestationServices : medicalServices).map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.prioritySection}>
              <input type="checkbox" checked={priority} onChange={() => setPriority(!priority)} />
              <span>أولوية (إعاقة أو أكثر من 65 سنة)</span>
            </div>

            <button className={styles.takeTicketButton} onClick={handleTakeTicket}>
              تأكيد وأخذ التذكرة
            </button>
          </>
        ) : (
          /* ── REDESIGNED TICKET VIEW ── */
          <div className={styles.ticketView}>

            {/* Hero ticket banner */}
            <div className={styles.ticketHero}>
              
              <div className={styles.heroTop}>
                <div className={styles.activePill}>
                  <span className={styles.activeDot} />
                  <span>نشط</span>
                </div>
                {priority && (
                  <div className={styles.priorityPill}>⭐ أولوية</div>
                )}
              </div>
              <p className={styles.heroLabel}>رقم تذكرتك</p>
              <h1 className={styles.heroNumber}>{ticketNumber}</h1>
              <p className={styles.heroService}>{serviceLabel}</p>
            </div>

            {/* Info rows */}
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <div className={styles.infoIconBox} style={{ background: "#e8f4ff" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2c7be5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoKey}>الخدمة</span>
                  <span className={styles.infoVal}>{serviceLabel}</span>
                </div>
              </div>
              <div className={styles.infoRowDivider} />
              <div className={styles.infoRow}>
                <div className={styles.infoIconBox} style={{ background: "#e8f8f0" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoKey}>الخدمة الفرعية</span>
                  <span className={styles.infoVal}>{subService}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statTop}>
                  <div className={styles.statIconCircle} style={{ background: "#fff0e8", color: "#e8793a" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <span className={styles.statTrend}>في الانتظار</span>
                </div>
                <p className={styles.statBigNumber}>{peopleAhead}</p>
                <p className={styles.statLabel}>شخص قبلك</p>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statTop}>
                  <div className={styles.statIconCircle} style={{ background: "#eef4ff", color: "#2c7be5" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <span className={styles.statTrend}>تقدير</span>
                </div>
                <p className={styles.statBigNumber}>{estWait}<span className={styles.statUnit}>د</span></p>
                <p className={styles.statLabel}>وقت الانتظار</p>
              </div>
            </div>

            {/* Queue progress bar */}
            <div className={styles.progressCard}>
              <div className={styles.progressHeader}>
                <span className={styles.progressTitle}>تقدم قائمة الانتظار</span>
                <span className={styles.progressCount}>
                  {queue.indexOf(currentTicket) + 1} / {queue.length}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${Math.max(8, ((queue.indexOf(currentTicket) + 1) / queue.length) * 100)}%`
                  }}
                />
              </div>
              <div className={styles.queuePills}>
                {queue.map((t, i) => (
                  <div
                    key={i}
                    className={`${styles.pill} ${
                      t === currentTicket ? styles.pillCurrent
                      : t === ticketNumber ? styles.pillMine
                      : styles.pillWaiting
                    }`}
                    title={t === ticketNumber ? "تذكرتك" : t === currentTicket ? "الحالي" : ""}
                  >
                    {t}
                    {t === ticketNumber && <span className={styles.pillYouTag}>أنت</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Banner */}
            <div className={styles.banner}>
              <div className={styles.bannerIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <p className={styles.bannerTitle}>أنت في قائمة الانتظار!</p>
                <p className={styles.bannerSub}>سيتم إشعارك عند اقتراب دورك. يرجى البقاء في المكان.</p>
              </div>
            </div>

            {/* Back */}
            <button
              className={styles.backButton}
              onClick={() => {
                setTicketTaken(false);
                setService("");
                setSubService("");
                setPriority(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              أخذ تذكرة جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}