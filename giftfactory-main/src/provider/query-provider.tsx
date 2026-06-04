"use client";
import React, { useState } from "react";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

function QueryProvider({ children }: any) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 60 s — eliminates redundant
            // refetches when navigating between pages or re-focusing tabs.
            staleTime: 60_000,
            // Keep unused cache for 5 minutes (default) so navigating
            // back to a page is instant without a background refetch.
            gcTime: 5 * 60_000,
            // Don't retry on 4xx client errors (bad IDs, auth failures).
            retry: (failureCount, error: any) => {
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </>
  );
}

export { QueryProvider };
