import { NextResponse } from "next/server";
import { scenarioSimulationAgent } from "@/lib/agents";

export async function POST(req: Request) {
  try {
    const { baseData, scenarioType, details } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        type: scenarioType,
        impact: "API anahtarı bulunamadı. Bu bir test yanıtıdır. Araç kredisi aylık bütçenizi zorlayabilir.",
        projection: [],
        risks: ["Nakit akışı sıkışıklığı"],
        mitigation: ["Daha ucuz bir araç bakmak"],
      });
    }

    const analysis = await scenarioSimulationAgent(baseData, scenarioType, details);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Scenario API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
