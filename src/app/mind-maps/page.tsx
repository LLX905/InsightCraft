"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { 
  GitGraph, 
  Sparkles, 
  Loader2, 
  Download, 
  Maximize2, 
  ArrowRight,
  ArrowDown,
  ChevronRight,
  Target,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { generateMindMap, type MindMapOutput } from "@/ai/flows/ai-problem-solving-mind-map-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function MindMapsPage() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [problem, setProblem] = useState("Global supply chain disruptions in the semiconductor industry affecting consumer electronics prices and availability.")
  const [mindMap, setMindMap] = useState<MindMapOutput | null>(null)
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("horizontal")
  const mapRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!problem.trim()) return
    setIsGenerating(true)
    try {
      const result = await generateMindMap({ problemStatement: problem })
      setMindMap(result)
      toast({
        title: "Mind Map Generated",
        description: "Deep analytical structure completed."
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not create mind map analysis.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const exportMap = () => {
    // Basic implementation of printing to export as PDF
    window.print()
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between no-print">
          <div>
            <h2 className="text-2xl font-headline font-bold">Analytical Mind Map Generator</h2>
            <p className="text-muted-foreground">Solve complex problems with deep, multi-level structural analysis.</p>
          </div>
          {mindMap && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setLayoutMode(layoutMode === "horizontal" ? "vertical" : "horizontal")}>
                Layout: {layoutMode}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={exportMap}>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 no-print">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Problem Definition
              </CardTitle>
              <CardDescription>Enter the core issue you want to analyze deeply.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe your complex problem here..."
                className="min-h-[100px] text-lg"
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="w-full bg-primary py-6 text-lg"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                {isGenerating ? "Analyzing & Structuring..." : "Generate Deep Analysis"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {mindMap ? (
          <div ref={mapRef} className="flex flex-col items-center py-10 print:p-0">
            {/* Core Problem Node */}
            <div className="mindmap-node z-10 p-6 rounded-xl bg-primary text-primary-foreground border-4 border-primary shadow-xl w-full max-w-2xl text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">Core Problem</span>
              <h3 className="text-2xl font-headline font-bold">{mindMap.coreProblem}</h3>
            </div>

            <div className={cn(
              "flex w-full",
              layoutMode === "horizontal" ? "flex-col items-center gap-16" : "flex-row flex-wrap justify-center gap-12"
            )}>
              {mindMap.perspectives.map((perspective, pIdx) => (
                <div key={pIdx} className={cn(
                  "flex flex-col items-center w-full",
                  layoutMode === "horizontal" ? "border-t pt-8" : "max-w-md"
                )}>
                  {/* Perspective Node */}
                  <div className="mindmap-node p-4 rounded-lg bg-muted border-2 border-muted-foreground/20 shadow-md w-80 text-center mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground block mb-1">Perspective {pIdx + 1}</span>
                    <h4 className="font-headline font-semibold text-lg">{perspective.perspectiveName}</h4>
                  </div>

                  <div className={cn(
                    "flex flex-wrap justify-center gap-8 w-full",
                    layoutMode === "vertical" ? "flex-col items-center" : ""
                  )}>
                    {perspective.causes.map((cause, cIdx) => (
                      <div key={cIdx} className="flex flex-col gap-4 max-w-sm">
                        {/* Cause Node */}
                        <div className="mindmap-node p-4 rounded-lg bg-white border border-border shadow-sm">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase text-orange-600 block">Sub-cause</span>
                              <p className="font-semibold text-base leading-tight">{cause.causeName}</p>
                            </div>
                          </div>
                          
                          {/* Root Causes Section */}
                          <div className="space-y-2 mb-4 pl-4 border-l-2 border-orange-200">
                            {cause.rootCauses.map((rc, rcIdx) => (
                              <div key={rcIdx} className="flex gap-2 text-xs text-muted-foreground">
                                <Search className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{rc}</span>
                              </div>
                            ))}
                          </div>

                          {/* Solutions Section */}
                          <div className="space-y-3 mt-4 pt-4 border-t">
                            <span className="text-[10px] font-bold uppercase text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Potential Solutions
                            </span>
                            {cause.solutions.map((sol, sIdx) => (
                              <div key={sIdx} className="p-3 rounded-md bg-green-50 text-green-800 text-sm font-medium border border-green-100 shadow-sm flex gap-2">
                                <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                                {sol}
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
        ) : !isGenerating && (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground opacity-50">
            <GitGraph className="h-20 w-20 mb-6" />
            <h3 className="text-xl font-headline font-semibold">Ready for Analysis</h3>
            <p className="max-w-md mx-auto">Define a complex problem above to generate a multi-perspective analytical mind map.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}