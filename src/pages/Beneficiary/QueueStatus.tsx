//src\pages\Beneficiary\QueueStatus.tsx
import "./QueueStatus.css";

export default function QueueStatus() {
  const position = 5;

  return (
    <div className="queue-container" dir="rtl">
      <h2>حالة الطابور</h2>
      <p>ترتيبك في الطابور: {position}</p>
      <p>مدة الانتظار المتوقعة: {position * 3} دقائق</p>
    </div>
  );
}