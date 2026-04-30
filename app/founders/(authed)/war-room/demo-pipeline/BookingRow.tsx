"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  summary: React.ReactNode;
  details: React.ReactNode;
};

export function BookingRow({ summary, details }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer border-b border-bone/10 transition-colors hover:bg-bone/[0.03]"
      >
        <td className="w-6 px-2 py-3 align-middle text-bone/40">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </td>
        {summary}
      </tr>
      {open && (
        <tr className="border-b border-bone/10 bg-bone/[0.02]">
          <td colSpan={99} className="px-6 py-5">
            {details}
          </td>
        </tr>
      )}
    </>
  );
}
