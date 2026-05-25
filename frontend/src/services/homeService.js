import { apiClient } from "./apiClient";

const getHomeSummary = async () => {
    const response = await apiClient.get("/api/home-summary");
    return response.data;
};

const homeService = {
    getHomeSummary,
};

export default homeService;
