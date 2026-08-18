import React, { useState } from "react";
import { OverviewDashboard } from "../../components/class_management/OverviewDashboard.jsx";
import { TimetableModule } from "../../components/class_management/TimetableModule.jsx";
import { MaterialsModule } from "../../components/class_management/MaterialsModule.jsx";
import { AnnouncementsModule } from "../../components/class_management/AnnouncementsModule.jsx";
import { GroupsModule } from "../../components/class_management/GroupsModule.jsx";
import { AttendanceModule } from "../../components/class_management/AttendanceModule.jsx";
import { PollsModule } from "../../components/class_management/PollsModule.jsx";
import { FeedbackModule } from "../../components/class_management/FeedbackModule.jsx";
import { AIAssistantModule } from "../../components/class_management/AIAssistantModule.jsx";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  const renderModule = () => {
    switch (activeTab) {
      case "TIMETABLE":
        return <TimetableModule />;
      case "MATERIALS":
        return <MaterialsModule />;
      case "ANNOUNCEMENTS":
        return <AnnouncementsModule />;
      case "GROUPS":
        return <GroupsModule />;
      case "ATTENDANCE":
        return <AttendanceModule />;
      case "POLLS":
        return <PollsModule />;
      case "FEEDBACK":
        return <FeedbackModule />;
      case "AI_ASSISTANT":
        return <AIAssistantModule />;
      case "DASHBOARD":
      default:
        return <OverviewDashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="w-full">
      {renderModule()}
    </div>
  );
}
