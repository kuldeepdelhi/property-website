import axios from "axios";

const apiClient = axios.create({
  // Vercel par set kiya gaya backend URL (Bina /temp/ lagaye)
  baseURL: process.env.REACT_APP_API_URL || "https://nextopson.com", 
  
  headers: {
    "Content-Type": "application/json",
    // Yahan hum Vercel se Access Key utha rahe hain aur Header me bhej rahe hain
    "access-key": process.env.REACT_APP_ACCESS_KEY, 
  },
  
  // Isko true rakhna zaroori hai taaki login token bhi sath jaye
  withCredentials: true, 
});

// Niche ka interceptor wala code waisa hi rahega (bas "portalToken" check kar lena)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("portalToken"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;