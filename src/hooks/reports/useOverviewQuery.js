import { useQuery } from "@tanstack/react-query";
import { getOverviewReport } from "../../services/reportService";

export default function useOverviewQuery(filter) {
  return useQuery({
    queryKey: ["reports-overview", filter],
    queryFn: () => getOverviewReport(filter),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}