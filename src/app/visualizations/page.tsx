"use client"

import * as React from "react"
import { useState } from "react"
import { 
  BarChart3, 
  Sparkles, 
  Loader2, 
  Lightbulb,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  LayoutGrid,
  Info
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { aiVisualizationRecommendation, type AIVisualizationRecommendationOutput } from "@/ai/flows/ai-visualization-recommendation"
import { useToast } from "@/hooks/use-toast"

const dummyData = [
  { name: 'Jan', value: 400, other: 240 },
  { name: 'Feb', value: 300, other: 139 },
  { name: 'Mar', value: 200, other: 980 },
  { name: 'Apr', value: 278, other: 390 },
  { name: 'May', value: 189, other: 480 },
  { name: 'Jun', value: 239, other: 380 },
];

const COLORS = ['#3880E0', '#4FC7DB', '#10B981', '#F59E0B', '#EF4444'];

export default function VisualizationsPage() {
  const { toast } = useToast()
  const [isRecommending, setIsRecommending] = useState(false)
  const [goal, setGoal] = useState("Compare monthly sales revenue vs targets")
  const [characteristics, setCharacteristics] = useState("Variables: Month (time series), Revenue (numerical), Targets (numerical)")
  const [recommendation, setRecommendation] = useState<AIVisualizationRecommendationOutput | null>(null)
  const [selectedViz, setSelectedViz] = useState<string | null>(null)

  const handleGetRecommendations = async () => {
    setIsRecommending(true)
    try {
      const result = await aiVisualizationRecommendation({
        datasetCharacteristics: characteristics,
        userGoal: goal
      })
      setRecommendation(result)
      if (result.recommendedVisualizations.length > 0) {
        setSelectedViz(result.recommendedVisualizations[0])
      }
      toast({
        title: "Analysis Complete",
        description: "AI has generated visualization recommendations."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get recommendations.",
        variant: "destructive"
      })
    } finally {
      setIsRecommending(false)
    }
  }

  const renderChart = () => {
    if (!selectedViz) return null;

    const lowerViz = selectedViz.toLowerCase();

    if (lowerViz.includes('bar')) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Actual" />
            <Bar dataKey="other" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Target" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (lowerViz.includes('line')) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Trend A" />
            <Line type="monotone" dataKey="other" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 6 }} name="Trend B" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (lowerViz.includes('pie')) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={dummyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {dummyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Visualization Type "{selectedViz}" is supported but no preview is available for this mockup.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-headline font-bold">AI Visualization Engine</h2>
          <p className="text-muted-foreground">Tell InsightCraft AI about your data and what you want to achieve.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Intent & Context
                </CardTitle>
                <CardDescription>Define your goals for the visualization.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">What is your goal?</Label>
                  <Textarea 
                    id="goal" 
                    value={goal} 
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Identify correlation between ad spend and conversions..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chars">Dataset Characteristics</Label>
                  <Textarea 
                    id="chars" 
                    value={characteristics} 
                    onChange={(e) => setCharacteristics(e.target.value)}
                    placeholder="e.g., 5 columns, mostly categorical with one high-cardinality numerical..."
                  />
                </div>
                <Button 
                  onClick={handleGetRecommendations} 
                  disabled={isRecommending} 
                  className="w-full bg-primary"
                >
                  {isRecommending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Get AI Recommendations
                </Button>
              </CardContent>
            </Card>

            {recommendation && (
              <Card className="border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-sm font-headline uppercase tracking-wider text-accent-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    AI Explains
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{recommendation.explanation}</p>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Configuration Guidance</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-accent pl-3">
                      {recommendation.configurationGuidance}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="min-h-[600px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle className="font-headline">Visualization Canvas</CardTitle>
                  <CardDescription>AI-suggested interactive charts for your data.</CardDescription>
                </div>
                {recommendation && (
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {recommendation.recommendedVisualizations.map((viz) => (
                      <Button
                        key={viz}
                        variant={selectedViz === viz ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedViz(viz)}
                        className="whitespace-nowrap"
                      >
                        {viz}
                      </Button>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-6">
                {selectedViz ? (
                  <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">{selectedViz}</Badge>
                        <span className="text-xs text-muted-foreground">Previewing with simulated data</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8">
                          <LayoutGrid className="h-4 w-4 mr-1" />
                          View Data
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Info className="h-4 w-4 mr-1" />
                          Config
                        </Button>
                      </div>
                    </div>
                    {renderChart()}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
                    <div className="p-6 rounded-full bg-muted">
                      <BarChart3 className="h-12 w-12 opacity-50" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">Awaiting Input</h3>
                      <p className="max-w-xs mx-auto">Fill in your data characteristics and goal on the left to get visualization suggestions.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}