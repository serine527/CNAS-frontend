import { Ticket } from "../types/Ticket";
import "./TicketCard.css";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="ticket-card">
      <h3>رقمك</h3>
      <p>الرقم: {ticket.id}</p>
      <p>الخدمة: {ticket.service}</p>
      <p>التفصيل: {ticket.subService}</p>
      <p>أولوية: {ticket.priority ? "نعم" : "لا"}</p>
      <p>مدة الانتظار: {ticket.wait}</p>
    </div>
  );
}