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
  AlertCircle,
  Layout as LayoutIcon,
  Palette,
  ShieldCheck,
  Info
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
import { Separator } from '@/components/ui/separator';
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
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Settings2 className="h-5 w-5 text-primary" />
              Strategic Configuration
            </CardTitle>
            <CardDescription>Select your tool and analytical goals for tailored charting.</CardDescription>
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
              <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
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
              {loading ? "Strategizing..." : "Generate Strategy"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-8">
        {results ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Primary Recommendation */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-headline font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-accent" />
                  Primary Strategic Choice
                </h3>
                <Badge className="bg-primary px-4 py-1 text-sm">OPTIMAL SELECTION</Badge>
              </div>
              
              <Card className="overflow-hidden border-2 border-primary shadow-2xl ring-4 ring-primary/5">
                <CardHeader className="bg-primary/5 border-b">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl font-headline">{results.primaryRecommendation.chartType}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  {/* Detailed Reasoning */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                      <Info className="h-3 w-3" />
                      Detailed Strategic Reasoning
                    </div>
                    <p className="text-lg leading-relaxed text-slate-700 font-medium italic">
                      {results.primaryRecommendation.detailedReasoning}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Implementation Specs */}
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-4">Field Mapping & Config</span>
                        <div className="text-sm font-bold text-slate-800 bg-white p-3 rounded-lg border">
                          {results.primaryRecommendation.fieldMapping}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20">
                        <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em] block mb-4">{formData.tool} Implementation Notes</span>
                        <p className="text-sm text-accent-foreground font-medium">{results.primaryRecommendation.toolNotes}</p>
                      </div>
                    </div>

                    {/* Additional Insights */}
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2 mb-4">
                          <LayoutIcon className="h-3 w-3" /> Suggested Dashboard Layout
                        </span>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 text-xs border-b border-blue-100 pb-2">
                            <span className="font-bold text-blue-800 min-w-[60px]">Top:</span>
                            <span className="text-slate-600">{results.primaryRecommendation.dashboardLayout.top}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs border-b border-blue-100 pb-2">
                            <span className="font-bold text-blue-800 min-w-[60px]">Center:</span>
                            <span className="text-slate-600">{results.primaryRecommendation.dashboardLayout.center}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs border-b border-blue-100 pb-2">
                            <span className="font-bold text-blue-800 min-w-[60px]">Right:</span>
                            <span className="text-slate-600">{results.primaryRecommendation.dashboardLayout.right}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs pt-1">
                            <span className="font-bold text-blue-800 min-w-[60px]">Bottom:</span>
                            <span className="text-slate-600">{results.primaryRecommendation.dashboardLayout.bottom}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2 mb-4">
                          <Palette className="h-3 w-3" /> Color Strategy
                        </span>
                        <Badge variant="outline" className="mb-2 bg-white text-emerald-700 border-emerald-200">
                          {results.primaryRecommendation.colorStrategy.paletteType}
                        </Badge>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          {results.primaryRecommendation.colorStrategy.explanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Data Validation */}
                  <div className="p-5 rounded-2xl bg-orange-50/30 border border-orange-100">
                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-[0.2em] flex items-center gap-2 mb-4">
                      <ShieldCheck className="h-3 w-3" /> Data Validation & Integrity
                    </span>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {results.primaryRecommendation.dataValidation.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-orange-900">
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alternative Perspective */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Alternative Analytical Perspectives
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {results.alternativeRecommendations.map((rec, idx) => (
                  <Card key={idx} className="overflow-hidden border-l-4 border-l-slate-300 transition-all hover:border-l-accent hover:shadow-lg">
                    <CardHeader className="py-4 px-6 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-headline font-bold text-slate-800">{rec.chartType}</CardTitle>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2">ALT {idx + 1}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed italic">{rec.detailedReasoning}</p>
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {rec.colorStrategy.paletteType} Palette
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100">
                          {rec.fieldMapping}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 p-8 rounded-full mb-6">
              <AlertCircle className="h-20 w-20 opacity-20 text-primary" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-slate-900">Awaiting Strategy Definition</h3>
            <p className="max-w-md mx-auto text-sm leading-relaxed mt-4">
              Configure your visualization tool and select multiple analytical intents on the left to receive a prioritized diagnostic charting strategy with detailed mapping and dashboard logic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
