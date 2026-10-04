// src/hooks/orders/useOrdersQuery.js
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../../services/orderService";

export function useOrdersQuery(params, options = {}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetchOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
}