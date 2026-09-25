"use client";

import { useSearchParams } from "next/navigation";
import ResearchIndex, { type ResearchItem } from "@/components/ResearchIndex";

/** The research index, starting on the type named in ?type=. */
function ResearchIndexFromUrl(props: { items: ResearchItem[]; types: [string, string][] }) {
  return <ResearchIndex {...props} type={useSearchParams().get("type") ?? ""} />;
}

export default ResearchIndexFromUrl;
