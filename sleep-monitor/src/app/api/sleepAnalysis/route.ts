import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { heartRateArray, spo2Array, rrArray } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const avg = (arr: number[]) =>
      arr && arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

    const avgHR = avg(heartRateArray);
    const avgSpO2 = avg(spo2Array);
    const avgRR = avg(rrArray);

    const prompt = `
You are a sleep health assistant helping users understand the quality of their sleep based on sensor data.

Here is the user's recent average sleep data:
- Heart Rate readings: [${heartRateArray.join(', ')}] (average: ${avgHR ?? 'N/A'} bpm)
- SpO₂ readings: [${spo2Array.join(', ')}] (average: ${avgSpO2 ?? 'N/A'}%)
- Respiratory Rate readings: [${rrArray.join(', ')}] (average: ${avgRR ?? 'N/A'} breaths per minute)

Instructions:
1. If values suggest **possible concern** (e.g., HR > 75 bpm, SpO₂ < 95%, RR < 4), provide:
   - 3–4 short sentences summarizing the issue in plain language
   - 3–5 **concise, evidence-based suggestions** for improvement (bulleted)
2. If all values are **within healthy range**, respond with:
   - 2–3 friendly sentences congratulating them
   - 1–2 tips to maintain good sleep quality
3. Avoid fluff. Use a confident, helpful tone. Never speculate beyond the data provided.

Begin with a short bold heading (like "Sleep Analysis" or "Summary").
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 400,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ insights: aiResponse });
  } catch (err) {
    console.error('Error in POST /api/sleepAnalysis:', err);
    return NextResponse.json(
      { error: 'Failed to analyze sleep data' },
      { status: 500 }
    );
  }
}


