import api from "./api";

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const fetchRawMaterials = async () => {
  const response = await api.get("/api/raw-materials");
  return unwrapData(response);
};

export const createRawMaterial = async (payload) => {
  const response = await api.post("/api/raw-materials", payload);
  return unwrapData(response);
};

export const updateRawMaterialStock = async (id, payload) => {
  const response = await api.post(`/api/raw-materials/${id}/stock`, payload);
  return unwrapData(response);
};
