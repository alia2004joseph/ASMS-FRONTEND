import axiosClient from "./axiosClient.js";
import { ENDPOINTS } from "./endpoints.js";

// All functions return the Axios promise directly so callers can
// handle loading/error state locally with their own try/catch.

export function listPendingUsers({ role } = {}) {
  return axiosClient.get(ENDPOINTS.accounts.pending, {
    params: role ? { role } : undefined,
  });
}

export function approveOrRejectUser(userId, { action, reason }) {
  // action: "approve" | "reject". reason is required by the backend
  // only when action === "reject".
  return axiosClient.post(ENDPOINTS.accounts.approveOrReject(userId), {
    action,
    ...(reason ? { reason } : {}),
  });
}

export function bulkApproveOrRejectUsers({ userIds, action, reason }) {
  return axiosClient.post(ENDPOINTS.accounts.bulkApproveOrReject, {
    user_ids: userIds,
    action,
    ...(reason ? { reason } : {}),
  });
}

export function listAccessCodes() {
  return axiosClient.get(ENDPOINTS.accounts.accessCodes);
}

export function createAccessCode(payload) {
  // payload: { role, max_uses, expires_at?, school? (superuser only) }
  return axiosClient.post(ENDPOINTS.accounts.accessCodes, payload);
}

export function updateAccessCode(id, payload) {
  return axiosClient.patch(ENDPOINTS.accounts.accessCodeDetail(id), payload);
}

export function deleteAccessCode(id) {
  return axiosClient.delete(ENDPOINTS.accounts.accessCodeDetail(id));
}

export function listGuardianLinks() {
  return axiosClient.get(ENDPOINTS.accounts.guardianLinks);
}

export function createGuardianLink(payload) {
  // payload: { guardian, student, relationship?, is_primary_guardian?, can_receive_notifications? }
  return axiosClient.post(ENDPOINTS.accounts.guardianLinks, payload);
}

export function getMyProfile() {
  return axiosClient.get(ENDPOINTS.accounts.profile);
}

export function updateMyProfile(payload) {
  return axiosClient.patch(ENDPOINTS.accounts.profile, payload);
}
