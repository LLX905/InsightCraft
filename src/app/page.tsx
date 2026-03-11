'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  GitGraph, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  LayoutDashboard,
  BrainCircuit,
  CheckCircle2
} from 'lucide-react';
import VisualizationsPage from '@/app/visualizations/page';
import MindMapsPage from '@/app/mind-maps/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppHome() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'landing' | 'viz' | 'mind'>('landing');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // --- Welcome Landing View ---
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <div className="max-w-4xl w-full space-y-12">
          {/* Hero Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-headline font-bold text-xl text-primary tracking-tight">InsightCraft AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-slate-900 tracking-tight">
              Your AI Analytical Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose what you want to do today. InsightCraft AI provides structured strategic support for your most complex data and logic challenges.
            </p>
          </div>

          {/* Action Choice Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card 
              className="group cursor-pointer border-2 border-transparent hover:border-primary transition-all shadow-xl hover:shadow-2xl bg-card/50 backdrop-blur-sm"
              onClick={() => setView('viz')}
            >
              <CardHeader className="space-y-4 p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Visualization Advisor</CardTitle>
                  <CardDescription className="text-lg mt-2 leading-relaxed">
                    Find the best charts and dashboards for your dataset. AI-driven strategic mapping based on analytical intent.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex items-center text-primary font-bold gap-2">
                Open Engine <ArrowRight className="h-4 w-4" />
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer border-2 border-transparent hover:border-chart-3 transition-all shadow-xl hover:shadow-2xl bg-card/50 backdrop-blur-sm"
              onClick={() => setView('mind')}
            >
              <CardHeader className="space-y-4 p-8">
                <div className="bg-chart-3/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GitGraph className="h-8 w-8 text-chart-3" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold">Mind Map Problem Solver</CardTitle>
                  <CardDescription className="text-lg mt-2 leading-relaxed">
                    Break down complex problems with structured thinking. Generate MECE-compliant diagnostic frameworks.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex items-center text-chart-3 font-bold gap-2">
                Open Engine <ArrowRight className="h-4 w-4" />
              </CardContent>
            </Card>
          </div>

          {/* Features / Help Section */}
          <div className="border-t pt-12">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground text-center mb-8">What This Tool Does</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: LayoutDashboard, text: "Choose the best data visualizations" },
                { icon: Sparkles, text: "Design professional dashboards" },
                { icon: BrainCircuit, text: "Break down complex problems" },
                { icon: CheckCircle2, text: "Explore root causes and solutions" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-slate-600 leading-tight">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Application View (Tabs) ---
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card py-4 px-6 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-primary p-2 rounded-lg shadow-sm">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-slate-900 tracking-tight">InsightCraft AI</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Your AI Analytical Assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="text-muted-foreground hover:text-primary gap-2">
            Back to Home
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 print:p-0 print:max-w-none print:m-0">
        <Tabs defaultValue={view === 'landing' ? 'viz' : view} className="w-full space-y-8">
          <div className="flex justify-center no-print">
            <TabsList className="grid w-full max-w-4xl grid-cols-2 h-auto p-2 bg-muted/50 rounded-2xl overflow-hidden">
              <TabsTrigger 
                value="viz" 
                className="flex flex-col items-center justify-center gap-1 py-4 px-6 text-center transition-all data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl whitespace-normal"
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-base font-bold">Visualization Advisor</span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight max-w-[280px] text-center">
                  Get AI suggestions for the best charts and dashboards based on your dataset and analysis goal.
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="mind" 
                className="flex flex-col items-center justify-center gap-1 py-4 px-6 text-center transition-all data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl whitespace-normal"
              >
                <div className="flex items-center justify-center gap-2">
                  <GitGraph className="h-5 w-5" />
                  <span className="text-base font-bold">Mind Map Problem Solver</span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight max-w-[280px] text-center">
                  Generate structured mind maps to explore causes, perspectives, and possible solutions to a problem.
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="viz" className="mt-0 focus-visible:outline-none no-print">
            <VisualizationsPage />
          </TabsContent>

          <TabsContent value="mind" className="mt-0 focus-visible:outline-none">
            <MindMapsPage />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-12 mt-20 bg-muted/10 no-print">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">InsightCraft AI — Precision, Strategy, Insight.</p>
        </div>
      </footer>
    </div>
  );
}