'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, GitGraph, Sparkles } from 'lucide-react';
import VisualizationsPage from '@/app/visualizations/page';
import MindMapsPage from '@/app/mind-maps/page';

export default function AppHome() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card py-4 px-6 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-primary">InsightCraft AI</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Analytical Assistant</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 print:p-0 print:max-w-none print:m-0">
        <Tabs defaultValue="viz" className="w-full space-y-8">
          <div className="flex justify-center no-print">
            <TabsList className="grid w-full max-w-2xl grid-cols-2 h-14 p-1">
              <TabsTrigger value="viz" className="gap-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-5 w-5" />
                Visualization Engine
              </TabsTrigger>
              <TabsTrigger value="mind" className="gap-2 text-base data-[state=active]:bg-chart-3 data-[state=active]:text-white">
                <GitGraph className="h-5 w-5" />
                Mind Map Engine
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

      <footer className="border-t py-6 mt-12 bg-muted/30 no-print">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          InsightCraft AI — Simple, Stable, Analytical.
        </div>
      </footer>
    </div>
  );
}
