import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

export const fetchDocuments = () => api.get("/documents").then((r) => r.data);

export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const startConversation = (documentId) =>
  api.post(`/documents/${documentId}/conversations`).then((r) => r.data);

export const fetchMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`).then((r) => r.data);

export const askQuestion = (conversationId, question) =>
  api
    .post(`/conversations/${conversationId}/ask`, { question })
    .then((r) => r.data);

export default api;
