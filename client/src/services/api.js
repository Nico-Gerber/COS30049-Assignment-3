import axios from "axios";

// ✅ Create a single axios instance for all backend requests
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL (local)
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor to log or modify requests (optional)
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor for handling responses & errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error);
    if (error.response) {
      // Server responded with an error
      console.error("Response Data:", error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error("No response received:", error.request);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ✅ Define helper functions for backend endpoints
export const predictMisinformation = async (text) => {
  const response = await api.post("/predict", { text });
  return response.data;
};

export const fetchVisualData = async () => {
  const response = await api.get("/visual-data");
  return response.data;
};

export const sendFeedback = async (formData) => {
  const response = await api.post("/feedback", formData);
  return response.data;
};

// ✅ Default export (so you can use api.get/post directly if needed)
export default api;
