'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a structured 4-level mind map analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActionSchema = z.string().describe('A possible solution or action (Level 4). Use 4-6 words max, no full sentences.');

const CauseSchema = z.object({
  name: z.string().describe('A specific cause (Level 3). Use 4-6 words max, no full sentences.'),
  actions: z.array(ActionSchema).min(2).describe('Strategic actions addressing this specific cause.'),
});

const PerspectiveSchema = z.object({
  name: z.string().describe('A major analytical perspective (Level 2). Use 4-6 words max, no full sentences.'),
  causes: z.array(CauseSchema).min(3).describe('At least 3 specific causes contributing to the problem from this perspective.'),
});

const MindMapInputSchema = z.object({
  problem: z.string().describe('The central problem to analyze.'),
});
export type MindMapInput = z.infer<typeof MindMapInputSchema>;

const MindMapOutputSchema = z.object({
  centralProblem: z.string().describe('The restated core problem (Level 1). Use 4-6 words max.'),
  perspectives: z.array(PerspectiveSchema).min(3).describe('3-5 major analytical perspectives.'),
});
export type MindMapOutput = z.infer<typeof MindMapOutputSchema>;

export async function generateMindMap(input: MindMapInput): Promise<MindMapOutput> {
  return generateMindMapFlow(input);
}

const mindMapPrompt = ai.definePrompt({
  name: 'problemSolvingMindMapPrompt',
  input: {schema: MindMapInputSchema},
  output: {schema: MindMapOutputSchema},
  prompt: `You are an expert strategic consultant. Analyze the given problem and generate a 4-level analytical mind map in JSON format.

Constraints:
1. Levels: 
   - Level 1: Core Problem
   - Level 2: Major Perspectives (3-5 perspectives)
   - Level 3: Causes (At least 3 causes per perspective)
   - Level 4: Actions/Solutions (Strategic actions per cause)
2. Node Content:
   - Each node MUST contain no more than 4-6 words.
   - Avoid full sentences. Use short, punchy phrases.
   - Example: "Weak networking" instead of "Insufficient networking opportunities in the industry."

Problem Statement: {{{problem}}}`,
});

const generateMindMapFlow = ai.defineFlow(
  {
    name: 'generateMindMapFlow',
    inputSchema: MindMapInputSchema,
    outputSchema: MindMapOutputSchema,
  },
  async input => {
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const {output} = await mindMapPrompt(input);
        if (!output) {
          throw new Error('The AI was unable to generate a valid analytical map.');
        }
        return output;
      } catch (error: any) {
        attempts++;
        const errorMessage = error.message || '';
        const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
        
        if (attempts >= maxAttempts || !isRateLimit) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
      }
    }
    throw new Error('The AI service is currently at capacity. Please try again in a few seconds.');
  }
);
