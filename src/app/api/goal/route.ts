import { NextResponse } from "next/server";
import { goalPlanningAgent } from "@/lib/agents";

export async function POST(req: Request) {
  try {
    const { baseData, goalName, goalAmount, targetMonths } = await req.json();

    if (!baseData || !goalName || !goalAmount || !targetMonths) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    const result = await goalPlanningAgent(baseData, goalName, goalAmount, targetMonths);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
