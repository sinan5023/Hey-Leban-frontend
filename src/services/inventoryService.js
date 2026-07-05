import api from "./api";

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const fetchInventory = async () => {
  const response = await api.get("/api/inventory");
  return unwrapData(response);
};

// Single-product update: POST /api/inventory/:productId
export const updateInventory = async (productId, payload) => {
  const response = await api.post(`/api/inventory/${productId}`, payload);
  return unwrapData(response);
};
