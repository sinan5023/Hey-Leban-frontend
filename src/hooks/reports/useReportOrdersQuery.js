import { useQuery } from "@tanstack/react-query";
import { getReportOrders } from "../../services/reportService";

export default function useReportOrdersQuery(filter, page, limit = 20) {
  return useQuery({
    queryKey: ["reports-orders", filter, page, limit],
    queryFn: () => getReportOrders(filter, page, limit),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });
}