'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a professional MECE-compliant 4-level analytical mind map.
 * 
 * Levels:
 * 1. Core Problem (Problem)
 * 2. Perspectives (Categories)
 * 3. Causes (Root Factors)
 * 4. Actions (Solutions)
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActionSchema = z.string().describe('A specific practical solution or action (Level 4). 4-6 words max.');

const CauseSchema = z.object({
  name: z.string().describe('A specific root cause (Level 3). 4-6 words max.'),
  actions: z.array(ActionSchema).min(2).max(4).describe('Practical actions addressing this specific cause.'),
});

const PerspectiveSchema = z.object({
  name: z.string().describe('A major analytical perspective or category (Level 2). Use categories like External, Personal, Strategy, Network, etc.'),
  causes: z.array(CauseSchema).min(3).max(5).describe('3-5 specific causes contributing to the problem from this perspective.'),
});

const MindMapInputSchema = z.object({
  problem: z.string().describe('The central problem to analyze.'),
});
export type MindMapInput = z.infer<typeof MindMapInputSchema>;

const MindMapOutputSchema = z.object({
  centralProblem: z.string().describe('The restated core problem (Level 1). 4-6 words max.'),
  perspectives: z.array(PerspectiveSchema).min(3).max(5).describe('3-5 major analytical perspectives/categories that are Mutually Exclusive and Collectively Exhaustive (MECE).'),
});
export type MindMapOutput = z.infer<typeof MindMapOutputSchema>;

export async function generateMindMap(input: MindMapInput): Promise<MindMapOutput> {
  return generateMindMapFlow(input);
}

const mindMapPrompt = ai.definePrompt({
  name: 'problemSolvingMindMapPrompt',
  input: {schema: MindMapInputSchema},
  output: {schema: MindMapOutputSchema},
  prompt: `You are an expert strategic consultant. Analyze the given problem and generate a highly structured 4-level analytical mind map in JSON format following the MECE (Mutually Exclusive, Collectively Exhaustive) principle.

Analytical Framework:
Group your analysis into clear, non-overlapping categories to ensure no duplicate ideas and a complete coverage of the problem space. Use standard professional perspectives:
- External Environment (Market demand, Competition, Economy, Tech shifts)
- Internal Capability (Skills, Quality, Operational efficiency)
- Strategy & Execution (Business model, Marketing, Sales approach)
- Social / Network Factors (Partnerships, Connections, Brand visibility)
- Behavioral / Psychological Factors (Customer behavior, Motivation, decision psychology)

Constraints:
1. MECE Principle: Branches must not overlap and must together cover the entire problem space.
2. Levels: 
   - Level 1: Core Problem
   - Level 2: Major Perspectives (Categories)
   - Level 3: Causes (Specific root factors)
   - Level 4: Actions (Practical solutions for each specific cause)
3. Node Content:
   - Each node MUST contain no more than 4-6 words.
   - Avoid full sentences. Use short, punchy phrases.
   - Example: "Weak networking" instead of "Insufficient networking opportunities in the industry."
4. Balance:
   - Each Perspective (L2) MUST have 3-5 Causes (L3).
   - Each Cause (L3) MUST lead to 2-4 practical Actions (L4).

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
