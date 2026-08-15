export const ENDPOINTS = {
  auth: {
    login: "/accounts/login/",
    refresh: "/accounts/login/refresh/",
    signup: "/accounts/register/",
    currentUser: "/accounts/me/",
  },

  accounts: {
    pending: "/accounts/pending/",
    approveOrReject: (userId) =>
      `/accounts/pending/${userId}/action/`,
    bulkApproveOrReject: "/accounts/pending/bulk-action/",
    accessCodes: "/accounts/access-codes/",
    accessCodeDetail: (id) =>
      `/accounts/access-codes/${id}/`,
    guardianLinks: "/accounts/guardian-links/",
    guardianLinkDetail: (id) =>
      `/accounts/guardian-links/${id}/`,
    profile: "/accounts/profile/",
  },
};

export default ENDPOINTS;