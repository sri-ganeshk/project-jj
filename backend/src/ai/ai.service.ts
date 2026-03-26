import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    // Make sure to set GEMINI_API_KEY in the environment
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy-key',
    });
  }

  async generateJson(prompt: string, systemInstruction: string): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      },
    });
    return JSON.parse(response.text || '{}');
  }

  async generateText(
    prompt: string,
    systemInstruction: string,
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text || '';
  }
}
