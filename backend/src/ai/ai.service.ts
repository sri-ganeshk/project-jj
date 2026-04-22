import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 5,
    baseDelayMs = 1000,
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (err) {
        attempt++;
        const e = err as { status?: number; message?: string };
        const isTransient =
          e.status === 503 ||
          e.message?.includes('503') ||
          e.status === 429 ||
          e.message?.includes('429');

        if (isTransient && attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        console.error('AI Generation Error:', e.message);
        throw new HttpException(
          'The AI assistant is temporarily unavailable. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async generateJson(prompt: string, systemInstruction: string): Promise<any> {
    return this.withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(response.text || '{}');
    });
  }

  async generateText(
    prompt: string,
    systemInstruction: string,
  ): Promise<string> {
    return this.withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      return response.text || '';
    });
  }
}
