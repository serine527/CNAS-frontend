type Props = {
  service: string;
  setService: (value: string) => void;
};

export default function ServiceSelector({ service, setService }: Props) {
  return (
    <div className="section">
      <h3>اختر الخدمة</h3>

      <button
        onClick={() => setService("prestation")}
        className={service === "prestation" ? "active" : ""}
      >
        الخدمات
      </button>

      <button
        onClick={() => setService("medical")}
        className={service === "medical" ? "active" : ""}
      >
        المراقبة الطبية
      </button>
    </div>
  );
}