"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, TrendingUp, FileSpreadsheet, RefreshCw, Zap, Keyboard } from "lucide-react"
import { CSVImportDialog } from "./csv-import-dialog"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"

interface QuickActionsFABProps {
  onAddHolding?: () => void
  onAnalyze?: () => void
  onImportCSV?: (holdings: any[]) => void
  onRefreshPrices?: () => void
}

export function QuickActionsFAB({ onAddHolding, onAnalyze, onImportCSV, onRefreshPrices }: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCSVDialog, setShowCSVDialog] = useState(false)
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all animate-bounce-subtle hover-lift"
            >
              <Zap className={`h-6 w-6 transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-effect">
            <DropdownMenuItem onClick={onAddHolding} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Holding</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+N</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAnalyze} className="cursor-pointer">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Analyze Portfolio</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+A</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowCSVDialog(true)} className="cursor-pointer">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>Import CSV</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+I</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRefreshPrices} className="cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Refresh Prices</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+R</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowShortcutsDialog(true)} className="cursor-pointer">
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
              <span className="ml-auto text-xs text-muted-foreground">?</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CSVImportDialog
        open={showCSVDialog}
        onOpenChange={setShowCSVDialog}
        onImport={(holdings) => {
          onImportCSV?.(holdings)
          setShowCSVDialog(false)
        }}
      />

      <KeyboardShortcutsDialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog} />
    </>
  )
}
