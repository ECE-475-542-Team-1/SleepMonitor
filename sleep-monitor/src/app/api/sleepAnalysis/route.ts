import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { heartRateArray, spo2Array, motionArray } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // set via .env.local
    });

    const prompt = `
    I have these sleep metrics:
    - Heart Rate: ${heartRateArray.join(', ')}
    - SpO2: ${spo2Array.join(', ')}

    If the sleep metrics are out of the normal range please provide insights and concrete suggestions to improve sleep, in 3-4 concise sentences. If they are normal, give a congrats in 1-2 concise sentences.
    `;

    // 4) Call the chat model (GPT-3.5 or GPT-4)
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',    // or 'gpt-4'
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    // 5) Extract the AI's response
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

