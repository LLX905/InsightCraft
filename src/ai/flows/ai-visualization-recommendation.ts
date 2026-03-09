'use server';
/**
 * @fileOverview A flow that recommends suitable data visualization types based on dataset characteristics and user intent.
 *
 * - aiVisualizationRecommendation - A function that handles the AI visualization recommendation process.
 * - AIVisualizationRecommendationInput - The input type for the aiVisualizationRecommendation function.
 * - AIVisualizationRecommendationOutput - The return type for the aiVisualizationRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AIVisualizationRecommendationInputSchema = z.object({
  datasetCharacteristics:
    z.string().describe(
      'A description of the dataset characteristics, including variable types (e.g., categorical, numerical, time series, hierarchical, geographic) and their roles.'
    ),
  userGoal:
    z.string().describe(
      'The user\'s high-level goal for the visualization (e.g., "compare sales over time", "show distribution of customers", "identify correlations").'
    ),
});
export type AIVisualizationRecommendationInput = z.infer<
  typeof AIVisualizationRecommendationInputSchema
>;

// Output Schema
const AIVisualizationRecommendationOutputSchema = z.object({
  recommendedVisualizations:
    z.array(z.string()).describe(
      'An array of recommended visualization types (e.g., "Bar Chart", "Line Chart", "Scatter Plot", "Heatmap").'
    ),
  explanation:
    z.string().describe(
      'An explanation of why the recommended visualizations are suitable for the given dataset characteristics and user goal.'
    ),
  configurationGuidance:
    z.string().describe(
      'Guidance on how to configure the recommended visualizations, including potential axis mappings, aggregation strategies, and relevant parameters.'
    ),
});
export type AIVisualizationRecommendationOutput = z.infer<
  typeof AIVisualizationRecommendationOutputSchema
>;

// Prompt definition
const aiVisualizationRecommendationPrompt = ai.definePrompt({
  name: 'aiVisualizationRecommendationPrompt',
  input: {schema: AIVisualizationRecommendationInputSchema},
  output: {schema: AIVisualizationRecommendationOutputSchema},
  prompt: `You are an expert data visualization specialist. Your task is to recommend suitable visualization types for a given dataset and user goal. Provide clear explanations and configuration guidance.

Dataset Characteristics:
{{{datasetCharacteristics}}}

User Goal:
{{{userGoal}}}

Based on these, recommend one or more visualization types, explain why they are suitable, and provide configuration guidance. The output should be a JSON object conforming to the AIVisualizationRecommendationOutputSchema.`,
});

// Flow definition
const aiVisualizationRecommendationFlow = ai.defineFlow(
  {
    name: 'aiVisualizationRecommendationFlow',
    inputSchema: AIVisualizationRecommendationInputSchema,
    outputSchema: AIVisualizationRecommendationOutputSchema,
  },
  async input => {
    const {output} = await aiVisualizationRecommendationPrompt(input);
    if (!output) {
      throw new Error('Failed to get visualization recommendations.');
    }
    return output;
  }
);

// Wrapper function
export async function aiVisualizationRecommendation(
  input: AIVisualizationRecommendationInput
):
  Promise<AIVisualizationRecommendationOutput> {
  return aiVisualizationRecommendationFlow(input);
}
