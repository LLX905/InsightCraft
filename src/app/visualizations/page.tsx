'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Settings2, 
  Layers,
  Wand2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { aiVisualizationRecommendation, type AIVisualizationRecommendationOutput } from '@/ai/flows/ai-visualization-recommendation';
import { useToast } from '@/hooks/use-toast';

export default function VisualizationsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tool: 'Excel' as any,
    columns: 'Date, Revenue, Region, Product Category',
    dataTypes: [] as string[],
    purpose: 'Trend over time' as any
  });
  const [results, setResults] = useState<AIVisualizationRecommendationOutput | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDataTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dataTypes: checked 
        ? [...prev.dataTypes, type] 
        : prev.dataTypes.filter(t => t !== type)
    }));
  };

  const handleAnalyze = async () => {
    if (!formData.columns.trim()) {
      toast({ title: "Input Required", description: "Please enter your data columns.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const output = await aiVisualizationRecommendation(formData);
      setResults(output);
      toast({ title: "Analysis Complete", description: "Generated custom recommendations for your tool." });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to generate recommendations.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Input Section */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Settings2 className="h-5 w-5 text-primary" />
              Dataset Configuration
            </CardTitle>
            <CardDescription>Tell us about your data and your visualization goals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Visualization Tool</Label>
              <Select value={formData.tool} onValueChange={(v) => setFormData(f => ({ ...f, tool: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your tool" />
                </SelectTrigger>
                <SelectContent>
                  {['Excel', 'Tableau', 'Power BI', 'Python (Matplotlib / Seaborn)', 'R', 'Other'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Columns / Fields</Label>
              <Textarea 
                value={formData.columns}
                onChange={(e) => setFormData(f => ({ ...f, columns: e.target.value }))}
                placeholder="e.g., Date, Revenue, Region..."
                className="min-h-[100px]"
              />
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Enter comma-separated headers or a description</p>
            </div>

            <div className="space-y-3">
              <Label>Data Types (Optional)</Label>
              <div className="grid grid-cols-2 gap-3">
                {['Numerical', 'Categorical', 'Time series', 'Geographical'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={type} 
                      checked={formData.dataTypes.includes(type)}
                      onCheckedChange={(checked) => handleDataTypeChange(type, !!checked)}
                    />
                    <label htmlFor={type} className="text-sm font-medium leading-none cursor-pointer">{type}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visualization Purpose</Label>
              <Select value={formData.purpose} onValueChange={(v) => setFormData(f => ({ ...f, purpose: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="What is the goal?" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Comparison',
                    'Trend over time',
                    'Distribution',
                    'Relationship between variables',
                    'Composition / percentage',
                    'Geographic analysis',
                    'Ranking'
                  ].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-primary h-12 text-lg gap-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {loading ? "Analyzing..." : "Generate Recommendations"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-7 space-y-6">
        {results ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-headline font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Recommended Visualizations
            </h3>
            
            {results.recommendations.map((rec, idx) => (
              <Card key={idx} className="overflow-hidden border-l-4 border-l-accent">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-headline">{rec.chartType}</CardTitle>
                    <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent">Recommended</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Reasoning</span>
                    <p className="text-sm leading-relaxed">{rec.reason}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <span className="text-[10px] font-bold uppercase text-primary tracking-widest block mb-1">Field Mapping</span>
                      <p className="text-sm font-medium">{rec.fieldMapping}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                      <span className="text-[10px] font-bold uppercase text-green-600 tracking-widest block mb-1">{formData.tool} Notes</span>
                      <p className="text-sm text-green-800 italic">{rec.toolNotes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
            <Layers className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-headline font-semibold">Awaiting Configuration</h3>
            <p className="max-w-xs mx-auto text-sm">Fill out the form on the left to see which charts best represent your data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
