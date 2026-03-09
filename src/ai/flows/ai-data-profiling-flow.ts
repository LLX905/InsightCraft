'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI data profiling.
 *
 * - aiDataProfiling - A function that profiles dataset columns to identify their types.
 * - AIDataProfilingInput - The input type for the aiDataProfiling function.
 * - AIDataProfilingOutput - The return type for the aiDataProfiling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDataProfilingInputSchema = z.object({
  datasetColumns: z
    .array(
      z.object({
        name: z.string().describe('The name of the dataset column.'),
        sampleValues: z
          .array(z.string())
          .describe('An array of sample values for the column.'),
      })
    )
    .describe('An array of objects, each describing a column in the dataset.'),
});
export type AIDataProfilingInput = z.infer<typeof AIDataProfilingInputSchema>;

const AIDataProfilingOutputSchema = z.object({
  profiledColumns: z
    .array(
      z.object({
        name: z.string().describe('The name of the profiled column.'),
        type: z
          .enum([
            'categorical',
            'numerical',
            'time series',
            'hierarchical',
            'geographic',
            'unknown',
          ])
          .describe('The identified variable type of the column.'),
        reasoning: z
          .string()
          .optional()
          .describe(
            'Optional: The reasoning behind the identified variable type.'
          ),
      })
    )
    .describe('An array of objects, each containing the name and identified type of a column.'),
});
export type AIDataProfilingOutput = z.infer<typeof AIDataProfilingOutputSchema>;

export async function aiDataProfiling(
  input: AIDataProfilingInput
): Promise<AIDataProfilingOutput> {
  return aiDataProfilingFlow(input);
}

const aiDataProfilingPrompt = ai.definePrompt({
  name: 'aiDataProfilingPrompt',
  input: { schema: AIDataProfilingInputSchema },
  output: { schema: AIDataProfilingOutputSchema },
  prompt: `You are an expert data analyst. Your task is to automatically identify the variable type for each column in a given dataset.

For each column, you will be provided with its name and a list of sample values. Based on these, determine if the column is 'categorical', 'numerical', 'time series', 'hierarchical', 'geographic', or 'unknown'. Provide a brief reasoning if helpful.

Dataset Columns to Profile:
{{#each datasetColumns}}
- Column Name: "{{{name}}}"
  Sample Values: [{{#each sampleValues}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}]
{{/each}}

Provide the output in the specified JSON format.`,
});

const aiDataProfilingFlow = ai.defineFlow(
  {
    name: 'aiDataProfilingFlow',
    inputSchema: AIDataProfilingInputSchema,
    outputSchema: AIDataProfilingOutputSchema,
  },
  async (input) => {
    const {output} = await aiDataProfilingPrompt(input);
    return output!;
  }
);
