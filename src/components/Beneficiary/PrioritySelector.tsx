type Props = {
  priority: boolean;
  setPriority: (value: boolean) => void;
};

export default function PrioritySelector({ priority, setPriority }: Props) {
  return (
    <div className="section">
      <h3>الأولوية</h3>

      <label>
        <input
          type="checkbox"
          checked={priority}
          onChange={() => setPriority(!priority)}
        />
        لدي إعاقة أو أكثر من 65 سنة
      </label>
    </div>
  );
}