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
  ChevronDown,
  Layout,
  Search,
  Database,
  CheckCircle2
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
      toast({ title: "Analysis Complete", description: "Deep 5-stage mind map generated." });
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
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
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
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    }
  };

  const Connector = ({ isVertical }: { isVertical: boolean }) => (
    <div className={cn(
      "flex items-center justify-center shrink-0",
      isVertical ? "h-24 w-full" : "w-24 h-full"
    )}>
      <div className={cn(
        "bg-slate-300 relative flex items-center justify-center",
        isVertical ? "w-0.5 h-full" : "h-0.5 w-full"
      )}>
        <div className="absolute bg-white p-1 rounded-full border-2 border-slate-300 text-slate-500 shadow-sm z-20">
          {isVertical ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="grid gap-6 lg:grid-cols-3 no-print">
        <Card className="lg:col-span-2 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Target className="h-5 w-5 text-primary" />
              Problem Definition
            </CardTitle>
            <CardDescription>Enter a complex question for a multi-stage analytical breakdown.</CardDescription>
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
                <RadioGroup value={layout} onValueChange={(v: any) => setLayout(v)} className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="horizontal" id="horizontal" />
                    <Label htmlFor="horizontal" className="text-sm cursor-pointer flex items-center gap-1">Horizontal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vertical" id="vertical" />
                    <Label htmlFor="vertical" className="text-sm cursor-pointer flex items-center gap-1">Vertical</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={handleGenerate} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2 px-8">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Analyze Deeply"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("transition-all", results ? "opacity-100" : "opacity-50 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-xs font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="justify-start gap-2 h-11" onClick={exportAsPNG} disabled={!results}>
              <ImageIcon className="h-4 w-4 text-primary" /> Download PNG
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-11" onClick={exportAsSVG} disabled={!results}>
              <Code className="h-4 w-4 text-primary" /> Download SVG
            </Button>
          </CardContent>
        </Card>
      </div>

      {results ? (
        <div ref={mindMapRef} className="p-20 bg-slate-50 rounded-2xl border shadow-inner overflow-x-auto min-w-full print-container">
          <div className={cn(
            "flex items-center min-w-max",
            layout === 'vertical' ? "flex-col" : "flex-row"
          )}>
            {/* STAGE 1: Central Problem */}
            <div className={cn("flex items-center shrink-0", layout === 'vertical' ? "flex-col" : "flex-row")}>
              <div className="mindmap-node bg-primary text-white p-8 rounded-2xl shadow-xl border-4 border-white w-80 text-center z-10 ring-8 ring-primary/10">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-2 block">Central Problem</span>
                <h2 className="text-xl font-headline font-bold leading-tight">{results.centralProblem}</h2>
              </div>
              <Connector isVertical={layout === 'vertical'} />
            </div>

            <div className={cn("flex", layout === 'vertical' ? "flex-row gap-40 pt-8" : "flex-col gap-40 pl-8")}>
              {results.perspectives.map((perspective, pIdx) => (
                <div key={pIdx} className={cn("flex items-center shrink-0", layout === 'vertical' ? "flex-col" : "flex-row")}>
                  {/* STAGE 2: Perspective */}
                  <div className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                    <div className="mindmap-node bg-white border-4 border-primary p-6 rounded-xl shadow-lg w-64 text-center z-10">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">Perspective</span>
                      <h3 className="font-headline font-bold text-lg text-slate-800">{perspective.perspectiveName}</h3>
                    </div>
                    <Connector isVertical={layout === 'vertical'} />
                  </div>

                  <div className={cn("flex", layout === 'vertical' ? "flex-row gap-24 pt-8" : "flex-col gap-24 pl-8")}>
                    {perspective.subCauses.map((sc, scIdx) => (
                      <div key={scIdx} className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                        
                        {/* STAGE 3: Investigation */}
                        <div className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                          <Card className="mindmap-node border-l-[10px] border-l-orange-500 shadow-xl w-72 bg-white z-10 shrink-0">
                            <CardHeader className="p-5">
                              <span className="text-[10px] font-bold uppercase text-orange-600 tracking-widest block mb-1 flex items-center gap-1.5">
                                <Search className="h-3.5 w-3.5" /> Investigation
                              </span>
                              <CardTitle className="text-base font-bold leading-tight text-slate-900">{sc.causeName}</CardTitle>
                            </CardHeader>
                          </Card>
                          <Connector isVertical={layout === 'vertical'} />
                        </div>

                        {/* STAGE 4: Root Factors */}
                        <div className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                          <Card className="mindmap-node border-l-[10px] border-l-amber-500 shadow-xl w-72 bg-amber-50/50 z-10 shrink-0">
                            <CardHeader className="p-5">
                              <span className="text-[10px] font-bold uppercase text-amber-700 tracking-widest block mb-2 flex items-center gap-1.5">
                                <Database className="h-3.5 w-3.5" /> Root Factors
                              </span>
                              <ul className="space-y-2">
                                {sc.rootCauses.map((rc, rcIdx) => (
                                  <li key={rcIdx} className="text-xs text-slate-700 flex gap-2 leading-relaxed bg-white/80 p-2 rounded-md border border-amber-200/50 shadow-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    {rc}
                                  </li>
                                ))}
                              </ul>
                            </CardHeader>
                          </Card>
                          <Connector isVertical={layout === 'vertical'} />
                        </div>

                        {/* STAGE 5: Strategic Solution */}
                        <Card className="mindmap-node border-l-[10px] border-l-green-600 shadow-xl w-72 bg-green-50/20 z-10 shrink-0">
                          <CardHeader className="p-5">
                            <span className="text-[10px] font-bold uppercase text-green-700 tracking-[0.2em] flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4" /> Strategic Solution
                            </span>
                            <div className="space-y-2">
                              {sc.solutions.map((sol, sIdx) => (
                                <div key={sIdx} className="p-3 rounded-lg bg-white text-green-900 text-xs font-bold border border-green-200/50 flex gap-2 shadow-sm">
                                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-green-500" />
                                  {sol}
                                </div>
                              ))}
                            </div>
                          </CardHeader>
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
          <p className="max-w-sm mx-auto">Enter a problem statement above to map out its root causes and solutions across 5 analytical stages.</p>
        </div>
      )}
    </div>
  );
}
