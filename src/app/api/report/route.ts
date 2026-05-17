import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { report, data, metrics } = await req.json();

    // Return structured data for client-side PDF generation
    return NextResponse.json({
      success: true,
      reportData: { report, data, metrics },
    });
  } catch (error) {
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
