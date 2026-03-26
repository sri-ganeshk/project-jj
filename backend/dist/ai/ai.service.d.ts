export declare class AiService {
    private ai;
    constructor();
    generateJson(prompt: string, systemInstruction: string): Promise<any>;
    generateText(prompt: string, systemInstruction: string): Promise<string>;
}
