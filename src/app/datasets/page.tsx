"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Database, 
  Plus, 
  Trash2, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  Info,
  FileSpreadsheet
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { aiDataProfiling, type AIDataProfilingOutput } from "@/ai/flows/ai-data-profiling-flow"
import { useToast } from "@/hooks/use-toast"

export default function DatasetsPage() {
  const { toast } = useToast()
  const [isProfiling, setIsProfiling] = useState(false)
  const [columns, setColumns] = useState([
    { name: "Order_Date", sampleValues: ["2023-01-01", "2023-02-15", "2023-03-10"] },
    { name: "Region", sampleValues: ["North", "South", "East", "West"] },
    { name: "Sales_Amount", sampleValues: ["1200.50", "450.00", "3100.25"] },
    { name: "Product_ID", sampleValues: ["P-1001", "P-1002", "P-1003"] },
  ])
  const [profiledResults, setProfiledResults] = useState<AIDataProfilingOutput | null>(null)

  const addColumn = () => {
    setColumns([...columns, { name: "", sampleValues: [] }])
  }

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  const updateColumn = (index: number, field: "name" | "sampleValues", value: any) => {
    const updated = [...columns]
    if (field === "sampleValues") {
      updated[index][field] = value.split(",").map((v: string) => v.trim())
    } else {
      updated[index][field] = value
    }
    setColumns(updated)
  }

  const handleProfileData = async () => {
    if (columns.some(col => !col.name)) {
      toast({
        title: "Validation Error",
        description: "Please ensure all columns have a name.",
        variant: "destructive"
      })
      return
    }

    setIsProfiling(true)
    try {
      const result = await aiDataProfiling({ datasetColumns: columns })
      setProfiledResults(result)
      toast({
        title: "Success",
        description: "Dataset profiling complete."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to profile dataset.",
        variant: "destructive"
      })
    } finally {
      setIsProfiling(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold">Dataset Ingestion & Profiling</h2>
            <p className="text-muted-foreground">Define your data schema or upload a file to let AI identify variable types.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Upload CSV
            </Button>
            <Button onClick={handleProfileData} disabled={isProfiling} className="gap-2 bg-primary">
              {isProfiling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isProfiling ? "Profiling..." : "Profile with AI"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Column Schema</CardTitle>
                <CardDescription>Enter column names and sample values for AI analysis.</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={addColumn} className="h-8 gap-1 text-primary">
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column Name</TableHead>
                    <TableHead>Sample Values (comma separated)</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map((col, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input 
                          value={col.name} 
                          placeholder="e.g., revenue" 
                          onChange={(e) => updateColumn(index, "name", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={col.sampleValues.join(", ")} 
                          placeholder="e.g., 100.5, 200, 150" 
                          onChange={(e) => updateColumn(index, "sampleValues", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeColumn(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">AI Profile Results</CardTitle>
              <CardDescription>Detected data types and analysis reasoning.</CardDescription>
            </CardHeader>
            <CardContent>
              {profiledResults ? (
                <div className="space-y-4">
                  {profiledResults.profiledColumns.map((col, i) => (
                    <div key={i} className="rounded-lg border p-3 bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{col.name}</span>
                        <Badge variant="secondary" className="capitalize bg-accent/20 text-accent-foreground border-accent/20">
                          {col.type}
                        </Badge>
                      </div>
                      {col.reasoning && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 shrink-0" />
                          {col.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Dataset profiling successful. Ready for visualization.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Database className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm">No analysis performed yet.</p>
                  <p className="text-xs">Click "Profile with AI" to analyze your schema.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}