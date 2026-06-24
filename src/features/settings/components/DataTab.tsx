"use client";

import { useState } from "react";
import { Upload, Trash2, Database, AlertTriangle, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

interface DataTabProps {
    onImport: () => void;
    onDeleteAccount: () => void;
}

export function DataTab({ onImport, onDeleteAccount }: DataTabProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async (format: "json" | "csv") => {
        setExporting(true);
        try {
            const res = await fetch(`/api/settings/export?format=${format}`);
            if (!res.ok) throw new Error(await res.text());

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `crm-export-${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`Data exported as ${format.toUpperCase()}`);
        } catch (err) {
            console.error(err);
            toast.error("Export failed. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" /> Data Management
                    </CardTitle>
                    <CardDescription>Export your data or import from other sources.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Export section */}
                    <div className="p-5 rounded-xl border bg-card/50 space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold uppercase tracking-tight">Export Data</h4>
                            <p className="text-xs text-muted-foreground">
                                Download all your contacts, deals, tasks, and notes. Choose a format below.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => handleExport("json")}
                                disabled={exporting}
                                className="h-9 gap-2"
                            >
                                <FileJson className="h-4 w-4" />
                                {exporting ? "Exporting…" : "Export JSON"}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleExport("csv")}
                                disabled={exporting}
                                className="h-9 gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {exporting ? "Exporting…" : "Export CSV (Deals)"}
                            </Button>
                        </div>
                    </div>

                    {/* Import section */}
                    <div className="flex items-center justify-between p-5 rounded-xl border bg-card/50">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold uppercase tracking-tight">Import from CSV</h4>
                            <p className="text-xs text-muted-foreground">Bulk upload contacts and deals from a spreadsheet.</p>
                        </div>
                        <Button variant="secondary" onClick={onImport} className="h-9 gap-2">
                            <Upload className="h-4 w-4" /> Import
                        </Button>
                    </div>
                </CardContent>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-destructive/10 bg-destructive/10">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" /> Danger Zone
                    </CardTitle>
                    <CardDescription className="text-destructive/80">Permanent and non-reversible actions.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between p-5 rounded-xl border border-destructive/20 bg-background/50">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold uppercase tracking-tight text-destructive">Delete Account</h4>
                            <p className="text-xs text-muted-foreground">This will permanently delete all your data and remove your account.</p>
                        </div>
                        <Button variant="destructive" onClick={onDeleteAccount} className="h-9 shadow-md">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Anyway
                        </Button>
                    </div>
                </CardContent>
            </div>
        </div>
    );
}
