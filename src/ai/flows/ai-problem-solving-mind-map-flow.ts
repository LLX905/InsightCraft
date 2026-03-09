'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a deep, structured, multi-level mind map analysis
 * from a user-provided problem statement or question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolutionSchema = z.string().describe('A potential action or solution (Level 5).');
const RootCauseSchema = z.string().describe('A deeper, fundamental root cause (Level 4).');

const SubCauseNodeSchema = z.object({
  causeName: z.string().describe('The specific sub-cause description (Level 3).'),
  rootCauses: z.array(RootCauseSchema).describe('Underlying reasons for this sub-cause.'),
  solutions: z.array(SolutionSchema).describe('Potential actions to address this sub-cause.'),
});

const PerspectiveNodeSchema = z.object({
  perspectiveName: z.string().describe('A major analytical perspective or category (Level 2).'),
  subCauses: z.array(SubCauseNodeSchema).describe('A list of specific sub-causes under this perspective.'),
});

const MindMapInputSchema = z.object({
  problem: z.string().describe('The central problem or question to analyze (Level 1).'),
});
export type MindMapInput = z.infer<typeof MindMapInputSchema>;

const MindMapOutputSchema = z.object({
  centralProblem: z.string().describe('The restated core problem (Level 1).'),
  perspectives: z.array(PerspectiveNodeSchema).describe('Multiple major perspectives exploring the issue.'),
});
export type MindMapOutput = z.infer<typeof MindMapOutputSchema>;

export async function generateMindMap(input: MindMapInput): Promise<MindMapOutput> {
  return generateMindMapFlow(input);
}

const mindMapPrompt = ai.definePrompt({
  name: 'problemSolvingMindMapPrompt',
  input: {schema: MindMapInputSchema},
  output: {schema: MindMapOutputSchema},
  prompt: `You are an expert strategic consultant. Analyze the given problem and generate a comprehensive 5-level mind map in JSON format.

Depth Requirement:
Level 1: Central Problem
Level 2: Major Perspectives (Identify MANY distinct angles - at least 4-6)
Level 3: Sub-causes (For each perspective, identify multiple contributing factors)
Level 4: Root causes (Drill down into the "why" for each sub-cause)
Level 5: Possible actions or solutions (Actionable steps for each sub-cause/root cause)

Ensure the analysis is deep, exploring overlooked factors and provide a thorough multi-perspective understanding.

Problem: {{{problem}}}`,
});

const generateMindMapFlow = ai.defineFlow(
  {
    name: 'generateMindMapFlow',
    inputSchema: MindMapInputSchema,
    outputSchema: MindMapOutputSchema,
  },
  async input => {
    const {output} = await mindMapPrompt(input);
    if (!output) {
      throw new Error('Failed to generate mind map output.');
    }
    return output;
  }
);
