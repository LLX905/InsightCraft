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
  ClipboardCheck
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
      padding: 40,
      width,
      height,
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
                      <ArrowRight className="h-3 w-3" /> Horizontal (LR)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vertical" id="vertical" />
                    <Label htmlFor="vertical" className="text-sm cursor-pointer flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" /> Vertical (TB)
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
        <div ref={mindMapRef} className="p-10 bg-slate-50 rounded-2xl border shadow-inner overflow-x-auto min-w-full print-container">
          <div className={cn(
            "flex items-center justify-center min-w-max",
            layout === 'vertical' ? "flex-col" : "flex-row"
          )}>
            {/* Stage 1: Central Problem */}
            <div className="relative z-10">
              <div className="mindmap-node bg-chart-3 text-white p-8 rounded-2xl shadow-xl border-4 border-white w-80 text-center mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-2 block">Central Problem</span>
                <h2 className="text-xl font-headline font-bold leading-tight">{results.centralProblem}</h2>
              </div>
              
              <div className={cn(
                "flex items-center justify-center",
                layout === 'vertical' ? "h-12 w-full" : "w-12 h-full absolute top-1/2 left-full -translate-y-1/2"
              )}>
                <div className={cn(
                  "bg-chart-3/20",
                  layout === 'vertical' ? "w-0.5 h-full" : "h-0.5 w-full"
                )} />
              </div>
            </div>

            <div className={cn(
              "flex gap-16",
              layout === 'vertical' ? "flex-row flex-nowrap pt-4" : "flex-col flex-nowrap pl-4"
            )}>
              {results.perspectives.map((perspective, pIdx) => (
                <div key={pIdx} className={cn(
                  "flex items-center",
                  layout === 'vertical' ? "flex-col" : "flex-row"
                )}>
                  {/* Stage 2: Perspective */}
                  <div className="relative group">
                    <div className="mindmap-node bg-white border-2 border-chart-3 p-5 rounded-xl shadow-md w-64 text-center z-10 relative">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-chart-3 block mb-1">Perspective</span>
                      <h3 className="font-headline font-semibold text-base">{perspective.perspectiveName}</h3>
                    </div>
                    
                    <div className={cn(
                      "flex items-center justify-center",
                      layout === 'vertical' ? "h-12 w-full" : "w-12 h-full absolute top-1/2 left-full -translate-y-1/2"
                    )}>
                      <div className={cn(
                        "bg-chart-3/20",
                        layout === 'vertical' ? "w-0.5 h-full" : "h-0.5 w-full"
                      )} />
                    </div>
                  </div>

                  <div className={cn(
                    "flex gap-10",
                    layout === 'vertical' ? "flex-row pt-4" : "flex-col pl-4"
                  )}>
                    {perspective.subCauses.map((sc, scIdx) => (
                      <div key={scIdx} className={cn(
                        "flex items-center",
                        layout === 'vertical' ? "flex-col" : "flex-row"
                      )}>
                        {/* Stage 3: Analysis Card (Causes) */}
                        <div className="relative">
                          <Card className="mindmap-node border-l-4 border-l-orange-400 shadow-lg w-72 transition-all hover:shadow-xl bg-white z-10 relative">
                            <CardHeader className="p-4 pb-2">
                              <span className="text-[9px] font-bold uppercase text-orange-500 tracking-widest block">Sub-cause</span>
                              <CardTitle className="text-sm font-bold leading-snug">{sc.causeName}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                              <div className="space-y-2">
                                <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter flex items-center gap-1">
                                  <Trello className="h-3 w-3" /> Root causes
                                </span>
                                <ul className="space-y-1.5">
                                  {sc.rootCauses.map((rc, rcIdx) => (
                                    <li key={rcIdx} className="text-[11px] text-muted-foreground flex gap-2 leading-tight">
                                      <div className="h-1.5 w-1.5 rounded-full bg-orange-200 mt-1 shrink-0" />
                                      {rc}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Connector to Solutions */}
                          <div className={cn(
                            "flex items-center justify-center",
                            layout === 'vertical' ? "h-10 w-full" : "w-10 h-full absolute top-1/2 left-full -translate-y-1/2"
                          )}>
                            <div className={cn(
                              "bg-orange-200",
                              layout === 'vertical' ? "w-0.5 h-full" : "h-0.5 w-full"
                            )} />
                          </div>
                        </div>

                        {/* Stage 4: Action Card (Solutions) */}
                        <Card className="mindmap-node border-l-4 border-l-green-500 shadow-lg w-72 transition-all hover:shadow-xl bg-green-50/30">
                          <CardHeader className="p-4 pb-2">
                            <span className="text-[9px] font-bold uppercase text-green-600 tracking-widest flex items-center gap-1">
                              <ClipboardCheck className="h-3 w-3" /> Action Plan
                            </span>
                            <CardTitle className="text-[10px] text-muted-foreground font-medium italic">Recommended Solutions</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-2">
                            <div className="space-y-1.5">
                              {sc.solutions.map((sol, sIdx) => (
                                <div key={sIdx} className="p-2 rounded-md bg-white text-green-800 text-[10px] font-medium border border-green-100 flex gap-1.5 shadow-sm leading-tight">
                                  <ChevronRight className="h-2.5 w-2.5 shrink-0 mt-0.5 text-green-400" />
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
