import { apiClient } from "./apiClient";

const getProfile = async () => {
    const response = await apiClient.get("/api/user/profile");
    return response.data;
};

const updateProfile = async (profile) => {
    const response = await apiClient.put("/api/user/profile", profile);
    return response.data;
};

const changePassword = async (currentPassword, newPassword) => {
    await apiClient.post("/api/user/change-password", {
        currentPassword,
        newPassword,
    });
};

const profileService = {
    getProfile,
    updateProfile,
    changePassword,
};

export default profileService;
