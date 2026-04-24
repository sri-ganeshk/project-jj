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

  /**
   * Cleans raw text from the AI model before JSON parsing.
   * Handles:
   *   - Markdown code fences: ```json ... ``` or ``` ... ```
   *   - Leading/trailing whitespace
   */
  private cleanJsonText(rawText: string): string {
    let cleaned = rawText.trim();

    // Strip markdown code fence if present (```json or just ```)
    const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    }

    return cleaned;
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
          e.message?.includes('429') ||
          e.message?.includes('JSON_PARSE_ERROR');

        if (isTransient && attempt < maxRetries) {
          console.warn(`Transient error/Parse error encountered (attempt ${attempt}/${maxRetries}): ${e.message}. Retrying...`);
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        console.error('AI Generation Error:', e.message);
        throw new HttpException(
          'The AI assistant is temporarily unavailable or failed to process the request. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async generateJson(prompt: string, systemInstruction: string): Promise<any> {
    return this.withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text ?? '';

      if (!rawText) {
        throw new Error('JSON_PARSE_ERROR: Empty response from AI model');
      }

      try {
        const cleanedText = this.cleanJsonText(rawText);
        return JSON.parse(cleanedText);
      } catch (err) {
        // Log only first 500 chars to avoid flooding logs with giant payloads
        const preview = rawText.length > 500 ? rawText.slice(0, 500) + '...[truncated]' : rawText;
        console.error('JSON Parse Error in generateJson. Raw text preview:', preview);
        throw new Error(`JSON_PARSE_ERROR: ${(err as Error).message}`);
      }
    });
  }

  async generateText(
    prompt: string,
    systemInstruction: string,
  ): Promise<string> {
    return this.withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      return response.text || '';
    });
  }
}
