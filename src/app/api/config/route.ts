import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    freeMode: process.env.FREE_MODE === "true",
    appName: process.env.APP_NAME || "สัมผัส ดีวาย",
  });
}
