import {
  User,
  StudentProfile,
  Classroom,
  Subject,
  TimetableEntry,
  ClassRepresentativeAssignment,
  Material,
  Announcement,
  GroupSet,
  AttendanceSession,
  Poll,
  StudentFeedback,
  Notification,
  EmailLog,
  AuditLog,
  AcademicYear,
  AcademicTerm,
} from '../types';

export interface AuthMeResponse {
  user: User;
  studentProfile: StudentProfile | null;
  isClassRep: boolean;
  repAssignment: ClassRepresentativeAssignment | null;
  academicYear: AcademicYear;
  academicTerm: AcademicTerm;
}

export const api = {
  // Auth & Persona Switch
  getMe: async (): Promise<AuthMeResponse> => {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Failed to fetch current user profile');
    return res.json();
  },

  switchPersona: async (userId: string): Promise<{ success: boolean; user: User; isClassRep: boolean }> => {
    const res = await fetch('/api/auth/switch-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to switch persona');
    return res.json();
  },

  // ASMS Core
  getClassrooms: async (): Promise<Classroom[]> => {
    const res = await fetch('/api/asms/classrooms');
    return res.json();
  },

  getSubjects: async (): Promise<Subject[]> => {
    const res = await fetch('/api/asms/subjects');
    return res.json();
  },

  getStudents: async (): Promise<StudentProfile[]> => {
    const res = await fetch('/api/asms/students');
    return res.json();
  },

  getTimetable: async (): Promise<TimetableEntry[]> => {
    const res = await fetch('/api/asms/timetable');
    return res.json();
  },

  sendTimetableReminder: async (timetable_id?: string): Promise<{ success: boolean; count: number }> => {
    const res = await fetch('/api/class-management/timetable/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timetable_id }),
    });
    return res.json();
  },

  // Representatives
  getRepresentatives: async (): Promise<ClassRepresentativeAssignment[]> => {
    const res = await fetch('/api/class-management/representatives');
    return res.json();
  },

  assignRepresentative: async (data: {
    student_id: string;
    classroom_id: string;
    subject_id?: string | null;
    permissions?: Record<string, boolean>;
  }): Promise<ClassRepresentativeAssignment> => {
    const res = await fetch('/api/class-management/representatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to assign class representative');
    }
    return res.json();
  },

  revokeRepresentative: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/class-management/representatives/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Materials
  getMaterials: async (): Promise<Material[]> => {
    const res = await fetch('/api/class-management/materials');
    return res.json();
  },

  uploadMaterial: async (data: Partial<Material>): Promise<Material> => {
    const res = await fetch('/api/class-management/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload material');
    }
    return res.json();
  },

  downloadMaterial: async (id: string): Promise<{ success: boolean; file_name: string; download_url: string }> => {
    const res = await fetch(`/api/class-management/materials/${id}/download`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Download authorization failed');
    }
    return res.json();
  },

  deleteMaterial: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/class-management/materials/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Announcements
  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await fetch('/api/class-management/announcements');
    return res.json();
  },

  createAnnouncement: async (data: Partial<Announcement>): Promise<Announcement> => {
    const res = await fetch('/api/class-management/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create announcement');
    }
    return res.json();
  },

  reviewAnnouncement: async (id: string, action: 'APPROVE' | 'REJECT', rejection_reason?: string): Promise<Announcement> => {
    const res = await fetch(`/api/class-management/announcements/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, rejection_reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to review announcement');
    }
    return res.json();
  },

  // Groups
  getGroups: async (): Promise<GroupSet[]> => {
    const res = await fetch('/api/class-management/groups');
    return res.json();
  },

  generateGroups: async (data: {
    title: string;
    description: string;
    subject_id: string;
    classroom_id?: string;
    num_groups: number;
    allocation_method: string;
  }): Promise<GroupSet> => {
    const res = await fetch('/api/class-management/groups/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate groups');
    }
    return res.json();
  },

  publishGroupSet: async (id: string): Promise<GroupSet> => {
    const res = await fetch(`/api/class-management/groups/${id}/publish`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to publish groups');
    }
    return res.json();
  },

  // Attendance
  getAttendanceSessions: async (): Promise<AttendanceSession[]> => {
    const res = await fetch('/api/class-management/attendance/sessions');
    return res.json();
  },

  startAttendanceSession: async (data: {
    classroom_subject_id: string;
    topic: string;
    venue: string;
    duration_minutes: number;
  }): Promise<AttendanceSession> => {
    const res = await fetch('/api/class-management/attendance/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to start attendance session');
    }
    return res.json();
  },

  closeAttendanceSession: async (id: string): Promise<AttendanceSession> => {
    const res = await fetch(`/api/class-management/attendance/sessions/${id}/close`, {
      method: 'POST',
    });
    return res.json();
  },

  markAttendance: async (data: { session_code?: string; qr_token?: string; method: 'QR' | 'CODE' }): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/class-management/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to mark attendance');
    }
    return res.json();
  },

  // Polls
  getPolls: async (): Promise<Poll[]> => {
    const res = await fetch('/api/class-management/polls');
    return res.json();
  },

  createPoll: async (data: {
    title: string;
    description: string;
    classroom_id?: string;
    subject_id?: string | null;
    is_anonymous: boolean;
    poll_type: 'VOTE' | 'PROPOSAL';
    options?: string[];
    proposal_action?: string;
  }): Promise<Poll> => {
    const res = await fetch('/api/class-management/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create poll');
    }
    return res.json();
  },

  votePoll: async (id: string, data: { option_id?: string; vote_type?: string }): Promise<{ success: boolean; poll: Poll }> => {
    const res = await fetch(`/api/class-management/polls/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit vote');
    }
    return res.json();
  },

  // Feedback
  getFeedback: async (): Promise<StudentFeedback[]> => {
    const res = await fetch('/api/class-management/feedback');
    return res.json();
  },

  submitFeedback: async (data: Partial<StudentFeedback>): Promise<StudentFeedback> => {
    const res = await fetch('/api/class-management/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit feedback');
    }
    return res.json();
  },

  updateFeedbackStatus: async (id: string, data: { status: string; admin_response?: string }): Promise<StudentFeedback> => {
    const res = await fetch(`/api/class-management/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const res = await fetch('/api/class-management/notifications');
    return res.json();
  },

  markNotificationAsRead: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/class-management/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return res.json();
  },

  markAllNotificationsAsRead: async (): Promise<{ success: boolean }> => {
    const res = await fetch('/api/class-management/notifications/mark-all-read', {
      method: 'POST',
    });
    return res.json();
  },

  getEmailLogs: async (): Promise<EmailLog[]> => {
    const res = await fetch('/api/class-management/emails');
    return res.json();
  },

  // Audit Logs & Migration
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetch('/api/class-management/audit-logs');
    return res.json();
  },

  runMigrationDryRun: async (legacyData?: unknown[]): Promise<unknown> => {
    const res = await fetch('/api/class-management/migration/dry-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legacyData }),
    });
    return res.json();
  },

  // AI Assistant Services
  askAiAssistant: async (data: {
    prompt: string;
    conversation_history?: Array<{ sender: string; text: string }>;
    context_type?: 'MATERIAL' | 'TIMETABLE' | 'GENERAL';
    context_id?: string;
  }): Promise<{ reply: string; user_role?: string; is_rep?: boolean; error?: boolean }> => {
    const res = await fetch('/api/class-management/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  aiDraftAnnouncement: async (data: {
    raw_notes: string;
    subject_code?: string;
    urgency?: string;
  }): Promise<{ title: string; content: string }> => {
    const res = await fetch('/api/class-management/ai/draft-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  aiSummarizeFeedback: async (): Promise<{ summary: string }> => {
    const res = await fetch('/api/class-management/ai/summarize-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
};

