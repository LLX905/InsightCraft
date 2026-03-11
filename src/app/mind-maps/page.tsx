'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Download, 
  Target, 
  ImageIcon,
  Layout as LayoutIcon,
  CheckCircle2,
  Database,
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

const Node = React.forwardRef<
  HTMLDivElement, 
  { title: string; type: keyof typeof NODE_SPECS; className?: string; children?: React.ReactNode }
>(({ title, type, className, children }, ref) => {
  const spec = NODE_SPECS[type];
  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col justify-center items-center text-center p-4 rounded-xl border-2 shadow-sm shrink-0 overflow-hidden mindmap-node relative z-10",
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
          <span className="text-[9px] font-black uppercase tracking-widest">Action Plan</span>
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
});
Node.displayName = "Node";

const CurvedArrow = ({ 
  start, 
  end, 
  orientation 
}: { 
  start: { x: number; y: number }; 
  end: { x: number; y: number };
  orientation: Orientation;
}) => {
  const path = useMemo(() => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Control points for cubic bezier
    let cp1x, cp1y, cp2x, cp2y;

    if (orientation === 'horizontal') {
      cp1x = start.x + dx * 0.5;
      cp1y = start.y;
      cp2x = start.x + dx * 0.5;
      cp2y = end.y;
    } else {
      cp1x = start.x;
      cp1y = start.y + dy * 0.5;
      cp2x = end.x;
      cp2y = start.y + dy * 0.5;
    }

    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
  }, [start, end, orientation]);

  return (
    <g className="pointer-events-none">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        strokeDasharray="4 2"
      />
    </g>
  );
};

export default function MindMapsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState("Why is my startup's user retention dropping despite high initial signups?");
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [results, setResults] = useState<MindMapOutput | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Refs = useRef<(HTMLDivElement | null)[]>([]);
  const l3Refs = useRef<(HTMLDivElement | null)[][]>([]);
  const l4Refs = useRef<(HTMLDivElement | null)[][][]>([]);
  const [connections, setConnections] = useState<{ [key: string]: { start: { x: number; y: number }, end: { x: number; y: number } }[] }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalculate positions after render or results change
  useEffect(() => {
    if (!results) return;

    const calculatePositions = () => {
      const newConnections: { [key: string]: { start: { x: number; y: number }, end: { x: number; y: number } }[] } = {};
      
      const getCenter = (el: HTMLElement | null, pageEl: HTMLElement | null) => {
        if (!el || !pageEl) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        const pageRect = pageEl.getBoundingClientRect();
        return {
          x: rect.left - pageRect.left + rect.width / 2,
          y: rect.top - pageRect.top + rect.height / 2
        };
      };

      const pages = containerRef.current?.querySelectorAll('.mind-map-page');
      if (!pages) return;

      // Page 1: L1 -> L2
      const page1 = pages[0] as HTMLElement;
      const p1Conns: { start: { x: number; y: number }, end: { x: number; y: number } }[] = [];
      const l1Center = getCenter(l1Ref.current, page1);
      
      l2Refs.current.forEach((ref) => {
        if (ref) p1Conns.push({ start: l1Center, end: getCenter(ref, page1) });
      });
      newConnections['page1'] = p1Conns;

      // Deep Dive Pages: L2 -> L3 -> L4
      results.perspectives.forEach((_, pIdx) => {
        const page = pages[pIdx + 1] as HTMLElement;
        const pageConns: { start: { x: number; y: number }, end: { x: number; y: number } }[] = [];
        
        // Find the L2 on this specific page (it's the first child of the first flex container usually)
        const l2OnPage = page.querySelector('.ring-4') as HTMLElement;
        const l2Center = getCenter(l2OnPage, page);

        l3Refs.current[pIdx]?.forEach((l3Ref, cIdx) => {
          if (l3Ref) {
            const l3Center = getCenter(l3Ref, page);
            pageConns.push({ start: l2Center, end: l3Center });

            l4Refs.current[pIdx]?.[cIdx]?.forEach((l4Ref) => {
              if (l4Ref) pageConns.push({ start: l3Center, end: getCenter(l4Ref, page) });
            });
          }
        });
        newConnections[`page${pIdx + 2}`] = pageConns;
      });

      setConnections(newConnections);
    };

    const timer = setTimeout(calculatePositions, 500); // Wait for ref attachment
    window.addEventListener('resize', calculatePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePositions);
    };
  }, [results, orientation]);

  const handleGenerate = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setResults(null);
    setConnections({});
    try {
      const output = await generateMindMap({ problem });
      setResults(output);
      toast({ title: "Analysis Complete", description: "Professional MECE diagnostic framework generated." });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to generate analysis.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAsPNG = async () => {
    if (!containerRef.current) return;
    
    toast({
      title: "Generating Framework",
      description: "Capturing diagnostic pages...",
    });

    try {
      const { toPng } = await import('html-to-image');
      const pages = containerRef.current.querySelectorAll('.mind-map-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const rect = page.getBoundingClientRect();
        
        const dataUrl = await toPng(page, { 
          backgroundColor: '#ffffff',
          width: rect.width,
          height: rect.height,
          style: {
            overflow: 'visible',
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            margin: '0'
          },
          pixelRatio: 2
        });
        
        const link = document.createElement('a');
        link.download = `diagnostic-stage-${i + 1}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
      
      toast({ title: "Export Successful", description: "Analysis pages saved." });
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
              placeholder="Enter a complex business problem for MECE analysis..."
              className="min-h-[80px] text-lg"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Layout Mode</Label>
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
                {loading ? "Diagnosing..." : "Run AI Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("transition-all", results ? "opacity-100" : "opacity-50 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-xs font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Download Results
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start gap-2 h-10" onClick={exportAsPNG} disabled={!results}>
              Save All Pages (PNG)
            </Button>
          </CardContent>
        </Card>
      </div>

      {results ? (
        <div ref={containerRef} className="space-y-16">
          {/* PAGE 1: OVERVIEW (L1 & L2) */}
          <div className="mind-map-page bg-white border-2 border-slate-200 rounded-2xl shadow-sm min-h-[700px] flex flex-col items-center justify-center relative overflow-visible"
               style={{ 
                 minWidth: '1200px', 
                 padding: `${SPACING.padding}px`,
                 width: orientation === 'vertical' ? '1200px' : 'auto'
               }}>
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {connections['page1']?.map((conn, idx) => (
                <CurvedArrow key={idx} start={conn.start} end={conn.end} orientation={orientation} />
              ))}
            </svg>

            <div className="mb-16 text-center space-y-2 z-10">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest px-4 py-1">
                Diagnostic Stage 01: Overview
              </Badge>
              <h3 className="text-2xl font-headline font-bold text-slate-900 tracking-tight">MECE Framework Structure</h3>
            </div>

            <div className={cn(
              "flex items-center justify-center",
              orientation === 'vertical' ? "flex-col gap-[100px]" : "flex-row gap-[120px]"
            )}>
              <Node ref={l1Ref} title={results.centralProblem} type="L1" />
              
              <div className={cn(
                "flex justify-center",
                orientation === 'vertical' ? "flex-row gap-[40px] flex-wrap" : "flex-col gap-[40px]"
              )}>
                {results.perspectives.map((p, i) => (
                  <Node 
                    key={i} 
                    ref={(el) => { l2Refs.current[i] = el; }}
                    title={p.name} 
                    type="L2" 
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-16 flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
              <ArrowRight className="h-3 w-3" /> Detailed Branch Deep-Dives Follow
            </div>
          </div>

          {/* DEEP DIVE PAGES (L2 -> L3 -> L4) */}
          {results.perspectives.map((perspective, pIdx) => (
            <div key={pIdx} className="mind-map-page bg-white border-2 border-slate-200 rounded-2xl shadow-sm min-h-[800px] flex flex-col relative overflow-visible"
                 style={{ 
                   minWidth: '1200px', 
                   padding: `${SPACING.padding}px`,
                   width: orientation === 'vertical' ? '1200px' : 'auto'
                 }}>
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {connections[`page${pIdx + 2}`]?.map((conn, idx) => (
                  <CurvedArrow key={idx} start={conn.start} end={conn.end} orientation={orientation} />
                ))}
              </svg>

              <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-16 z-10">
                <div className="space-y-1">
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-black uppercase tracking-widest px-3 mb-2">
                    Analysis Page {pIdx + 2}
                  </Badge>
                  <h3 className="text-3xl font-headline font-bold text-slate-900">{perspective.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest mb-1">Root Factors & Action Plan</span>
                  <p className="text-sm font-bold text-primary max-w-xs line-clamp-1">{results.centralProblem}</p>
                </div>
              </div>

              <div className={cn(
                "flex grow items-center justify-center",
                orientation === 'vertical' ? "flex-col gap-[100px]" : "flex-row gap-[120px]"
              )}>
                {/* Level 2 Context */}
                <div className="flex flex-col items-center">
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
                      <Node 
                        ref={(el) => {
                          if (!l3Refs.current[pIdx]) l3Refs.current[pIdx] = [];
                          l3Refs.current[pIdx][cIdx] = el;
                        }}
                        title={cause.name} 
                        type="L3"
                      >
                        <div className="mt-2 opacity-30">
                          <Database className="h-3 w-3 mx-auto" />
                        </div>
                      </Node>

                      {/* L4: Actions */}
                      <div className="flex flex-col gap-3">
                        {cause.actions.map((action, aIdx) => (
                          <Node 
                            key={aIdx} 
                            ref={(el) => {
                              if (!l4Refs.current[pIdx]) l4Refs.current[pIdx] = [];
                              if (!l4Refs.current[pIdx][cIdx]) l4Refs.current[pIdx][cIdx] = [];
                              l4Refs.current[pIdx][cIdx][aIdx] = el;
                            }}
                            title={action} 
                            type="L4" 
                          />
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
          <h3 className="text-xl font-headline font-bold">Strategic Diagnosis Ready</h3>
          <p className="text-sm">Input a problem statement to generate a multi-page MECE analysis.</p>
        </div>
      )}
    </div>
  );
}
