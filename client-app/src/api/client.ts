import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.example.com"
});

export default apiClient;
