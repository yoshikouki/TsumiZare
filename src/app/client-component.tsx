"use client";

import { client } from "@/server/client";
import useSWR from "swr";

export const ClientComponent = () => {
  const request = client.time;
  const { data, isLoading, error } = useSWR(
    request.$url().pathname,
    async () => {
      const res = await request.$get();
      return await res.json();
    },
  );

  if (isLoading) return <div className="text-2xl tabular-nums">Loading...</div>;
  if (error) {
    return <div className="text-2xl tabular-nums">Error</div>;
  }

  return <div className="text-2xl tabular-nums">C: {data?.message}</div>;
};
