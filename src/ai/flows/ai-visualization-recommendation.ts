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
    'Relationships / Correlation',
    'Composition / Percentage',
    'Composition over time',
    'Ranking',
    'Geographic analysis',
    'Deviation from target',
    'Hierarchical structure',
    'Flow / Process analysis',
    'Outlier detection'
  ]).describe('The high-level analytical goal or purpose of the visualization.'),
});
export type AIVisualizationRecommendationInput = z.infer<
  typeof AIVisualizationRecommendationInputSchema
>;

// Output Schema
const RecommendationItemSchema = z.object({
  chartType: z.string().describe('The recommended chart type (e.g., Bar Chart, Line Chart, etc.).'),
  reason: z.string().describe('Detailed reasoning for why this chart type is suitable based on the analytical goal.'),
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
  prompt: `You are an expert data visualization specialist. Your task is to recommend suitable visualization types for a given tool, set of data fields, and analytical purpose.

Analytical Purpose Context:
- Comparison: Compare values across categories (e.g., Sales by region). Charts: Bar, Grouped Bar, Dot Plot.
- Trend over time: Show how values change across time (e.g., Monthly revenue). Charts: Line, Area, Time series plot.
- Distribution: Understand how data values are spread (e.g., Customer age). Charts: Histogram, Box Plot, Violin Plot.
- Relationships / Correlation: Analyze relationships between variables (e.g., Sales vs Marketing). Charts: Scatter Plot, Bubble Chart, Regression Plot.
- Composition / Percentage: Show how parts contribute to a whole (e.g., Market share). Charts: Pie, Stacked Bar, Treemap.
- Composition over time: Show how composition changes across time. Charts: Stacked Area, Stacked Bar.
- Ranking: Order categories by value (e.g., Top 10 states). Charts: Sorted Bar, Ranked Dot Plot.
- Geographic analysis: Analyze spatial patterns (e.g., Sales by state). Charts: Filled Map, Symbol Map, Choropleth Map.
- Deviation from target: Show difference between actual values and targets. Charts: Bullet Chart, Variance Chart, Diverging Bar.
- Hierarchical structure: Visualize nested categories (e.g., Category -> Subcategory). Charts: Treemap, Sunburst.
- Flow / Process analysis: Show movement or transition between stages (e.g., Customer funnel). Charts: Sankey, Funnel.
- Outlier detection: Identify unusual or extreme values. Charts: Box Plot, Scatter Plot, Violin Plot.

Context:
- Tool: {{{tool}}}
- Available Columns: {{{columns}}}
- Data Types: {{#if dataTypes}}{{#each dataTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Unknown{{/if}}
- Selected Purpose: {{{purpose}}}

Based on these, recommend one or more visualization types. For each recommendation, provide:
1. Chart Type: A standard chart name.
2. Reason: Why it fits the data types and the specific analytical purpose "{{{purpose}}}".
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
