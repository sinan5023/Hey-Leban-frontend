
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import AppRouter from "./router/AppRouter.jsx";
import "./index.css";
import App from "./App.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default cache time
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
      refetchOnWindowFocus: false, // Prevent automatic refetch on window/tab focus
      refetchOnReconnect: false, // Prevent automatic refetch on reconnect
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <App/>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);