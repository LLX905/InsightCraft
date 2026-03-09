"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  BarChart3, 
  Database, 
  GitGraph, 
  Zap, 
  Sparkles,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react"

import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function OverviewPage() {
  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-headline font-bold tracking-tight">Welcome back, analyst</h2>
          <p className="text-muted-foreground max-w-2xl">
            InsightCraft AI is ready to help you profile your data, visualize insights, and solve complex problems with AI-powered mind mapping.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Datasets Uploaded</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 since yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizations</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">+8 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mind Maps Created</CardTitle>
              <GitGraph className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">3 pending analysis</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Insights Token</CardTitle>
              <Zap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84%</div>
              <Progress value={84} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
              <CardDescription>Start a new analysis workflow with one click.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Link href="/datasets">
                <Button variant="outline" className="h-32 w-full flex-col gap-2 hover:border-primary hover:bg-primary/5">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Ingest New Dataset</span>
                  <span className="text-xs text-muted-foreground">Upload CSV or XLSX</span>
                </Button>
              </Link>
              <Link href="/mind-maps">
                <Button variant="outline" className="h-32 w-full flex-col gap-2 hover:border-chart-3 hover:bg-chart-3/5">
                  <GitGraph className="h-8 w-8 text-chart-3" />
                  <span className="font-semibold">Solve a Problem</span>
                  <span className="text-xs text-muted-foreground">Generate deep mind map</span>
                </Button>
              </Link>
              <Link href="/visualizations">
                <Button variant="outline" className="h-32 w-full flex-col gap-2 hover:border-accent hover:bg-accent/5">
                  <Sparkles className="h-8 w-8 text-accent" />
                  <span className="font-semibold">AI Viz Recommender</span>
                  <span className="text-xs text-muted-foreground">Get chart suggestions</span>
                </Button>
              </Link>
              <Button variant="outline" className="h-32 w-full flex-col gap-2 cursor-not-allowed opacity-50">
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Predictive Analysis</span>
                  <span className="text-xs text-muted-foreground">Coming soon</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Recent Activity</CardTitle>
              <CardDescription>Track your analytical progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  { title: "Quarterly Sales.csv", action: "Profiled dataset", time: "2h ago", icon: Database, color: "text-primary" },
                  { title: "Supply Chain Bottlenecks", action: "Generated mind map", time: "5h ago", icon: GitGraph, color: "text-chart-3" },
                  { title: "Marketing Spend vs ROAS", action: "Created visualization", time: "1d ago", icon: BarChart3, color: "text-accent" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={cn("rounded-full p-2 bg-muted", item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="mt-6 w-full text-primary hover:text-primary/80 group">
                View all activity <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}