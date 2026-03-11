'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Settings2, 
  Layers,
  Wand2,
  CheckCircle2,
  AlertCircle
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
import { cn } from '@/lib/utils';

export default function VisualizationsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tool: 'Excel' as any,
    columns: 'Date, Revenue, Region, Product Category',
    dataTypes: [] as string[],
    purposes: ['Trend over time'] as string[]
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

  const handlePurposeChange = (purpose: string, checked: boolean) => {
    setFormData(prev => {
      const newPurposes = checked 
        ? [...prev.purposes, purpose] 
        : prev.purposes.filter(p => p !== purpose);
      
      return { ...prev, purposes: newPurposes };
    });
  };

  const handleAnalyze = async () => {
    if (!formData.columns.trim()) {
      toast({ title: "Input Required", description: "Please enter your data columns.", variant: "destructive" });
      return;
    }
    if (formData.purposes.length === 0) {
      toast({ title: "Input Required", description: "Please select at least one analytical purpose.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const output = await aiVisualizationRecommendation(formData as any);
      setResults(output);
      toast({ title: "Analysis Complete", description: "Generated tailored recommendations for your analytical goals." });
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

  const visualizationPurposes = [
    { label: 'Comparison', description: 'Compare values across categories' },
    { label: 'Trend over time', description: 'Show changes over time' },
    { label: 'Distribution', description: 'Understand data spread' },
    { label: 'Relationships / Correlation', description: 'Analyze variable relationships' },
    { label: 'Composition / Percentage', description: 'Parts of a whole' },
    { label: 'Composition over time', description: 'Composition changes over time' },
    { label: 'Ranking', description: 'Order categories by value' },
    { label: 'Geographic analysis', description: 'Analyze spatial patterns' },
    { label: 'Deviation from target', description: 'Actual vs Target' },
    { label: 'Hierarchical structure', description: 'Visualize nested categories' },
    { label: 'Flow / Process analysis', description: 'Movement or transitions' },
    { label: 'Outlier detection', description: 'Identify extreme values' }
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Input Section */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Settings2 className="h-5 w-5 text-primary" />
              Strategic Configuration
            </CardTitle>
            <CardDescription>Select your tool and multiple analytical goals for tailored charting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visualization Tool</Label>
              <Select value={formData.tool} onValueChange={(v) => setFormData(f => ({ ...f, tool: v }))}>
                <SelectTrigger className="h-11">
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
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Columns / Fields</Label>
              <Textarea 
                value={formData.columns}
                onChange={(e) => setFormData(f => ({ ...f, columns: e.target.value }))}
                placeholder="e.g., Date, Revenue, Region..."
                className="min-h-[100px] resize-none"
              />
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Comma-separated headers or description</p>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Analytical Purposes (Select Multiple)</Label>
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
                {visualizationPurposes.map(purpose => (
                  <div key={purpose.label} className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                    formData.purposes.includes(purpose.label) ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" : "bg-card"
                  )} onClick={() => handlePurposeChange(purpose.label, !formData.purposes.includes(purpose.label))}>
                    <Checkbox 
                      id={`p-${purpose.label}`} 
                      checked={formData.purposes.includes(purpose.label)}
                      onCheckedChange={(checked) => handlePurposeChange(purpose.label, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="grid gap-0.5 leading-none">
                      <label htmlFor={`p-${purpose.label}`} className="text-sm font-semibold cursor-pointer">{purpose.label}</label>
                      <p className="text-[10px] text-muted-foreground">{purpose.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-primary hover:bg-primary/90 h-12 text-lg gap-2 shadow-lg shadow-primary/20">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {loading ? "Strategizing..." : "Analyze Intent & Data"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-7 space-y-6">
        {results ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-xl font-headline font-bold flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                Strategic Primary Choice
              </h3>
              
              <Card className="overflow-hidden border-2 border-primary shadow-xl ring-4 ring-primary/5">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl font-headline">{results.primaryRecommendation.chartType}</CardTitle>
                    </div>
                    <Badge variant="default" className="bg-primary hover:bg-primary px-3">PRIMARY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-1 text-card-foreground">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] block mb-2">Intent Alignment</span>
                    <p className="text-sm leading-relaxed font-medium">{results.primaryRecommendation.reason}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-inner">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-3">Field Configuration</span>
                      <p className="text-sm font-bold text-slate-700">{results.primaryRecommendation.fieldMapping}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em] block mb-3">{formData.tool} Strategy</span>
                      <p className="text-sm text-accent-foreground italic font-medium">{results.primaryRecommendation.toolNotes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed border-muted-foreground/30">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Alternative Perspectives
              </h3>
              
              <div className="grid gap-4">
                {results.alternativeRecommendations.map((rec, idx) => (
                  <Card key={idx} className="overflow-hidden border-l-4 border-l-slate-300 shadow-sm transition-all hover:border-l-accent hover:shadow-md">
                    <CardHeader className="py-3 px-4 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-headline font-bold text-slate-700">{rec.chartType}</CardTitle>
                        <Badge variant="outline" className="text-[9px] h-5 bg-white">ALT {idx + 1}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{rec.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-[10px] font-medium bg-slate-100 text-slate-600 border-none">
                          Mapping: {rec.fieldMapping}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <AlertCircle className="h-16 w-16 opacity-20 text-primary" />
            </div>
            <h3 className="text-lg font-headline font-bold text-slate-900">Awaiting Your Configuration</h3>
            <p className="max-w-xs mx-auto text-sm leading-relaxed mt-2">Specify your tool and analytical goals to receive a prioritized diagnostic charting strategy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
