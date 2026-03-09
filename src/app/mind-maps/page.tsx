'use client';

import * as React from 'react';
import { useState } from 'react';
import { 
  GitGraph, 
  Sparkles, 
  Loader2, 
  Download, 
  LayoutGrid,
  Trello,
  Maximize2,
  Minimize2,
  ChevronRight,
  Target,
  FileText,
  ArrowDown,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateMindMap, type MindMapOutput } from '@/ai/flows/ai-problem-solving-mind-map-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MindMapsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState("Why is my business revenue declining?");
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [results, setResults] = useState<MindMapOutput | null>(null);

  const handleGenerate = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    try {
      const output = await generateMindMap({ problem });
      setResults(output);
      toast({ title: "Analysis Complete", description: "Deep 5-level mind map generated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate mind map.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportAsPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3 no-print">
        <Card className="lg:col-span-2 border-t-4 border-t-chart-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Target className="h-5 w-5 text-chart-3" />
              Problem Definition
            </CardTitle>
            <CardDescription>Enter a complex question or problem statement for deep analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., Why are customers leaving our product?"
              className="min-h-[100px] text-lg"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Orientation</Label>
                <RadioGroup 
                  value={layout} 
                  onValueChange={(v: any) => setLayout(v)}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="horizontal" id="horizontal" />
                    <Label htmlFor="horizontal" className="text-sm cursor-pointer">Horizontal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vertical" id="vertical" />
                    <Label htmlFor="vertical" className="text-sm cursor-pointer">Vertical</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handleGenerate} disabled={loading} className="bg-chart-3 hover:bg-chart-3/90 gap-2 px-8">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Deeply
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Card className="bg-muted/10 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="justify-start gap-2" onClick={exportAsPDF}>
                <FileText className="h-4 w-4" /> Export as PDF (Print)
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-2 italic">PNG/SVG exports coming soon in this prototype.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {results ? (
        <div className={cn(
          "flex flex-col items-center py-8 relative",
          layout === "vertical" ? "space-y-12" : "space-y-12"
        )}>
          {/* Level 1: Central Problem */}
          <div className="mindmap-node bg-chart-3 text-white p-8 rounded-2xl shadow-xl border-4 border-chart-3/20 max-w-2xl text-center z-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-2 block">Central Problem</span>
            <h2 className="text-2xl font-headline font-bold">{results.centralProblem}</h2>
          </div>

          <div className="w-full flex justify-center z-10">
            {layout === 'vertical' ? <ArrowDown className="text-muted-foreground/30 h-10 w-10" /> : <ArrowDown className="text-muted-foreground/30 h-10 w-10" />}
          </div>

          <div className={cn(
            "flex w-full",
            layout === "horizontal" ? "flex-col items-stretch gap-16" : "flex-row flex-wrap justify-center gap-12"
          )}>
            {results.perspectives.map((perspective, pIdx) => (
              <div key={pIdx} className={cn(
                "flex flex-col items-center",
                layout === "horizontal" ? "w-full pt-8 border-t border-dashed" : "max-w-md w-full"
              )}>
                {/* Level 2: Perspective */}
                <div className="mindmap-node bg-background border-2 border-chart-3/30 p-5 rounded-xl shadow-md w-80 text-center mb-10 z-20">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-chart-3 block mb-1">Perspective</span>
                  <h3 className="font-headline font-semibold text-lg">{perspective.perspectiveName}</h3>
                </div>

                <div className={cn(
                  "grid gap-8 w-full",
                  layout === "horizontal" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                  {perspective.subCauses.map((sc, scIdx) => (
                    <div key={scIdx} className="space-y-4">
                      {/* Level 3: Sub-cause */}
                      <Card className="mindmap-node border-l-4 border-l-orange-400 shadow-lg">
                        <CardHeader className="p-4 pb-2">
                          <span className="text-[9px] font-bold uppercase text-orange-500 tracking-widest block">Sub-cause</span>
                          <CardTitle className="text-base font-semibold">{sc.causeName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                          {/* Level 4: Root Causes */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter flex items-center gap-1">
                              <Trello className="h-3 w-3" /> Root Causes
                            </span>
                            <ul className="space-y-1">
                              {sc.rootCauses.map((rc, rcIdx) => (
                                <li key={rcIdx} className="text-xs text-muted-foreground flex gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-orange-200 mt-1 shrink-0" />
                                  {rc}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Level 5: Solutions */}
                          <div className="space-y-2 pt-3 border-t">
                            <span className="text-[9px] font-bold uppercase text-green-600 tracking-tighter flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Actionable Solutions
                            </span>
                            <div className="space-y-2">
                              {sc.solutions.map((sol, sIdx) => (
                                <div key={sIdx} className="p-2.5 rounded-md bg-green-50 text-green-800 text-xs font-medium border border-green-100 flex gap-2">
                                  <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-green-400" />
                                  {sol}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground opacity-30">
          <GitGraph className="h-20 w-20 mb-6" />
          <h3 className="text-2xl font-headline font-semibold">Analytical Canvas</h3>
          <p className="max-w-sm mx-auto">Enter a problem statement above to map out its root causes and solutions across multiple perspectives.</p>
        </div>
      )}
    </div>
  );
}
