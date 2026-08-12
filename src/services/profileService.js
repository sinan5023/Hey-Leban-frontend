import api from "./api";

export async function getShopDetails() {
  const response = await api.get("/api/profile/shop");
  return response.data.data;
}