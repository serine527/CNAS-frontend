import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSystem, getCategoryForService } from "../../context/SystemContext";


export default function AgentProfilePage() {
  const { username } = useContext(AuthContext);
  const { isMulti, getAgent } = useSystem();

  // If you store agentId in context (same as AgentPage)
  const agentId = 1; // replace with real one if needed
  const agent = getAgent(agentId);

  const category = isMulti && agent?.assignedService
    ? getCategoryForService(agent.assignedService)
    : null;

  return (
    <div className="profile-page">

      <h2>الملف الشخصي</h2>

      <div className="profile-card">
        <p><strong>اسم المستخدم:</strong> {username}</p>

        <p><strong>الاسم:</strong> {agent?.name || "-"}</p>

        <p><strong>اللقب:</strong> {agent?.lastName || "-"}</p>

        <p><strong>الهيكل:</strong> {agent?.structure || "-"}</p>

        <p><strong>الشباك / الطابور:</strong> {agent?.queue || "-"}</p>

        <p>
          <strong>الخدمة:</strong>{" "}
          {agent?.assignedService || "-"}
        </p>

        {isMulti && (
          <>
            <p>
              <strong>التصنيف:</strong>{" "}
              {category === "medical"
                ? "الخدمات الطبية"
                : category === "prestation"
                ? "خدمات الاستحقاقات"
                : "-"}
            </p>

            <p>
              <strong>الخدمة الفرعية:</strong>{" "}
              {agent?.subService || "-"}
            </p>
          </>
        )}
      </div>

    </div>
  );
}