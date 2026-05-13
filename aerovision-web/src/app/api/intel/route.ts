import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { modelName } = await req.json();

    if (!modelName || modelName === "No Aircraft Detected") {
      return NextResponse.json({ error: "Invalid model name" }, { status: 400 });
    }

    // Initialize Gemini (ensure process.env.GEMINI_API_KEY is set in .env.local)
    // If not set, we'll try to instantiate it, which might fail or use a default environment variable
    let ai;
    try {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
        throw new Error("Failed to initialize Google Gen AI. Ensure GEMINI_API_KEY is set.");
    }

    const prompt = `
      You are a strict military aviation intelligence system.
      Given the aircraft name "${modelName}", return ONLY a raw JSON object with the exact following structure. Do not wrap it in markdown code blocks.
      {
        "purpose": "Primary role of the aircraft (e.g. Multirole Light Fighter)",
        "history": "A 2-sentence origin story.",
        "specs": [
          {"label": "Max Speed", "value": "e.g. Mach 1.8"},
          {"label": "Empty Weight", "value": "e.g. 6,560 kg"},
          {"label": "Max Takeoff Weight", "value": "e.g. 13,500 kg"},
          {"label": "Payload Capacity", "value": "e.g. 5,300 kg"}
        ],
        "relevantInfo": ["unique feature 1", "unique feature 2", "unique feature 3"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }

    // Clean up potential markdown formatting from Gemini response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const data = JSON.parse(cleanText);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return graceful fallback if API key is missing or request fails
    return NextResponse.json({ 
        purpose: "Data classified or unavailable",
        history: "Unable to retrieve intelligence telemetry for this target. Network link severed or API key missing.",
        specs: [
          {label: "Max Speed", value: "Classified"},
          {label: "Empty Weight", value: "Classified"},
          {label: "Max Takeoff Weight", value: "Classified"},
          {label: "Payload Capacity", value: "Classified"}
        ],
        relevantInfo: ["No telemetry available", "Signal lost"]
    });
  }
}
