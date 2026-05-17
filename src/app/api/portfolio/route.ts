import { NextResponse } from 'next/server';
import { portfolioSimulationAgent } from '@/lib/agents';

export async function POST(request: Request) {
  try {
    const { totalAmount, allocations } = await request.json();
    
    if (totalAmount === undefined || !allocations) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await portfolioSimulationAgent(totalAmount, allocations);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Portfolio API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
