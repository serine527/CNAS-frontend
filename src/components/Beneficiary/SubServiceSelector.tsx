type Props = {
  services: string[];
  selected: string;
  setSelected: (value: string) => void;
};

export default function SubServiceSelector({ services, selected, setSelected }: Props) {
  return (
    <div className="section">
      <h3>اختر الخدمة الفرعية</h3>

      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">-- اختر --</option>
        {services.map((s, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}