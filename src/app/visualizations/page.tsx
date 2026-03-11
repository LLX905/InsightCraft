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
  Info,
  MapPin,
  Terminal
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
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Analytical Purposes</Label>
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
            
            {/* 1. Primary Strategic Choice */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-headline font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-accent" />
                  Primary Strategic Choice
                </h3>
                <Badge className="bg-primary px-4 py-1 text-sm">OPTIMAL SELECTION</Badge>
              </div>
              
              <Card className="overflow-hidden border-2 border-primary shadow-2xl ring-4 ring-primary/5">
                <CardHeader className="bg-primary/5 border-b py-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-3xl font-headline">{results.primaryRecommendation.chartType}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 pb-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                      <Info className="h-3 w-3" />
                      Strategic Reasoning
                    </div>
                    <p className="text-lg leading-relaxed text-slate-700 font-medium italic">
                      {results.primaryRecommendation.detailedReasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 2. Alternative Analytical Perspectives */}
            <section className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Alternative Analytical Perspectives
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {results.alternativeRecommendations.map((rec, idx) => (
                  <Card key={idx} className="overflow-hidden border-l-4 border-l-slate-300 transition-all hover:border-l-accent hover:shadow-lg">
                    <CardHeader className="py-4 px-6 bg-slate-50/50 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-headline font-bold text-slate-800">{rec.chartType}</CardTitle>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2">ALT {idx + 1}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-sm text-slate-600 leading-relaxed italic">{rec.detailedReasoning}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 3. Field Mapping Guide */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Field Mapping Guide
              </h3>
              <div className="p-6 rounded-2xl bg-slate-900 text-slate-50 border shadow-inner">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Terminal className="h-3 w-3" /> Technical Specification
                </div>
                <div className="text-lg font-mono font-bold leading-relaxed">
                  {results.primaryRecommendation.fieldMapping}
                </div>
              </div>
            </section>

            {/* 4. Tool-Specific Implementation */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Tool-Specific Implementation
              </h3>
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6 space-y-4">
                  <Badge variant="outline" className="bg-white text-accent-foreground border-accent/20 font-bold">
                    Target Tool: {formData.tool}
                  </Badge>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {results.primaryRecommendation.toolNotes}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* 5. Suggested Dashboard Layout */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <LayoutIcon className="h-4 w-4" />
                Suggested Dashboard Layout
              </h3>
              <Card className="bg-blue-50/30 border-blue-100">
                <CardContent className="p-8">
                  <div className="grid gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 border-b border-blue-100">
                      <span className="min-w-[100px] text-xs font-black uppercase text-blue-800 tracking-widest mt-1">Top</span>
                      <p className="text-sm text-slate-700">{results.primaryRecommendation.dashboardLayout.top}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 border-b border-blue-100">
                      <span className="min-w-[100px] text-xs font-black uppercase text-blue-800 tracking-widest mt-1">Center</span>
                      <p className="text-sm text-slate-700 font-bold">{results.primaryRecommendation.dashboardLayout.center}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 border-b border-blue-100">
                      <span className="min-w-[100px] text-xs font-black uppercase text-blue-800 tracking-widest mt-1">Right</span>
                      <p className="text-sm text-slate-700">{results.primaryRecommendation.dashboardLayout.right}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <span className="min-w-[100px] text-xs font-black uppercase text-blue-800 tracking-widest mt-1">Bottom</span>
                      <p className="text-sm text-slate-700">{results.primaryRecommendation.dashboardLayout.bottom}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 6. Color & Design Recommendations */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color & Design Recommendations
              </h3>
              <Card className="bg-emerald-50/30 border-emerald-100">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-600 text-white border-none">
                      {results.primaryRecommendation.colorStrategy.paletteType}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 italic">
                    {results.primaryRecommendation.colorStrategy.explanation}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* 7. Data validation & integrity */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Data validation & integrity
              </h3>
              <Card className="bg-orange-50/20 border-orange-100">
                <CardContent className="p-6">
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {results.primaryRecommendation.dataValidation.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-orange-900 group">
                        <div className="h-2 w-2 rounded-full bg-orange-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center text-muted-foreground bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 p-8 rounded-full mb-6">
              <AlertCircle className="h-20 w-20 opacity-20 text-primary" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-slate-900">Awaiting Strategy Definition</h3>
            <p className="max-w-md mx-auto text-sm leading-relaxed mt-4">
              Configure your visualization tool and select analytical intents on the left to receive a prioritized diagnostic charting strategy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
