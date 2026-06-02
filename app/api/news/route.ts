import { NextResponse } from "next/server";
import { fetchTimPayneNews } from "@/lib/google-news";

export const revalidate = 1800;

export async function GET() {
  try {
    const articles = await fetchTimPayneNews();
    return NextResponse.json({ articles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch news";
    return NextResponse.json({ articles: [], error: message }, { status: 502 });
  }
}
