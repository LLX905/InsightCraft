'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Download, 
  Target, 
  ImageIcon,
  Code,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Trello,
  Layout,
  ClipboardCheck,
  ChevronDown
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';

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
  const mindMapRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setResults(null);
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

  const getExportOptions = () => {
    if (!mindMapRef.current) return {};
    
    const width = mindMapRef.current.scrollWidth;
    const height = mindMapRef.current.scrollHeight;

    return { 
      backgroundColor: '#f8fafc', 
      padding: 60,
      width: width + 120,
      height: height + 120,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: 'none',
        margin: '0',
      },
      cacheBust: true,
      skipFonts: true 
    };
  };

  const exportAsPNG = async () => {
    if (!mindMapRef.current) return;
    try {
      const dataUrl = await toPng(mindMapRef.current, getExportOptions());
      const link = document.createElement('a');
      link.download = `mind-map-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message || "Could not generate PNG image.", variant: "destructive" });
    }
  };

  const exportAsSVG = async () => {
    if (!mindMapRef.current) return;
    try {
      const dataUrl = await toSvg(mindMapRef.current, getExportOptions());
      const link = document.createElement('a');
      link.download = `mind-map-${Date.now()}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message || "Could not generate SVG image.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-20">
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
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Layout</Label>
                <RadioGroup 
                  value={layout} 
                  onValueChange={(v: any) => setLayout(v)}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="horizontal" id="horizontal" />
                    <Label htmlFor="horizontal" className="text-sm cursor-pointer flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" /> Horizontal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vertical" id="vertical" />
                    <Label htmlFor="vertical" className="text-sm cursor-pointer flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" /> Vertical
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handleGenerate} disabled={loading} className="bg-chart-3 hover:bg-chart-3/90 gap-2 px-8 min-w-[200px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Analyze Deeply"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("transition-all duration-300", results ? "opacity-100 translate-y-0" : "opacity-50 translate-y-2 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="justify-start gap-2 h-11" onClick={exportAsPNG} disabled={!results}>
              <ImageIcon className="h-4 w-4 text-chart-3" /> Download PNG
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-11" onClick={exportAsSVG} disabled={!results}>
              <Code className="h-4 w-4 text-chart-3" /> Download SVG
            </Button>
          </CardContent>
        </Card>
      </div>

      {results ? (
        <div ref={mindMapRef} className="p-20 bg-slate-50 rounded-2xl border shadow-inner overflow-x-auto min-w-full print-container">
          <div className={cn(
            "flex items-center justify-center min-w-max",
            layout === 'vertical' ? "flex-col" : "flex-row"
          )}>
            {/* Stage 1: Central Problem */}
            <div className={cn(
              "flex items-center",
              layout === 'vertical' ? "flex-col" : "flex-row"
            )}>
              <div className="mindmap-node bg-chart-3 text-white p-10 rounded-2xl shadow-xl border-4 border-white w-96 text-center z-10 ring-8 ring-chart-3/10">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-3 block">Core Objective</span>
                <h2 className="text-2xl font-headline font-bold leading-tight">{results.centralProblem}</h2>
              </div>
              
              {/* Central Connector */}
              <div className={cn(
                "flex items-center justify-center",
                layout === 'vertical' ? "h-32 w-full" : "w-32 h-full"
              )}>
                <div className={cn(
                  "bg-chart-3 relative flex items-center justify-center",
                  layout === 'vertical' ? "w-1 h-full" : "h-1 w-full"
                )}>
                  <div className="absolute bg-slate-50 p-2 rounded-full border-2 border-chart-3 text-chart-3 shadow-sm z-20">
                    {layout === 'vertical' ? <ChevronDown className="h-8 w-8" /> : <ChevronRight className="h-8 w-8" />}
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(
              "flex",
              layout === 'vertical' ? "flex-row gap-32 pt-8" : "flex-col gap-32 pl-8"
            )}>
              {results.perspectives.map((perspective, pIdx) => (
                <div key={pIdx} className={cn(
                  "flex items-center",
                  layout === 'vertical' ? "flex-col" : "flex-row"
                )}>
                  {/* Stage 2: Perspective */}
                  <div className={cn(
                    "flex items-center",
                    layout === 'vertical' ? "flex-col" : "flex-row"
                  )}>
                    <div className="mindmap-node bg-white border-4 border-chart-3 p-8 rounded-xl shadow-lg w-72 text-center z-10 relative">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-chart-3 block mb-2">Perspective</span>
                      <h3 className="font-headline font-bold text-xl text-slate-800">{perspective.perspectiveName}</h3>
                    </div>
                    
                    {/* Perspective Connector */}
                    <div className={cn(
                      "flex items-center justify-center",
                      layout === 'vertical' ? "h-32 w-full" : "w-32 h-full"
                    )}>
                      <div className={cn(
                        "bg-chart-3/40 relative flex items-center justify-center",
                        layout === 'vertical' ? "w-0.5 h-full" : "h-0.5 w-full"
                      )}>
                        <div className="absolute bg-slate-50 p-1.5 rounded-full border border-chart-3/40 text-chart-3/60 shadow-sm z-20">
                          {layout === 'vertical' ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "flex",
                    layout === 'vertical' ? "flex-row gap-24 pt-8" : "flex-col gap-24 pl-8"
                  )}>
                    {perspective.subCauses.map((sc, scIdx) => (
                      <div key={scIdx} className={cn(
                        "flex items-center",
                        layout === 'vertical' ? "flex-col" : "flex-row"
                      )}>
                        {/* Stage 3: Analysis Card (Causes) */}
                        <div className={cn(
                          "flex items-center",
                          layout === 'vertical' ? "flex-col" : "flex-row"
                        )}>
                          <Card className="mindmap-node border-l-[12px] border-l-orange-500 shadow-2xl w-80 bg-white z-10 relative">
                            <CardHeader className="p-6 pb-4">
                              <span className="text-[10px] font-bold uppercase text-orange-600 tracking-widest block mb-1">Investigation</span>
                              <CardTitle className="text-lg font-bold leading-tight text-slate-900">{sc.causeName}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-5">
                              <div className="space-y-3">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-tighter flex items-center gap-1.5">
                                  <Trello className="h-4 w-4" /> Root Factors
                                </span>
                                <ul className="space-y-3">
                                  {sc.rootCauses.map((rc, rcIdx) => (
                                    <li key={rcIdx} className="text-xs text-slate-700 flex gap-3 leading-relaxed bg-orange-50/70 p-3 rounded-lg border border-orange-100/50 shadow-sm">
                                      <div className="h-2 w-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                      {rc}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Action Connector - FIXED Inline Width/Height to avoid overlap */}
                          <div className={cn(
                            "flex items-center justify-center",
                            layout === 'vertical' ? "h-32 w-full" : "w-32 h-full"
                          )}>
                            <div className={cn(
                              "bg-orange-300 relative flex items-center justify-center",
                              layout === 'vertical' ? "w-1 h-full" : "h-1 w-full"
                            )}>
                              <div className="absolute bg-white p-2.5 rounded-full border-2 border-orange-400 text-orange-600 shadow-md z-20">
                                {layout === 'vertical' ? <ChevronDown className="h-8 w-8 font-bold" /> : <ChevronRight className="h-8 w-8 font-bold" />}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stage 4: Action Card (Solutions) */}
                        <Card className="mindmap-node border-l-[12px] border-l-green-600 shadow-2xl w-80 bg-green-50/10 border-green-100 z-10">
                          <CardHeader className="p-6 pb-4">
                            <span className="text-[10px] font-bold uppercase text-green-700 tracking-[0.2em] flex items-center gap-2">
                              <ClipboardCheck className="h-5 w-5" /> Strategic Solution
                            </span>
                            <CardTitle className="text-xs text-green-800/80 font-bold italic tracking-wide mt-1">Recommended Actions</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 pt-0 space-y-4">
                            <div className="space-y-3">
                              {sc.solutions.map((sol, sIdx) => (
                                <div key={sIdx} className="p-4 rounded-xl bg-white text-green-900 text-xs font-bold border-2 border-green-200/50 flex gap-3 shadow-sm leading-relaxed ring-1 ring-green-50/50">
                                  <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                                  {sol}
                                </div>
                              ))}
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
        </div>
      ) : !loading && (
        <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground opacity-30">
          <Layout className="h-20 w-20 mb-6" />
          <h3 className="text-2xl font-headline font-semibold">Analytical Canvas</h3>
          <p className="max-w-sm mx-auto">Enter a problem statement above to map out its root causes and solutions across multiple perspectives.</p>
        </div>
      )}
    </div>
  );
}
