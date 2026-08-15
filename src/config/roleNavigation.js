import {
  Home,
  Users,
  BookOpen,
  Calendar,
  CheckSquare,
  GraduationCap,
  Wallet,
  FileText,
  MessageSquare,
  Settings,
  Sparkles,
  ClipboardList,
  Bell,
} from "lucide-react";

// Each nav item: { label, path, icon }
// Paths are relative to the role's /app/<role> base route.

export const ROLE_NAVIGATION = {
  school_admin: [
    { label: "Dashboard", path: "", icon: Home },
    { label: "Users", path: "users", icon: Users },
    { label: "Academics", path: "academics", icon: BookOpen },
    { label: "Timetable", path: "timetable", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: CheckSquare },
    { label: "Grading", path: "grading", icon: GraduationCap },
    { label: "Finance", path: "finance", icon: Wallet },
    { label: "Reports", path: "reports", icon: FileText },
    { label: "Communication", path: "communication", icon: MessageSquare },
    { label: "AI Assistant", path: "ai-assistant", icon: Sparkles },
    { label: "Settings", path: "settings", icon: Settings },
  ],
  teacher: [
    { label: "Dashboard", path: "", icon: Home },
    { label: "My Classes", path: "classes", icon: BookOpen },
    { label: "Timetable", path: "timetable", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: CheckSquare },
    { label: "Grading", path: "grading", icon: GraduationCap },
    { label: "Students", path: "students", icon: Users },
    { label: "Reports", path: "reports", icon: FileText },
    { label: "Messages", path: "messages", icon: MessageSquare },
    { label: "AI Assistant", path: "ai-assistant", icon: Sparkles },
    { label: "Settings", path: "settings", icon: Settings },
  ],
  student: [
    { label: "Dashboard", path: "", icon: Home },
    { label: "My Timetable", path: "timetable", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: CheckSquare },
    { label: "Grades", path: "grades", icon: GraduationCap },
    { label: "Assignments", path: "assignments", icon: ClipboardList },
    { label: "Materials", path: "materials", icon: FileText },
    { label: "Notices", path: "notices", icon: Bell },
    { label: "Messages", path: "messages", icon: MessageSquare },
    { label: "AI Assistant", path: "ai-assistant", icon: Sparkles },
    { label: "Settings", path: "settings", icon: Settings },
  ],
  guardian: [
    { label: "Dashboard", path: "", icon: Home },
    { label: "My Children", path: "children", icon: Users },
    { label: "Attendance", path: "attendance", icon: CheckSquare },
    { label: "Grades", path: "grades", icon: GraduationCap },
    { label: "Payments", path: "payments", icon: Wallet },
    { label: "Notices", path: "notices", icon: Bell },
    { label: "Messages", path: "messages", icon: MessageSquare },
    { label: "AI Assistant", path: "ai-assistant", icon: Sparkles },
    { label: "Settings", path: "settings", icon: Settings },
  ],
  accountant: [
    { label: "Dashboard", path: "", icon: Home },
    { label: "Fee Structures", path: "fee-structures", icon: FileText },
    { label: "Invoices", path: "invoices", icon: FileText },
    { label: "Payments", path: "payments", icon: Wallet },
    { label: "Expenses", path: "expenses", icon: Wallet },
    { label: "Transactions", path: "transactions", icon: FileText },
    { label: "Reports", path: "reports", icon: FileText },
    { label: "Settings", path: "settings", icon: Settings },
  ],
};

// School Administrator and Super Administrator share the admin nav for now.
ROLE_NAVIGATION.super_admin = ROLE_NAVIGATION.school_admin;

export const ROLE_LABELS = {
  super_admin: "Super Administrator",
  school_admin: "School Administrator",
  teacher: "Teacher",
  student: "Student",
  guardian: "Guardian",
  accountant: "Accountant",
};
