"use client";

import { forwardRef } from "react";

export const ChartContainer = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function ChartContainer({ children }, ref) {
    return (
      <div ref={ref} className="bg-background p-4 rounded-lg">
        {children}
      </div>
    );
  }
);
