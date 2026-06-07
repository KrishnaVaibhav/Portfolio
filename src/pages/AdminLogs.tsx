import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ShieldCheck, Eye, Battery, Wifi, Cpu, MapPin, Smartphone, List, Monitor, Trash2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminLogs = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "device" | "fingerprint">("list");

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const isAuth = sessionStorage.getItem("admin_auth");
        if (isAuth === "true") {
            setIsAuthenticated(true);
            fetchLogs();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
        if (!envPassword) { toast.error("Admin password not configured."); return; }
        if (password === envPassword) {
            setIsAuthenticated(true);
            sessionStorage.setItem("admin_auth", "true");
            fetchLogs();
            toast.success("Welcome, Admin.");
        } else {
            toast.error("Invalid credentials.");
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        // Fetch more logs for "fullest" view
        const { data, error } = await supabase
            .from("user_visits")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1000);

        if (error) toast.error("Failed to fetch logs: " + error.message);
        else setLogs(data || []);

        setLoading(false);
        setSelectedIds(new Set()); // Reset selection
    };

    const filteredLogs = logs.filter((log) =>
        JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
    );

    // Grouping Logic
    const groupedLogs = (viewMode === "device" || viewMode === "fingerprint") ? Object.values(filteredLogs.reduce((acc: any, log) => {
        // Grouping Key Selection
        let key = log.meta?.visitor_id || 'unknown';

        if (viewMode === "fingerprint") {
            const fp = log.meta?.fingerprints;
            if (fp?.canvas && fp?.audio) {
                key = `${fp.canvas.slice(0, 16)}_${fp.audio.slice(0, 8)}`; // Shortened Hash Key
            } else {
                return acc; // Skip logs without fingerprints in this view
            }
        }

        if (!acc[key]) {
            acc[key] = {
                ...log,
                group_key: key,
                visit_count: 0,
                last_seen: log.created_at,
                first_seen: log.created_at,
                latest_log: log,
                paths: new Set(),
                visitor_ids: new Set() // Track distinct identities
            };
        }

        acc[key].visit_count++;
        acc[key].visitor_ids.add(log.meta?.visitor_id || 'unknown');

        if (new Date(log.created_at) > new Date(acc[key].last_seen)) {
            acc[key].last_seen = log.created_at;
            acc[key].latest_log = log;
        }
        acc[key].paths.add(log.page_path);

        return acc;
    }, {})) : [];

    // Delete Handlers
    const deleteLogs = async (ids: string[]) => {
        setIsDeleting(true);
        const { error } = await supabase.from('user_visits').delete().in('id', ids);
        if (error) {
            toast.error("Delete failed: " + error.message);
        } else {
            toast.success(`Deleted ${ids.length} logs.`);
            setLogs(logs.filter(l => !ids.includes(l.id)));
            setSelectedIds(new Set());
        }
        setIsDeleting(false);
    };

    const clearAllLogs = async () => {
        setIsDeleting(true);
        const ids = logs.map(l => l.id);
        const { error } = await supabase.from('user_visits').delete().in('id', ids);
        if (error) toast.error("Clear failed: " + error.message);
        else {
            toast.success("All logs cleared.");
            setLogs([]);
        }
        setIsDeleting(false);
    };

    // Selection Handlers
    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredLogs.map(l => l.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-sm shadow-xl border-slate-200 dark:border-slate-800">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Admin Access</CardTitle>
                        <CardDescription>Enter your secure password to view logs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Button type="submit" className="w-full">Verify Identity</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header / Toolbar */}
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4 flex flex-col gap-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg"><Monitor className="h-5 w-5 text-primary" /></div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Analytics Dashboard</h1>
                            <p className="text-xs text-muted-foreground">{logs.length} Total Records</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative w-64 hidden md:block">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search IP, Path, User Agent..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 bg-muted" />
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchLogs} title="Refresh Data">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="outline" className="text-destructive hover:text-destructive border-red-200 hover:bg-red-50" onClick={() => {
                            sessionStorage.removeItem("admin_auth");
                            window.location.reload();
                        }}>
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex bg-muted p-1 rounded-lg">
                        <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className={viewMode === 'list' ? 'bg-background shadow-sm' : ''}>
                            <List className="h-4 w-4 mr-2" /> All Logs
                        </Button>
                        <Button variant={viewMode === "device" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("device")} className={viewMode === 'device' ? 'bg-background shadow-sm' : ''}>
                            <Smartphone className="h-4 w-4 mr-2" /> Visitors
                        </Button>
                        <Button variant={viewMode === "fingerprint" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("fingerprint")} className={viewMode === 'fingerprint' ? 'bg-background shadow-sm' : ''}>
                            <ShieldCheck className="h-4 w-4 mr-2" /> Hardware (Fingerprint)
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1 rounded-md text-sm border border-destructive/20 animate-in fade-in slide-in-from-right-4">
                                <span className="font-semibold">{selectedIds.size} Selected</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive" className="h-7 text-xs">Delete Selected</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete {selectedIds.size} logs?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. These records will be permanently removed.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteLogs(Array.from(selectedIds))} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedIds(new Set())}><X className="h-4 w-4" /></Button>
                            </div>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20">
                                    <Trash2 className="h-4 w-4 mr-2" /> Clear All History
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-destructive">⚠ Clear Entire Database?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You are about to delete <b>{logs.length} records</b>. This enables a fresh start but all historical analytics will be lost forever.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={clearAllLogs} className="bg-destructive hover:bg-destructive/90">Yes, Wipe Everything</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
                <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
                    <CardContent className="p-0 flex-1">
                        {loading && logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                                <p>Loading Analytics...</p>
                            </div>
                        ) : (
                            <Card className="rounded-xl border text-card-foreground shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            {viewMode === 'list' && (
                                                <TableHead className="w-[40px]">
                                                    <Checkbox
                                                        checked={selectedIds.size === filteredLogs.length && filteredLogs.length > 0}
                                                        onCheckedChange={toggleSelectAll}
                                                    />
                                                </TableHead>
                                            )}
                                            <TableHead>{viewMode === 'list' ? 'Time' : 'Last Seen'}</TableHead>
                                            <TableHead>Location</TableHead>
                                            {(viewMode === 'device' || viewMode === 'fingerprint') && <TableHead>Visits</TableHead>}
                                            {viewMode === 'list' && <TableHead>Path</TableHead>}

                                            <TableHead>Device</TableHead>
                                            {(viewMode === 'device' || viewMode === 'list') && <TableHead>Ref / VID</TableHead>}
                                            {viewMode === 'fingerprint' && <TableHead>Linked Identities</TableHead>}

                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {viewMode === "list" ? filteredLogs.map((log) => (
                                            <TableRow key={log.id} className="group hover:bg-muted/50 transition-colors">
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.has(log.id)}
                                                        onCheckedChange={() => toggleSelect(log.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap font-medium text-xs text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        {log.country === 'United States' ? '🇺🇸' : '🌍'}
                                                        <span className="font-medium text-sm">{log.city || 'Unknown'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate text-xs font-mono text-primary">
                                                    {log.page_path}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{log.device_type}</span>
                                                        <span className="text-muted-foreground scale-90 origin-left">{log.screen_resolution}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">
                                                    {log.meta?.visitor_id?.substring(0, 8)}...
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {log.meta?.interaction?.time_on_page_ms > 0 && (
                                                            <div className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">
                                                                {(log.meta.interaction.time_on_page_ms / 1000).toFixed(0)}s
                                                            </div>
                                                        )}
                                                        {log.meta?.fingerprints?.audio && (
                                                            <div className="px-1.5 py-0.5 bg-purple-500/10 text-purple-500 rounded text-[10px] font-bold" title="Fingerprinted">FP</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {/* Keep standard sheet trigger */}
                                                    <Sheet>
                                                        <SheetTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </SheetTrigger>
                                                        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
                                                            <SheetHeader>
                                                                <SheetTitle className="flex items-center gap-2">
                                                                    Visitor Details
                                                                    <span className="text-xs font-normal text-muted-foreground font-mono">{log.id.substring(0, 8)}</span>
                                                                </SheetTitle>
                                                            </SheetHeader>

                                                            <div className="mt-6 space-y-6 pb-20">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-muted/50 p-4 rounded-xl border">
                                                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-2">Location</div>
                                                                        <div className="text-lg font-semibold">{log.city}, {log.country}</div>
                                                                        <div className="text-xs text-muted-foreground">{log.region}, {log.isp}</div>
                                                                    </div>
                                                                    <div className="bg-muted/50 p-4 rounded-xl border">
                                                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-2">Device</div>
                                                                        <div className="text-lg font-semibold capitalize">{log.device_type}</div>
                                                                        <div className="text-xs text-muted-foreground">{log.meta?.platform} • {log.screen_resolution}</div>
                                                                    </div>
                                                                </div>

                                                                {log.meta?.interaction && (
                                                                    <div className="space-y-2">
                                                                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><Monitor className="h-4 w-4" /> Engagement</h3>
                                                                <div className="grid grid-cols-3 gap-2 text-sm border p-3 rounded-lg bg-card">
                                                                            <div className="flex flex-col items-center justify-center p-2 text-center">
                                                                                <span className="text-xs text-muted-foreground mb-1">Time</span>
                                                                                <span className="font-bold text-lg text-primary">{(log.meta.interaction.time_on_page_ms / 1000).toFixed(1)}s</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-center justify-center p-2 text-center border-l border-r">
                                                                                <span className="text-xs text-muted-foreground mb-1">Scroll</span>
                                                                                <span className="font-bold text-lg text-primary">{log.meta.interaction.scroll_depth_percent}%</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-center justify-center p-2 text-center">
                                                                                <span className="text-xs text-muted-foreground mb-1">Clicks</span>
                                                                                <span className="font-bold text-lg text-primary">{log.meta.interaction.click_count}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-4 pt-4 border-t">
                                                                    <div>
                                                                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">Technical Telemetry</h3>
                                                                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                                                            <div>
                                                                                <span className="text-muted-foreground block text-xs">IP Address</span>
                                                                                <span className="font-mono">{log.ip_address}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-muted-foreground block text-xs">User Agent</span>
                                                                                <span className="truncate block" title={log.user_agent}>{log.user_agent.substring(0, 20)}...</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-muted-foreground block text-xs">Performance (Load)</span>
                                                                                <span>{log.meta?.performance?.loadTime ? Math.round(log.meta.performance.loadTime) + 'ms' : 'N/A'}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-muted-foreground block text-xs">Est. Connection</span>
                                                                                <span>{log.meta?.connection_details?.downlink} Mbps</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {log.meta?.fingerprints && (
                                                                        <div className="p-3 bg-muted rounded text-xs font-mono break-all">
                                                                            <div className="opacity-50 mb-1">Canvas Hash</div>
                                                                            {log.meta.fingerprints.canvas.substring(0, 50)}...
                                                                            <div className="opacity-50 mt-2 mb-1">Audio Hash</div>
                                                                            {log.meta.fingerprints.audio.substring(0, 50)}...
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* RAW DATA RESTORED */}
                                                                <div className="pt-4 border-t">
                                                                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Raw Data</h3>
                                                                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-60 font-mono">
                                                                        {JSON.stringify(log.meta, null, 2)}
                                                                    </pre>
                                                                </div>

                                                            </div>
                                                        </SheetContent>
                                                    </Sheet>
                                                </TableCell>
                                            </TableRow>
                                        )) : (groupedLogs as any[]).map((group: any) => (
                                            <TableRow key={group.group_key} className="group hover:bg-muted/50">
                                                <TableCell>{new Date(group.last_seen).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div>{group.city}, {group.country}</div>
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-lg">{group.visit_count}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span className="font-semibold">{group.device_type}</span>
                                                        <span className="text-muted-foreground">{group.meta?.platform}</span>
                                                    </div>
                                                </TableCell>

                                                {viewMode === 'fingerprint' ? (
                                                    <TableCell className="text-xs">
                                                        <div className="flex flex-col gap-1">
                                                            {group.visitor_ids.size > 1 ? (
                                                                <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded w-fit" title={Array.from(group.visitor_ids).join('\n')}>
                                                                    <ShieldCheck className="h-3 w-3" />
                                                                    {group.visitor_ids.size} Linked IDs
                                                                </div>
                                                            ) : (
                                                                <span className="font-mono text-muted-foreground">Unique Visitor</span>
                                                            )}
                                                            <span className="text-[10px] text-muted-foreground font-mono" title="Canvas + Audio Hash Match">
                                                                {group.group_key.substring(0, 16)}...
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                ) : (
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{group.meta?.visitor_id?.substring(0, 8)}...</TableCell>
                                                )}

                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                            {group.paths.size} Pages
                                                        </span>
                                                        <Sheet>
                                                            <SheetTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </SheetTrigger>
                                                            <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
                                                                <SheetHeader>
                                                                    <SheetTitle className="flex items-center gap-2">
                                                                        Group Details
                                                                        <span className="text-xs font-normal text-muted-foreground font-mono">{group.group_key.substring(0, 8)}</span>
                                                                    </SheetTitle>
                                                                </SheetHeader>
                                                                <div className="mt-6 space-y-6 pb-20">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-muted/50 p-4 rounded-xl border">
                                                                            <div className="text-xs text-muted-foreground uppercase font-bold mb-2">Location</div>
                                                                            <div className="text-lg font-semibold">{group.city}, {group.country}</div>
                                                                            <div className="text-xs text-muted-foreground">{group.region}, {group.isp}</div>
                                                                        </div>
                                                                        <div className="bg-muted/50 p-4 rounded-xl border">
                                                                            <div className="text-xs text-muted-foreground uppercase font-bold mb-2">Device</div>
                                                                            <div className="text-lg font-semibold capitalize">{group.device_type}</div>
                                                                            <div className="text-xs text-muted-foreground">{group.meta?.platform} • {group.screen_resolution}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><List className="h-4 w-4" /> Visited Pages ({group.paths.size})</h3>
                                                                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                                            {Array.from(group.paths).map((path: string) => (
                                                                                <li key={path} className="truncate">{path}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>

                                                                    {viewMode === 'fingerprint' && group.visitor_ids.size > 0 && (
                                                                        <div className="space-y-2">
                                                                            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Linked Visitor IDs ({group.visitor_ids.size})</h3>
                                                                            <ul className="list-disc list-inside text-sm text-muted-foreground font-mono">
                                                                                {Array.from(group.visitor_ids).map((id: string) => (
                                                                                    <li key={id} className="truncate">{id.substring(0, 8)}...</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}

                                                                    <div className="pt-4 border-t">
                                                                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Latest Log Data (Sample)</h3>
                                                                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-60 font-mono">
                                                                            {JSON.stringify(group.latest_log?.meta, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            </SheetContent>
                                                        </Sheet>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogs;
