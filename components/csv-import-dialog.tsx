"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CSVImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (holdings: any[]) => void
}

export function CSVImportDialog({ open, onOpenChange, onImport }: CSVImportDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processCSV = async (file: File) => {
    setIsProcessing(true)
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

      const holdings = lines.slice(1).map((line) => {
        const values = line.split(",")
        const holding: any = {}
        headers.forEach((header, index) => {
          holding[header] = values[index]?.trim()
        })
        return holding
      })

      onImport(holdings)
      toast({
        title: "Import successful",
        description: `Imported ${holdings.length} holdings from CSV`,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type === "text/csv") {
        processCSV(file)
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a CSV file",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processCSV(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Portfolio from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: symbol, amount, purchase_price, purchase_date
          </DialogDescription>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10 scale-105"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto">
                <FileSpreadsheet className="h-12 w-12 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Processing CSV...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-fit p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Drag and drop your CSV file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </div>
              <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" id="csv-upload" />
              <Button asChild variant="outline" size="sm">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <span>CSV format: symbol,amount,purchase_price,purchase_date</span>
          </p>
          <p className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <span>Example: BTC,0.5,45000,2024-01-15</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
