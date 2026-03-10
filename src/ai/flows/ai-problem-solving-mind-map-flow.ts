'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a deep, structured, multi-level mind map analysis
 * from a user-provided problem statement or question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolutionSchema = z.string().describe('A potential action or strategic solution (Level 5).');
const RootCauseSchema = z.string().describe('A deeper, fundamental root cause or factor (Level 4).');

const SubCauseNodeSchema = z.object({
  causeName: z.string().describe('The specific investigation point or sub-cause description (Level 3).'),
  rootCauses: z.array(RootCauseSchema).min(2).describe('Underlying reasons for this specific investigation point.'),
  solutions: z.array(SolutionSchema).min(2).describe('Actionable strategic steps to address these factors.'),
});

const PerspectiveNodeSchema = z.object({
  perspectiveName: z.string().describe('A major analytical perspective or category (Level 2).'),
  subCauses: z.array(SubCauseNodeSchema).min(2).describe('A list of specific investigation points under this perspective.'),
});

const MindMapInputSchema = z.object({
  problem: z.string().describe('The central problem or question to analyze (Level 1).'),
});
export type MindMapInput = z.infer<typeof MindMapInputSchema>;

const MindMapOutputSchema = z.object({
  centralProblem: z.string().describe('The restated core problem (Level 1).'),
  perspectives: z.array(PerspectiveNodeSchema).min(3).describe('Multiple major analytical perspectives exploring the issue.'),
});
export type MindMapOutput = z.infer<typeof MindMapOutputSchema>;

export async function generateMindMap(input: MindMapInput): Promise<MindMapOutput> {
  return generateMindMapFlow(input);
}

const mindMapPrompt = ai.definePrompt({
  name: 'problemSolvingMindMapPrompt',
  input: {schema: MindMapInputSchema},
  output: {schema: MindMapOutputSchema},
  prompt: `You are an expert strategic consultant and data analyst. Analyze the given problem and generate a comprehensive 5-level analytical mind map in JSON format.

Your analysis must follow this exact hierarchy:
Level 1: Central Problem (The core question).
Level 2: Major Perspectives (Identify 3-5 distinct analytical angles, e.g., Operational, Financial, Customer-centric, Competitive).
Level 3: Investigation Points (For each perspective, identify 2-3 specific factors contributing to the problem).
Level 4: Root Factors (Drill down into the fundamental "whys" for each investigation point).
Level 5: Strategic Actions (Actionable, high-impact steps to resolve the identified root factors).

Ensure the analysis is deep, exploring overlooked factors and providing a thorough multi-perspective understanding.

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
          throw new Error('The AI was unable to generate a valid analytical map. Please try a more specific problem statement.');
        }
        return output;
      } catch (error: any) {
        attempts++;
        const errorMessage = error.message || '';
        const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
        
        if (attempts >= maxAttempts || !isRateLimit) {
          throw error;
        }
        // Wait with exponential backoff before retrying (3s, 6s, 9s...)
        await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
      }
    }
    throw new Error('The AI service is currently at capacity. Please wait a few seconds and try again.');
  }
);
