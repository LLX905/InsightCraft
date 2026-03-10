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
  TrendingUp,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
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
  const containerRef = useRef<HTMLDivElement>(null);

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
      toast({ title: "Analysis Complete", description: "MECE-structured multi-page framework generated." });
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
    if (!containerRef.current) return;
    
    toast({
      title: "Generating Image",
      description: "Capturing all pages of the diagnostic framework...",
    });

    try {
      const { toPng } = await import('html-to-image');
      
      // Calculate full dimensions to avoid cutoff
      const node = containerRef.current;
      const width = node.scrollWidth;
      const height = node.scrollHeight;

      const dataUrl = await toPng(node, { 
        backgroundColor: '#f8fafc',
        cacheBust: true,
        width: width,
        height: height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`,
          margin: '0',
          padding: '40px' // Add some padding around the final export
        }
      });
      
      const link = document.createElement('a');
      link.download = `mind-map-analysis-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({ title: "Export Successful", description: "Image saved to your downloads." });
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    }
  };

  const ConnectorLine = ({ isVertical, className }: { isVertical: boolean; className?: string }) => (
    <div className={cn(
      "flex items-center justify-center shrink-0",
      isVertical ? "h-16 w-full" : "w-16 h-full",
      className
    )}>
      <div className={cn(
        "bg-slate-300 relative flex items-center justify-center",
        isVertical ? "w-0.5 h-full" : "h-0.5 w-full"
      )}>
        <div className="absolute bg-white border border-slate-300 rounded-full p-1 shadow-sm z-20">
          {isVertical ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRight className="h-3 w-3 text-primary" />}
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
              Strategic Consultant Canvas
            </CardTitle>
            <CardDescription>Enter a complex problem to generate a professional MECE-compliant diagnostic framework.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., How to increase software developer retention in a remote-first company?"
              className="min-h-[80px] text-lg"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Layout Mode</Label>
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
                {loading ? "Analyzing..." : "Generate Diagnosis"}
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
          <CardContent className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start gap-2 h-10" onClick={exportAsPNG} disabled={!results}>
              <ImageIcon className="h-4 w-4" /> Export All Pages (PNG)
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-10" onClick={() => window.print()} disabled={!results}>
              <Code className="h-4 w-4" /> Print to PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {results ? (
        <div ref={containerRef} className="space-y-12">
          {/* PAGE 1: OVERVIEW (Levels 1 & 2) */}
          <div className="print-container bg-white border-2 border-slate-200 rounded-2xl p-12 shadow-sm min-h-[600px] flex flex-col items-center justify-center overflow-visible">
            <div className="mb-8 text-center space-y-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest px-4">
                Analysis Stage 01: Strategic Overview
              </Badge>
              <h3 className="text-sm text-muted-foreground font-medium uppercase tracking-tighter">Diagnostic Mapping & MECE Perspectives</h3>
            </div>

            <div className={cn(
              "flex items-center justify-center",
              layout === 'vertical' ? "flex-col" : "flex-row"
            )}>
              {/* L1: Problem */}
              <div className="mindmap-node bg-slate-900 text-white p-10 rounded-xl shadow-2xl w-[400px] text-center z-10 border-2 border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4 block">Central Problem</span>
                <h2 className="text-2xl font-headline font-bold leading-tight uppercase tracking-tight">{results.centralProblem}</h2>
              </div>

              <ConnectorLine isVertical={layout === 'vertical'} className={layout === 'vertical' ? "h-24" : "w-24"} />

              {/* L2: Perspectives */}
              <div className={cn(
                "flex gap-6",
                layout === 'vertical' ? "flex-row" : "flex-col"
              )}>
                {results.perspectives.map((perspective, idx) => (
                  <div key={idx} className="mindmap-node bg-slate-100 border-2 border-slate-300 p-6 rounded-xl shadow-md w-72 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Perspective {idx + 1}</span>
                    <h3 className="font-bold text-base text-slate-800 leading-snug">{perspective.name}</h3>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
              <ArrowRight className="h-3 w-3" /> See following pages for deep-dive analysis
            </div>
          </div>

          {/* DEEP DIVE PAGES (Levels 3 & 4) */}
          {results.perspectives.map((perspective, pIdx) => (
            <div key={pIdx} className="print-container bg-white border-2 border-slate-200 rounded-2xl p-12 shadow-sm min-h-[800px] flex flex-col overflow-visible">
              <div className="flex items-center justify-between border-b pb-6 mb-12">
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-black uppercase tracking-widest px-4">
                    Deep Dive Page {pIdx + 2}
                  </Badge>
                  <h3 className="text-2xl font-headline font-bold text-slate-900">{perspective.name} Analysis</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Root Factors & Strategy</span>
                  <p className="text-xs font-bold text-primary truncate max-w-xs">{results.centralProblem}</p>
                </div>
              </div>

              <div className={cn(
                "flex grow items-center justify-center",
                layout === 'vertical' ? "flex-col" : "flex-row"
              )}>
                {/* Re-state L2 for context */}
                <div className="mindmap-node bg-slate-100 border-2 border-slate-300 p-8 rounded-xl shadow-lg w-72 text-center shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Perspective Context</span>
                  <h3 className="font-bold text-lg text-slate-800">{perspective.name}</h3>
                </div>

                <ConnectorLine isVertical={layout === 'vertical'} className={layout === 'vertical' ? "h-20" : "w-20"} />

                {/* Branches for L3 & L4 */}
                <div className={cn(
                  "flex gap-12",
                  layout === 'vertical' ? "flex-row" : "flex-col"
                )}>
                  {perspective.causes.map((cause, cIdx) => (
                    <div key={cIdx} className={cn(
                      "flex items-center",
                      layout === 'vertical' ? "flex-col" : "flex-row"
                    )}>
                      {/* L3: Cause */}
                      <div className="mindmap-node bg-white border-2 border-slate-200 p-6 rounded-xl shadow-sm w-64 shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 flex items-center gap-1">
                          <Database className="h-4 w-4" /> Root Cause
                        </span>
                        <p className="text-sm font-semibold text-slate-700 leading-snug">{cause.name}</p>
                      </div>

                      <ConnectorLine isVertical={layout === 'vertical'} className={layout === 'vertical' ? "h-16" : "w-16"} />

                      {/* L4: Actions */}
                      <div className="mindmap-node bg-emerald-50 border-2 border-emerald-500 p-6 rounded-xl shadow-lg w-72 shrink-0">
                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest flex items-center gap-1 mb-4">
                          <CheckCircle2 className="h-4 w-4" /> Action Strategy
                        </span>
                        <div className="space-y-2">
                          {cause.actions.map((action, aIdx) => (
                            <div key={aIdx} className="text-xs font-bold text-emerald-900 bg-white p-3 rounded-lg border border-emerald-100 shadow-sm leading-tight flex items-start gap-2">
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
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="flex flex-col items-center justify-center py-40 text-center text-muted-foreground opacity-20">
          <Layout className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-headline font-bold">Awaiting Strategic Input</h3>
          <p className="text-sm">Enter your problem to see the structured diagnostic framework.</p>
        </div>
      )}
    </div>
  );
}
