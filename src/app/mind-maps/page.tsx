'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Download, 
  Target, 
  ImageIcon,
  Code,
  ChevronRight,
  ChevronDown,
  Layout,
  Database,
  CheckCircle2,
  TrendingUp
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
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState("Why is my business revenue declining?");
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [results, setResults] = useState<MindMapOutput | null>(null);
  const mindMapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const output = await generateMindMap({ problem });
      setResults(output);
      toast({ title: "Analysis Complete", description: "MECE-structured 4-level map generated." });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to generate mind map.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAsPNG = async () => {
    if (!mindMapRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const width = mindMapRef.current.scrollWidth;
      const height = mindMapRef.current.scrollHeight;

      const dataUrl = await toPng(mindMapRef.current, { 
        backgroundColor: '#f8fafc', 
        width,
        height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`,
        }
      });
      
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
      const { toSvg } = await import('html-to-image');
      const width = mindMapRef.current.scrollWidth;
      const height = mindMapRef.current.scrollHeight;

      const dataUrl = await toSvg(mindMapRef.current, { 
        backgroundColor: '#f8fafc',
        width,
        height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`,
        }
      });
      
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
      isVertical ? "h-20 w-full" : "w-24 h-full"
    )}>
      <div className={cn(
        "bg-slate-300 relative flex items-center justify-center",
        isVertical ? "w-0.5 h-full" : "h-0.5 w-full"
      )}>
        <div className="absolute bg-white border border-slate-300 rounded-full p-1.5 shadow-sm z-20">
          {isVertical ? <ChevronDown className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 text-primary" />}
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="grid gap-6 lg:grid-cols-3 no-print">
        <Card className="lg:col-span-2 border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
              <Target className="h-5 w-5 text-primary" />
              Strategic Canvas
            </CardTitle>
            <CardDescription>Enter a challenge to generate a MECE-based 4-level analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., Why is customer retention dropping?"
              className="min-h-[80px] text-lg"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Flow</Label>
                <RadioGroup value={layout} onValueChange={(v: any) => setLayout(v)} className="flex items-center gap-4">
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
              <Button onClick={handleGenerate} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2 px-8 h-10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Generate Map"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("transition-all", results ? "opacity-100" : "opacity-50 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-xs font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start gap-2 h-10" onClick={exportAsPNG} disabled={!results}>
              <ImageIcon className="h-4 w-4" /> Download PNG
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-10" onClick={exportAsSVG} disabled={!results}>
              <Code className="h-4 w-4" /> Download SVG
            </Button>
          </CardContent>
        </Card>
      </div>

      {results ? (
        <div ref={mindMapRef} className="p-16 bg-slate-50 rounded-xl border shadow-inner overflow-x-auto min-w-full">
          <div className={cn(
            "flex items-center min-w-max",
            layout === 'vertical' ? "flex-col" : "flex-row"
          )}>
            {/* LEVEL 1: Problem (Dark Blue) */}
            <div className={cn("flex items-center shrink-0", layout === 'vertical' ? "flex-col" : "flex-row")}>
              <div className="mindmap-node bg-slate-900 text-white p-8 rounded-lg shadow-2xl w-80 text-center z-10 border-2 border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3 block">Level 1: Problem</span>
                <h2 className="text-xl font-headline font-bold leading-tight uppercase tracking-tight">{results.centralProblem}</h2>
              </div>
            </div>

            {/* Branching to Perspectives */}
            <div className={cn("flex", layout === 'vertical' ? "flex-row gap-32 pt-16" : "flex-col gap-32 pl-16")}>
              {results.perspectives.map((perspective, pIdx) => (
                <div key={pIdx} className={cn("flex items-center shrink-0", layout === 'vertical' ? "flex-col" : "flex-row")}>
                  <Connector isVertical={layout === 'vertical'} />

                  {/* LEVEL 2: Perspective (Medium Grey) */}
                  <div className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                    <div className="mindmap-node bg-slate-200 border-2 border-slate-300 p-6 rounded-lg shadow-lg w-72 text-center z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Level 2: Perspective</span>
                      <h3 className="font-bold text-base text-slate-800">{perspective.name}</h3>
                    </div>
                  </div>

                  {/* Branching to Causes */}
                  <div className={cn("flex", layout === 'vertical' ? "flex-row gap-16 pt-16" : "flex-col gap-16 pl-16")}>
                    {perspective.causes.map((cause, cIdx) => (
                      <div key={cIdx} className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                        <Connector isVertical={layout === 'vertical'} />
                        
                        {/* LEVEL 3: Cause (White) */}
                        <div className="mindmap-node bg-white border-2 border-slate-200 p-6 rounded-lg shadow-md w-64 z-10 shrink-0">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 flex items-center gap-1">
                            <Database className="h-4 w-4" /> Level 3: Cause
                          </span>
                          <p className="text-sm font-semibold text-slate-700 leading-snug">{cause.name}</p>
                        </div>

                        <Connector isVertical={layout === 'vertical'} />

                        {/* LEVEL 4: Actions (Green) */}
                        <div className="mindmap-node bg-emerald-50 border-2 border-emerald-500 p-6 rounded-lg shadow-xl w-72 z-10 shrink-0">
                          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest flex items-center gap-1 mb-4">
                            <CheckCircle2 className="h-4 w-4" /> Level 4: Action Plan
                          </span>
                          <div className="space-y-2">
                            {cause.actions.map((action, aIdx) => (
                              <div key={aIdx} className="text-xs font-bold text-emerald-900 bg-white p-3 rounded-md border border-emerald-100 shadow-sm leading-tight flex items-start gap-2">
                                <TrendingUp className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="flex flex-col items-center justify-center py-40 text-center text-muted-foreground opacity-20">
          <Layout className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-headline font-bold">Awaiting Analysis</h3>
          <p className="text-sm">Enter your problem to see the structured 4-level strategy flow.</p>
        </div>
      )}
    </div>
  );
}
