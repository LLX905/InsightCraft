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
  ChevronRight,
  ChevronDown,
  Layout,
  Search,
  Database,
  CheckCircle2,
  AlertCircle
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
        isVertical ? "w-1 h-full" : "h-1 w-full"
      )}>
        <div className="absolute bg-primary p-1.5 rounded-full border-2 border-white text-white shadow-md z-20 scale-125">
          {isVertical ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="grid gap-6 lg:grid-cols-3 no-print">
        <Card className="lg:col-span-2 border-t-4 border-t-primary shadow-lg">
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
              <Button onClick={handleGenerate} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2 px-8 h-12">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Analyze Deeply"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("transition-all shadow-lg", results ? "opacity-100" : "opacity-50 pointer-events-none")}>
          <CardHeader>
            <CardTitle className="text-xs font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start gap-2 h-12 text-sm font-semibold" onClick={exportAsPNG} disabled={!results}>
              <ImageIcon className="h-4 w-4 text-primary" /> Download High-Res PNG
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-12 text-sm font-semibold" onClick={exportAsSVG} disabled={!results}>
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
              <div className="mindmap-node bg-primary text-white p-10 rounded-2xl shadow-2xl border-4 border-white w-96 text-center z-10 ring-8 ring-primary/10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-3 block">Level 1: Central Problem</span>
                <h2 className="text-2xl font-headline font-bold leading-tight">{results.centralProblem}</h2>
              </div>
            </div>

            {/* Branching from Level 1 to Level 2 */}
            <div className={cn("flex", layout === 'vertical' ? "flex-row gap-60 pt-12" : "flex-col gap-60 pl-12")}>
              {results.perspectives.map((perspective, pIdx) => (
                <div key={pIdx} className={cn("flex items-center shrink-0", layout === 'vertical' ? "flex-col" : "flex-row")}>
                  {/* Stage Connector (Level 1 -> 2) */}
                  <Connector isVertical={layout === 'vertical'} />

                  {/* STAGE 2: Perspective */}
                  <div className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                    <div className="mindmap-node bg-slate-100 border-4 border-slate-300 p-8 rounded-xl shadow-xl w-72 text-center z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Level 2: Perspective</span>
                      <h3 className="font-headline font-bold text-xl text-slate-800">{perspective.perspectiveName}</h3>
                    </div>
                  </div>

                  {/* Branching from Level 2 to Level 3 */}
                  <div className={cn("flex", layout === 'vertical' ? "flex-row gap-48 pt-12" : "flex-col gap-48 pl-12")}>
                    {perspective.subCauses.map((sc, scIdx) => (
                      <div key={scIdx} className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                        {/* Stage Connector (Level 2 -> 3) */}
                        <Connector isVertical={layout === 'vertical'} />
                        
                        {/* STAGE 3: Investigation (Level 3) */}
                        <div className={cn("flex items-center", layout === 'vertical' ? "flex-col" : "flex-row")}>
                          <Card className="mindmap-node border-l-[12px] border-l-orange-500 shadow-2xl w-80 bg-white z-10 shrink-0 ring-4 ring-orange-500/5">
                            <CardHeader className="p-6">
                              <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest block mb-2 flex items-center gap-2">
                                <Search className="h-4 w-4" /> Level 3: Investigation
                              </span>
                              <CardTitle className="text-lg font-bold leading-snug text-slate-900">{sc.causeName}</CardTitle>
                            </CardHeader>
                          </Card>

                          {/* Stage Connector (Level 3 -> 4) */}
                          <Connector isVertical={layout === 'vertical'} />

                          {/* STAGE 4: Root Factors (Level 4) */}
                          <Card className="mindmap-node border-l-[12px] border-l-amber-500 shadow-2xl w-80 bg-amber-50/30 z-10 shrink-0 ring-4 ring-amber-500/5">
                            <CardHeader className="p-6">
                              <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest block mb-3 flex items-center gap-2">
                                <Database className="h-4 w-4" /> Level 4: Root Factors
                              </span>
                              <ul className="space-y-3">
                                {sc.rootCauses.map((rc, rcIdx) => (
                                  <li key={rcIdx} className="text-xs font-medium text-slate-700 flex gap-3 leading-relaxed bg-white/90 p-3 rounded-lg border border-amber-200 shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    {rc}
                                  </li>
                                ))}
                              </ul>
                            </CardHeader>
                          </Card>

                          {/* Stage Connector (Level 4 -> 5) */}
                          <Connector isVertical={layout === 'vertical'} />

                          {/* STAGE 5: Strategic Solution (Level 5) */}
                          <Card className="mindmap-node border-l-[12px] border-l-emerald-600 shadow-2xl w-80 bg-emerald-50/20 z-10 shrink-0 ring-4 ring-emerald-600/5">
                            <CardHeader className="p-6">
                              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.2em] flex items-center gap-2 mb-3">
                                <CheckCircle2 className="h-4 w-4" /> Level 5: Strategy
                              </span>
                              <div className="space-y-3">
                                {sc.solutions.map((sol, sIdx) => (
                                  <div key={sIdx} className="p-4 rounded-xl bg-white text-emerald-900 text-sm font-bold border border-emerald-200 flex gap-3 shadow-md hover:bg-emerald-50 transition-colors">
                                    <ChevronRight className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                                    {sol}
                                  </div>
                                ))}
                              </div>
                            </CardHeader>
                          </Card>
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
        <div className="flex flex-col items-center justify-center py-40 text-center text-muted-foreground opacity-30">
          <Layout className="h-24 w-24 mb-6" />
          <h3 className="text-3xl font-headline font-bold">Analytical Canvas</h3>
          <p className="max-w-md mx-auto text-lg">Define your problem above to branch out into perspectives, root causes, and strategic solutions.</p>
        </div>
      )}
    </div>
  );
}
