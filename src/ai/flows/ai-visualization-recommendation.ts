'use server';
/**
 * @fileOverview A flow that recommends suitable data visualization types based on dataset characteristics, multiple user intents, and specific tools.
 *
 * - aiVisualizationRecommendation - A function that handles the AI visualization recommendation process.
 * - AIVisualizationRecommendationInput - The input type for the aiVisualizationRecommendation function.
 * - AIVisualizationRecommendationOutput - The return type for the aiVisualizationRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizationPurposeEnum = z.enum([
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
]);

// Input Schema
const AIVisualizationRecommendationInputSchema = z.object({
  tool: z.enum(['Excel', 'Tableau', 'Power BI', 'Python (Matplotlib / Seaborn)', 'R', 'Other']).describe('The visualization tool being used.'),
  columns: z.string().describe('The data columns or fields available (comma-separated or text description).'),
  dataTypes: z.array(z.string()).optional().describe('Detected or user-specified data types (e.g., Numerical, Categorical, Time series, Geographical).'),
  purposes: z.array(VisualizationPurposeEnum).min(1).describe('The analytical goals or purposes of the visualization. Users can select multiple.'),
});
export type AIVisualizationRecommendationInput = z.infer<
  typeof AIVisualizationRecommendationInputSchema
>;

// Output Schema
const RecommendationItemSchema = z.object({
  chartType: z.string().describe('The recommended chart type (e.g., Bar Chart, Line Chart, etc.).'),
  reason: z.string().describe('Brief summary reasoning.'),
  detailedReasoning: z.string().describe('Detailed explanation considering data structure, purpose, readability, and insight discovery.'),
  fieldMapping: z.string().describe('How to map the provided fields to chart axes/properties (e.g., X-axis -> Date).'),
  toolNotes: z.string().describe('Tool-specific implementation notes for the chosen tool.'),
  dashboardLayout: z.object({
    top: z.string().describe('Suggested components for the top section (e.g., KPI cards).'),
    center: z.string().describe('Suggested primary visualization for the center.'),
    right: z.string().describe('Suggested secondary visualization or panel for the right side.'),
    bottom: z.string().describe('Suggested context or details for the bottom section.'),
  }).describe('A simple dashboard layout idea using the recommended charts.'),
  colorStrategy: z.object({
    paletteType: z.string().describe('The type of color palette (e.g., Sequential, Diverging, Qualitative).'),
    explanation: z.string().describe('Why this palette helps interpretation for this specific visualization.'),
  }).describe('Recommended color strategies and their logic.'),
  dataValidation: z.array(z.string()).describe('Useful data validation suggestions to avoid visualization errors.'),
});

const AIVisualizationRecommendationOutputSchema = z.object({
  primaryRecommendation: RecommendationItemSchema.describe('The best single chart that satisfies the dominant or combined analytical goals.'),
  alternativeRecommendations: z.array(RecommendationItemSchema).min(2).max(4).describe('2-4 secondary recommendations that offer different perspectives or fulfill secondary goals.'),
});
export type AIVisualizationRecommendationOutput = z.infer<
  typeof AIVisualizationRecommendationOutputSchema
>;

// Prompt definition
const aiVisualizationRecommendationPrompt = ai.definePrompt({
  name: 'aiVisualizationRecommendationPrompt',
  input: {schema: AIVisualizationRecommendationInputSchema},
  output: {schema: AIVisualizationRecommendationOutputSchema},
  prompt: `You are an expert data visualization specialist. Your task is to recommend suitable visualization types for a given tool, set of data fields, and one or more analytical purposes.

Analytical Purpose Definitions & Priority:
- Comparison: Compare values across categories. Charts: Bar, Grouped Bar, Dot Plot.
- Trend over time: Show changes over time. Charts: Line, Area, Time series plot. (High Priority)
- Distribution: Understand data spread. Charts: Histogram, Box Plot, Violin Plot.
- Relationships / Correlation: Analyze relationships between variables. Charts: Scatter Plot, Bubble Chart.
- Composition / Percentage: Parts of a whole. Charts: Pie, Stacked Bar, Treemap.
- Composition over time: Composition changes across time. Charts: Stacked Area, Stacked Bar.
- Ranking: Order categories by value. Charts: Sorted Bar, Ranked Dot Plot.
- Geographic analysis: Analyze spatial patterns. Charts: Filled Map, Symbol Map. (High Priority)
- Deviation from target: Actual vs Target. Charts: Bullet Chart, Variance Chart.
- Hierarchical structure: Visualize nested categories. Charts: Treemap, Sunburst.
- Flow / Process analysis: Movement or transitions. Charts: Sankey, Funnel.
- Outlier detection: Identify extreme values. Charts: Box Plot, Scatter Plot.

Combined Purpose Logic:
If multiple purposes are selected, determine the dominant goal.
Example Priorities:
- Trend over time + Comparison -> Multi-line chart.
- Geographic analysis + Comparison -> Filled map.

Tool Context:
- Tool: {{{tool}}}
- Available Columns: {{{columns}}}
- Data Types: {{#if dataTypes}}{{#each dataTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Unknown{{/if}}
- Selected Purposes: {{#each purposes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Based on these, provide:
1. Primary Recommendation: The single best chart type.
2. Alternative Recommendations: 2-4 alternative chart types.

For each recommendation, you MUST provide:
- Chart Type: A standard chart name.
- Reason: Brief summary.
- Detailed Reasoning: Explain WHY it fits the dataset considering data structure, purpose, readability, and insight discovery. Avoid generic explanations.
- Field Mapping: Suggest column to axes mappings.
- Tool-Specific Notes: Implementation advice specific to {{{tool}}}.
- Dashboard Layout: A suggested dashboard arrangement (Top, Center, Right, Bottom).
- Color Strategy: Palette type and specific explanation for why it helps interpretation.
- Data Validation: Specific suggestions to avoid visualization errors (e.g., "Check for missing state codes", "Aggregate duplicates").

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
