// src/utils/orderQueryParams.js
export function getOrdersParamsFromSearch(searchParams) {
  return {
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 10),
    status: searchParams.get("status") || "",
    kotStatus: searchParams.get("kotStatus") || "",
    orderType: searchParams.get("orderType") || "",
    search: searchParams.get("search") || "",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortDir: searchParams.get("sortDir") || "DESC",
    selectedOrderId: searchParams.get("selectedOrderId") || "",
    selectedOrderNo: searchParams.get("selectedOrderNo") || "",
    selectedKotNo: searchParams.get("selectedKotNo") || "",
  };
}

export function buildOrdersSearchParams(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query;
}