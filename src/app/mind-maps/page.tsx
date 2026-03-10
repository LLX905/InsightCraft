'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Download, 
  Target, 
  ImageIcon,
  Layout as LayoutIcon,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Database
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

// --- Types & Constants ---
type Orientation = 'horizontal' | 'vertical';

const NODE_SPECS = {
  L1: { w: 420, h: 120, color: 'bg-[#1e293b] text-white border-[#334155]' },
  L2: { w: 260, h: 90, color: 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]' },
  L3: { w: 240, h: 80, color: 'bg-white text-[#334155] border-[#e2e8f0]' },
  L4: { w: 240, h: 'auto', color: 'bg-[#ecfdf5] text-[#065f46] border-[#10b981]' }
};

const SPACING = {
  gapX: 120,
  gapY: 100,
  padding: 80
};

// --- Components ---

const Node = ({ 
  title, 
  type, 
  className, 
  children 
}: { 
  title: string; 
  type: keyof typeof NODE_SPECS; 
  className?: string;
  children?: React.ReactNode;
}) => {
  const spec = NODE_SPECS[type];
  return (
    <div 
      className={cn(
        "flex flex-col justify-center items-center text-center p-4 rounded-xl border-2 shadow-sm shrink-0 overflow-hidden mindmap-node",
        spec.color,
        className
      )}
      style={{ 
        width: spec.w, 
        height: spec.h === 'auto' ? 'auto' : spec.h,
        minHeight: spec.h === 'auto' ? 100 : 'auto'
      }}
    >
      {type === 'L4' && (
        <div className="flex items-center gap-1 mb-2 opacity-60">
          <CheckCircle2 className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">Action Strategy</span>
        </div>
      )}
      <p className={cn(
        "font-headline font-bold leading-tight line-clamp-4",
        type === 'L1' ? "text-xl" : "text-sm"
      )}>
        {title}
      </p>
      {children}
    </div>
  );
};

export default function MindMapsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState("Why is my small business revenue declining despite increased marketing?");
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
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
      toast({ title: "Analysis Complete", description: "Multi-page MECE framework generated." });
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
      title: "Generating Images",
      description: "Capturing diagnostic framework pages...",
    });

    try {
      const { toPng } = await import('html-to-image');
      const pages = containerRef.current.querySelectorAll('.mind-map-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const rect = page.getBoundingClientRect();
        
        const dataUrl = await toPng(page, { 
          backgroundColor: '#f8fafc',
          width: rect.width,
          height: rect.height,
          style: {
            overflow: 'visible',
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            margin: '0',
            transform: 'none'
          },
          cacheBust: true,
          pixelRatio: 2
        });
        
        const link = document.createElement('a');
        link.download = `analysis-page-${i + 1}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
      
      toast({ title: "Export Successful", description: "All pages saved to downloads." });
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
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
    <div className="space-y-8 pb-20">
      <div className="grid gap-6 lg:grid-cols-3 no-print">
        <Card className="lg:col-span-2 border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
              <Target className="h-5 w-5 text-primary" />
              Strategic Diagnosis Canvas
            </CardTitle>
            <CardDescription>Generate a professional multi-page MECE analysis framework.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Enter a complex business or personal problem..."
              className="min-h-[80px] text-lg"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Orientation</Label>
                <RadioGroup value={orientation} onValueChange={(v: any) => setOrientation(v)} className="flex items-center gap-4">
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
                {loading ? "Analyzing..." : "Generate Analysis"}
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
          </CardContent>
        </Card>
      </div>

      {results ? (
        <div ref={containerRef} className="space-y-16">
          {/* PAGE 1: STRATEGIC OVERVIEW (L1 & L2) */}
          <div className="mind-map-page print-container bg-white border-2 border-slate-200 rounded-2xl shadow-sm min-h-[700px] flex flex-col items-center justify-center relative overflow-visible"
               style={{ 
                 minWidth: '1200px', 
                 padding: `${SPACING.padding}px`,
                 width: orientation === 'vertical' ? '1200px' : 'auto',
                 height: 'auto'
               }}>
            
            <div className="mb-12 text-center space-y-2 z-10">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest px-4 py-1">
                Phase 01: Strategic Overview
              </Badge>
              <h3 className="text-2xl font-headline font-bold text-slate-900 tracking-tight">MECE Diagnostic Framework</h3>
            </div>

            <div className={cn(
              "flex items-center justify-center",
              orientation === 'vertical' ? "flex-col gap-[100px]" : "flex-row gap-[120px]"
            )}>
              <div className="relative">
                <Node title={results.centralProblem} type="L1" />
              </div>
              
              <div className={cn(
                "flex justify-center",
                orientation === 'vertical' ? "flex-row gap-[40px] flex-wrap" : "flex-col gap-[40px]"
              )}>
                {results.perspectives.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {orientation === 'horizontal' && <ChevronRight className="h-6 w-6 text-slate-200" />}
                    <Node title={p.name} type="L2" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
              <ArrowRight className="h-3 w-3" /> Detailed deep-dives follow
            </div>
          </div>

          {/* DEEP DIVE PAGES (L2 -> L3 -> L4) */}
          {results.perspectives.map((perspective, pIdx) => (
            <div key={pIdx} className="mind-map-page print-container bg-white border-2 border-slate-200 rounded-2xl shadow-sm min-h-[800px] flex flex-col relative overflow-visible"
                 style={{ 
                   minWidth: '1200px', 
                   padding: `${SPACING.padding}px`,
                   width: orientation === 'vertical' ? '1200px' : 'auto',
                   height: 'auto'
                 }}>
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-12">
                <div className="space-y-1">
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-black uppercase tracking-widest px-3 mb-2">
                    Phase 02: Deep Dive (Page {pIdx + 2})
                  </Badge>
                  <h3 className="text-3xl font-headline font-bold text-slate-900">{perspective.name} Analysis</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Root Factors & Strategy</span>
                  <p className="text-sm font-bold text-primary max-w-xs line-clamp-1">{results.centralProblem}</p>
                </div>
              </div>

              <div className={cn(
                "flex grow items-center justify-center",
                orientation === 'vertical' ? "flex-col gap-[100px]" : "flex-row gap-[120px]"
              )}>
                {/* Level 2 Context */}
                <div className="flex flex-col items-center gap-4">
                  <Node title={perspective.name} type="L2" className="ring-4 ring-slate-100 ring-offset-4" />
                </div>

                {/* Level 3 & 4 Branches */}
                <div className={cn(
                  "flex grow justify-center",
                  orientation === 'vertical' ? "flex-row gap-[60px] flex-wrap items-start" : "flex-col gap-[60px]"
                )}>
                  {perspective.causes.map((cause, cIdx) => (
                    <div key={cIdx} className={cn(
                      "flex items-center",
                      orientation === 'vertical' ? "flex-col gap-[40px]" : "flex-row gap-[40px]"
                    )}>
                      {/* L3: Cause */}
                      <Node title={cause.name} type="L3">
                        <div className="mt-2 opacity-30">
                          <Database className="h-3 w-3 mx-auto" />
                        </div>
                      </Node>

                      {/* L4: Actions */}
                      <div className="flex flex-col gap-3">
                        {cause.actions.map((action, aIdx) => (
                          <Node key={aIdx} title={action} type="L4" />
                        ))}
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
          <LayoutIcon className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-headline font-bold">Awaiting Analytical Input</h3>
          <p className="text-sm">Enter a problem statement to generate a MECE diagnostic framework.</p>
        </div>
      )}
    </div>
  );
}
