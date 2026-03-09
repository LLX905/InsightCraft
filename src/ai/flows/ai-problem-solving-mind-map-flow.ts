'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a structured, multi-level mind map analysis
 * from a user-provided problem statement.
 *
 * - generateMindMap - A function that handles the mind map generation process.
 * - ProblemStatementInput - The input type for the generateMindMap function.
 * - MindMapOutput - The return type for the generateMindMap function, representing the structured mind map.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolutionSchema = z.string().describe('A potential solution for the cause.');
const RootCauseSchema = z.string().describe('A deeper root cause for the sub-cause.');

const CauseNodeSchema = z.object({
  causeName: z.string().describe('The specific cause identified under this perspective.'),
  rootCauses: z.array(RootCauseSchema).describe('A list of deeper, underlying reasons for this specific cause.'),
  solutions: z.array(SolutionSchema).describe('A list of potential actions or strategies to address this specific cause.'),
});

const PerspectiveNodeSchema = z.object({
  perspectiveName: z.string().describe('A major analytical perspective or category from which the problem can be viewed.'),
  causes: z.array(CauseNodeSchema).describe('A list of specific causes contributing to the core problem, grouped under this perspective.'),
});

export const ProblemStatementInputSchema = z.object({
  problemStatement: z.string().describe('The complex problem statement for which a mind map analysis is requested.'),
});
export type ProblemStatementInput = z.infer<typeof ProblemStatementInputSchema>;

export const MindMapOutputSchema = z.object({
  coreProblem: z.string().describe('A concise and clear restatement of the central problem identified from the input statement.'),
  perspectives: z.array(PerspectiveNodeSchema).describe('An array of major analytical perspectives, each containing related causes, root causes, and solutions.'),
});
export type MindMapOutput = z.infer<typeof MindMapOutputSchema>;

export async function generateMindMap(input: ProblemStatementInput): Promise<MindMapOutput> {
  return generateMindMapFlow(input);
}

const mindMapPrompt = ai.definePrompt({
  name: 'problemSolvingMindMapPrompt',
  input: {schema: ProblemStatementInputSchema},
  output: {schema: MindMapOutputSchema},
  prompt: `You are an expert strategic consultant and analytical thinking assistant. Your task is to analyze the given problem statement and generate a comprehensive, structured, multi-level mind map analysis in JSON format. The mind map must provide a deep, multi-faceted understanding of the complex issue.\n\nThe mind map structure should strictly adhere to the following hierarchy and details:\n\n1.  **Core Problem**: Provide a concise and clear restatement of the central problem. This should be the overarching issue that the mind map explores.\n\n2.  **Major Perspectives**: Identify and list several distinct major analytical perspectives or categories from which the core problem can be viewed. These should offer different angles or domains relevant to the problem. For each perspective:\n    a.  **Perspective Name**: Give a clear, descriptive name to the perspective.\n    b.  **Sub-causes**: Under each perspective, identify and list multiple specific sub-causes that contribute directly to the core problem from that particular viewpoint. For each sub-cause:\n        i.  **Cause Name**: Provide a clear and specific description of the sub-cause.\n        ii. **Deeper Root Causes**: For each sub-cause, identify and list several deeper, underlying root causes. Ask "why" this sub-cause exists, drilling down to fundamental issues. Provide at least 2-3 root causes per sub-cause.\n        iii. **Potential Solutions**: For each sub-cause, propose several actionable and distinct potential solutions that could address it. Provide at least 2-3 solutions per sub-cause.\n\nEnsure the output is a valid JSON object and strictly conforms to the provided schema. Be thorough, insightful, and comprehensive in your analysis to provide a multi-perspective understanding without user editing.\n\nProblem Statement: {{{problemStatement}}}`,
});

const generateMindMapFlow = ai.defineFlow(
  {
    name: 'generateMindMapFlow',
    inputSchema: ProblemStatementInputSchema,
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
