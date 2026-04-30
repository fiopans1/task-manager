import axios from "axios";
import configService from "./configService";

const getHomeSummary = async () => {
  const serverUrl = configService.getApiBaseUrl();
  const response = await axios.get(serverUrl + "/api/home-summary", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const homeService = {
  getHomeSummary,
};

export default homeService;
