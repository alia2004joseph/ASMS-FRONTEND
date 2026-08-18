import axiosClient from "./axiosClient.js";

/**
 * ASMS Class Management & Representative Hub API Client
 */
export const classManagementApi = {
  getAssignments: (classroomId) =>
    axiosClient.get("/class-management/representatives/assignments/", {
      params: classroomId ? { classroom: classroomId } : {},
    }),

  getAnnouncements: (classroomId) =>
    axiosClient.get("/class-management/representatives/announcements/", {
      params: classroomId ? { classroom: classroomId } : {},
    }),
  createAnnouncement: (payload) =>
    axiosClient.post("/class-management/representatives/announcements/", payload),
  approveAnnouncement: (id) =>
    axiosClient.post(),
  rejectAnnouncement: (id, reason) =>
    axiosClient.post(, { reason }),

  getGroupSets: (classroomId) =>
    axiosClient.get("/class-management/representatives/group-sets/", {
      params: classroomId ? { classroom: classroomId } : {},
    }),
  generateGroups: (payload) =>
    axiosClient.post("/class-management/representatives/group-sets/", payload),

  getPolls: (classroomId) =>
    axiosClient.get("/class-management/representatives/polls/", {
      params: classroomId ? { classroom: classroomId } : {},
    }),
  createPoll: (payload) =>
    axiosClient.post("/class-management/representatives/polls/", payload),
  votePoll: (pollId, optionId) =>
    axiosClient.post(, {
      option_id: optionId,
    }),

  getFeedback: (classroomId) =>
    axiosClient.get("/class-management/representatives/feedback/", {
      params: classroomId ? { classroom: classroomId } : {},
    }),
  submitFeedback: (payload) =>
    axiosClient.post("/class-management/representatives/feedback/", payload),
  respondFeedback: (id, response) =>
    axiosClient.post(, {
      response,
    }),

  queryAssistant: (query, classroomId) =>
    axiosClient.post("/class-management/representatives/ai/query/", {
      query,
      classroom_id: classroomId,
    }),
};

export default classManagementApi;
