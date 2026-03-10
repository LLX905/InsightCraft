'use server';
/**
 * @fileOverview A flow that recommends suitable data visualization types based on dataset characteristics, user intent, and specific tools.
 *
 * - aiVisualizationRecommendation - A function that handles the AI visualization recommendation process.
 * - AIVisualizationRecommendationInput - The input type for the aiVisualizationRecommendation function.
 * - AIVisualizationRecommendationOutput - The return type for the aiVisualizationRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AIVisualizationRecommendationInputSchema = z.object({
  tool: z.enum(['Excel', 'Tableau', 'Power BI', 'Python (Matplotlib / Seaborn)', 'R', 'Other']).describe('The visualization tool being used.'),
  columns: z.string().describe('The data columns or fields available (comma-separated or text description).'),
  dataTypes: z.array(z.string()).optional().describe('Detected or user-specified data types (e.g., Numerical, Categorical, Time series, Geographical).'),
  purpose: z.enum([
    'Comparison',
    'Trend over time',
    'Distribution',
    'Relationship between variables',
    'Composition / percentage',
    'Geographic analysis',
    'Ranking'
  ]).describe('The high-level goal or purpose of the visualization.'),
});
export type AIVisualizationRecommendationInput = z.infer<
  typeof AIVisualizationRecommendationInputSchema
>;

// Output Schema
const RecommendationItemSchema = z.object({
  chartType: z.string().describe('The recommended chart type (e.g., Bar Chart, Line Chart, etc.).'),
  reason: z.string().describe('Detailed reasoning for why this chart type is suitable.'),
  fieldMapping: z.string().describe('How to map the provided fields to chart axes/properties (e.g., X-axis -> Date).'),
  toolNotes: z.string().describe('Tool-specific implementation notes for the chosen tool.'),
});

const AIVisualizationRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendationItemSchema).describe('An array of recommended visualizations.'),
});
export type AIVisualizationRecommendationOutput = z.infer<
  typeof AIVisualizationRecommendationOutputSchema
>;

// Prompt definition
const aiVisualizationRecommendationPrompt = ai.definePrompt({
  name: 'aiVisualizationRecommendationPrompt',
  input: {schema: AIVisualizationRecommendationInputSchema},
  output: {schema: AIVisualizationRecommendationOutputSchema},
  prompt: `You are an expert data visualization specialist. Your task is to recommend suitable visualization types for a given tool, set of data fields, and user goal.

Context:
- Tool: {{{tool}}}
- Available Columns: {{{columns}}}
- Data Types: {{#if dataTypes}}{{#each dataTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Unknown{{/if}}
- Purpose: {{{purpose}}}

Based on these, recommend one or more visualization types. For each recommendation, provide:
1. Chart Type: A standard chart name.
2. Reason: Why it fits the data types and purpose.
3. Field Mapping: Suggest which columns go to which axes or visual encodings.
4. Tool-Specific Notes: Advice specific to implementing this in {{{tool}}}.

The output should be a JSON object conforming to the AIVisualizationRecommendationOutputSchema.`,
});

// Flow definition
const aiVisualizationRecommendationFlow = ai.defineFlow(
  {
    name: 'aiVisualizationRecommendationFlow',
    inputSchema: AIVisualizationRecommendationInputSchema,
    outputSchema: AIVisualizationRecommendationOutputSchema,
  },
  async input => {
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const {output} = await aiVisualizationRecommendationPrompt(input);
        if (!output) {
          throw new Error('Failed to get visualization recommendations.');
        }
        return output;
      } catch (error: any) {
        attempts++;
        const errorMessage = error.message || '';
        const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
        
        if (attempts >= maxAttempts || !isRateLimit) {
          throw error;
        }
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      }
    }
    throw new Error('The AI recommendation service is currently busy. Please try again shortly.');
  }
);

// Wrapper function
export async function aiVisualizationRecommendation(
  input: AIVisualizationRecommendationInput
):
  Promise<AIVisualizationRecommendationOutput> {
  return aiVisualizationRecommendationFlow(input);
}
