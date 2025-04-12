import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    // 1) Parse the incoming data
    const body = await request.json();
    const { heartRateArray, spo2Array, motionArray } = body;

    // 2) Create an OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // set via .env.local
    });

    // 3) Build the prompt
    const prompt = `
    I have these sleep metrics:
    - Heart Rate: ${heartRateArray.join(', ')}
    - SpO2: ${spo2Array.join(', ')}

    Please provide insights and suggestions to improve sleep, in concise bullet points.
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

