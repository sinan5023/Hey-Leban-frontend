
import api from "./api";

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const fetchManagementCatalogue = async () => {
  const response = await api.get("/api/catalogue/management");
  return response.data.data.categories;
};

export const createItem = async (payload) => {
  const response = await api.post("/api/items", payload);
  return unwrapData(response);
};

export const updateItem = async (id, payload) => {
  const response = await api.patch(`/api/items/${id}`, payload);
  return unwrapData(response);
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/api/items/${id}`);
  return unwrapData(response);
};

export const toggleItemActive = async (id, isActive) => {
  const response = await api.patch(`/api/items/${id}/inactive`, { isActive });
  return unwrapData(response);
};

export const createCategory = async (payload) => {
  const response = await api.post("/api/categories", payload);
  return unwrapData(response);
};

export const updateCategory = async (id, payload) => {
  const response = await api.patch(`/api/categories/${id}`, payload);
  return unwrapData(response);
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/api/categories/${id}`);
  return unwrapData(response);
};

export const toggleCategoryActive = async (id, isActive) => {
  const response = await api.patch(`/api/categories/${id}/inactive`, { isActive });
  return unwrapData(response);
};

export const linkProductToBase = async (productId, rawMaterialId) => {
  const response = await api.put(`/api/items/${productId}/ingredient`, { rawMaterialId });
  return unwrapData(response);
};

export const unlinkProductFromBase = async (productId) => {
  const response = await api.delete(`/api/items/${productId}/ingredient`);
  return unwrapData(response);
};