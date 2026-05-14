import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://nextopson.com", // 👈 IMPORTANT
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // true only if cookies needed
});

// Optional: request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
