import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Loader2, Search, ShieldCheck, Eye, Smartphone, List,
    Monitor, Trash2, RefreshCw, X, BarChart2, Globe, Cpu,
    Wifi, Clock, MousePointer, Fingerprint, Zap, Battery,
    MapPin, ArrowUpDown, Activity, Code2, HardDrive, MonitorSmartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const parseBrowser = (ua: string): string => {
    if (!ua) return 'Unknown';
    if (/Edg\//.test(ua))     return 'Edge';
    if (/OPR\//.test(ua))     return 'Opera';
    if (/Chrome\//.test(ua))  return 'Chrome';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Safari\//.test(ua))  return 'Safari';
    return 'Other';
};

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#06b6d4','#22c55e','#eab308'];

const fmtMs = (ms: number) => {
    if (!ms || ms <= 0) return '—';
    if (ms < 1000)   return `${ms}ms`;
    if (ms < 60000)  return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

const countryFlag = (country: string): string => {
    const flags: Record<string, string> = {
        'United States': '🇺🇸','United Kingdom': '🇬🇧','Canada': '🇨🇦',
        'Australia': '🇦🇺','Germany': '🇩🇪','France': '🇫🇷','India': '🇮🇳',
        'Japan': '🇯🇵','China': '🇨🇳','Brazil': '🇧🇷','Mexico': '🇲🇽',
        'Netherlands': '🇳🇱','Singapore': '🇸🇬','South Korea': '🇰🇷','Russia': '🇷🇺',
        'Sweden': '🇸🇪','Norway': '🇳🇴','Switzerland': '🇨🇭','Spain': '🇪🇸',
        'Italy': '🇮🇹','Portugal': '🇵🇹','Poland': '🇵🇱','Indonesia': '🇮🇩',
    };
    return flags[country] || '🌍';
};

// ─────────────────────────────────────────────────────────────────────────────
// Session Detail Modal
// ─────────────────────────────────────────────────────────────────────────────

const SectionLabel = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
);

const KV = ({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) => (
    value !== null && value !== undefined && value !== '' && value !== 'N/A' ? (
        <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground shrink-0">{label}</span>
            <span className={`text-xs font-medium text-right max-w-[55%] break-words ${mono ? 'font-mono' : ''}`}>{String(value)}</span>
        </div>
    ) : null
);

const FeatureBadge = ({ label, enabled }: { label: string; enabled: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        enabled
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-red-500 border-red-500/20'
    }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {label.replace(/_/g, ' ')}
    </span>
);

const ProgressBar = ({ value, max = 100, color = 'bg-primary' }: { value: number; max?: number; color?: string }) => (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
            className={`h-full rounded-full ${color} transition-all duration-700`}
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
    </div>
);

const SessionModal = ({ log }: { log: any }) => {
    const m = log?.meta ?? {};
    const interaction = m.interaction ?? {};
    const perf        = m.performance ?? {};
    const device      = m.device_info ?? {};
    const screen      = m.screen_info ?? {};
    const browser     = m.browser_info ?? {};
    const network     = m.network ?? {};
    const features    = m.features ?? {};
    const prefs       = m.preferences ?? {};
    const battery     = m.battery;
    const storage     = m.storage;
    const fp          = m.fingerprints ?? {};
    const sess        = m.session ?? {};
    const os          = m.os ?? {};

    const timeOnPage    = interaction.time_on_page_ms ?? 0;
    const activeTime    = interaction.active_time_ms ?? 0;
    const scrollDepth   = interaction.scroll_depth_percent ?? 0;
    const clicks        = interaction.click_count ?? 0;
    const firstClick    = interaction.first_click_ms;
    const scrollChanges = interaction.scroll_direction_changes ?? 0;

    const perfEntries = [
        { label: 'TTFB',    value: perf.ttfb_ms,          color: '#6366f1' },
        { label: 'DNS',     value: perf.dns_ms,            color: '#8b5cf6' },
        { label: 'TCP',     value: perf.tcp_ms,            color: '#ec4899' },
        { label: 'Request', value: perf.request_ms,        color: '#f97316' },
        { label: 'DOM',     value: perf.dom_content_ms,    color: '#06b6d4' },
        { label: 'FCP',     value: perf.fcp_ms,            color: '#22c55e' },
        { label: 'Load',    value: perf.load_time_ms,      color: '#eab308' },
    ].filter(e => e.value != null && e.value > 0);

    return (
        <div className="space-y-6 mt-4 pb-24">

            {/* ── Top summary strip ─────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Time on Page', value: fmtMs(timeOnPage), sub: activeTime > 0 ? `${fmtMs(activeTime)} active` : undefined, color: 'from-indigo-500 to-indigo-700' },
                    { label: 'Scroll Depth', value: `${scrollDepth}%`, sub: `${scrollChanges} dir changes`, color: 'from-purple-500 to-purple-700' },
                    { label: 'Clicks',       value: clicks,           sub: firstClick ? `First at ${fmtMs(firstClick)}` : 'No clicks', color: 'from-pink-500 to-pink-700' },
                ].map(({ label, value, sub, color }) => (
                    <div key={label} className={`rounded-xl p-3 text-white bg-gradient-to-br ${color} shadow-sm`}>
                        <p className="text-[9px] uppercase tracking-widest opacity-70 mb-1">{label}</p>
                        <p className="text-xl font-bold">{value}</p>
                        {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
                    </div>
                ))}
            </div>

            {/* Scroll depth bar */}
            <div>
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Scroll reached</span>
                    <span className="font-bold text-primary">{scrollDepth}%</span>
                </div>
                <ProgressBar value={scrollDepth} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>

            {/* ── Location & Visit Context ──────────────────────────────────── */}
            <div>
                <SectionLabel icon={MapPin} label="Location & Visit Context" />
                <div className="bg-card border rounded-xl p-4 space-y-0">
                    <KV label="IP Address"      value={log.ip_address} mono />
                    <KV label="City"            value={log.city} />
                    <KV label="Region"          value={log.region} />
                    <KV label="Country"         value={log.country ? `${countryFlag(log.country)} ${log.country}` : null} />
                    <KV label="ISP"             value={log.isp} />
                    <KV label="Timezone"        value={log.timezone} />
                    <KV label="Arrived"         value={m.entry_time ? fmtDateTime(m.entry_time) : fmtDateTime(log.created_at)} />
                    <KV label="Referrer"        value={m.referrer_domain || (log.referrer ? 'direct' : 'direct')} />
                    <KV label="Full Referrer"   value={log.referrer || m.referrer} />
                    <KV label="Page"            value={log.page_path} mono />
                    {m.utm && Object.keys(m.utm).length > 0 && (
                        Object.entries(m.utm).map(([k, v]: [string, any]) => (
                            <KV key={k} label={k} value={v} />
                        ))
                    )}
                    <KV label="Session #"       value={sess.visit_number} />
                    <KV label="First Visit"     value={sess.is_first_visit ? 'Yes (new visitor)' : 'No (returning)'} />
                    <KV label="Visitor ID"      value={m.visitor_id} mono />
                </div>
            </div>

            {/* ── Device ───────────────────────────────────────────────────── */}
            <div>
                <SectionLabel icon={MonitorSmartphone} label="Device" />
                <div className="bg-card border rounded-xl p-4 space-y-0">
                    <KV label="Device Type"     value={device.type ?? log.device_type} />
                    <KV label="OS"              value={os.name ? `${os.name}${os.version ? ' ' + os.version : ''}` : null} />
                    <KV label="Platform"        value={m.platform} />
                    <KV label="RAM"             value={device.memory_gb != null ? `${device.memory_gb} GB` : null} />
                    <KV label="CPU Cores"       value={device.cpu_cores ?? log.cpu_cores} />
                    <KV label="GPU"             value={device.gpu_renderer ?? log.gpu_renderer} />
                    <KV label="GPU Vendor"      value={device.gpu_vendor} />
                    <KV label="WebGL"           value={device.webgl_version} />
                    <KV label="Pixel Ratio"     value={device.pixel_ratio} />
                    <KV label="Color Depth"     value={device.color_depth != null ? `${device.color_depth}-bit` : null} />
                    <KV label="Touch Points"    value={device.max_touch_points > 0 ? device.max_touch_points : 'None'} />
                    <KV label="Orientation"     value={device.orientation} />
                    <KV label="Input Methods"   value={sess.pointer_types?.join(', ')} />
                </div>
            </div>

            {/* ── Screen ───────────────────────────────────────────────────── */}
            <div>
                <SectionLabel icon={Monitor} label="Screen & Viewport" />
                <div className="bg-card border rounded-xl p-4 space-y-0">
                    <KV label="Resolution"      value={screen.resolution ?? log.screen_resolution} />
                    <KV label="Available"       value={screen.available} />
                    <KV label="Window (inner)"  value={screen.window_inner ?? log.window_size} />
                    <KV label="Window (outer)"  value={screen.window_outer} />
                    <KV label="Breakpoint"      value={screen.viewport_bp} />
                    <KV label="HDR Support"     value={screen.hdr_support ? 'Yes' : 'No'} />
                    <KV label="Portrait Mode"   value={device.is_portrait != null ? (device.is_portrait ? 'Yes' : 'No') : null} />
                </div>
            </div>

            {/* ── Browser ──────────────────────────────────────────────────── */}
            <div>
                <SectionLabel icon={Globe} label="Browser" />
                <div className="bg-card border rounded-xl p-4 space-y-0">
                    <KV label="Browser"         value={browser.name ? `${browser.name} ${browser.version ?? ''}`.trim() : parseBrowser(log.user_agent || '')} />
                    <KV label="Engine"          value={browser.engine} />
                    <KV label="Language"        value={log.language} />
                    <KV label="All Languages"   value={browser.languages?.join(', ')} />
                    <KV label="Cookies"         value={browser.cookie_enabled != null ? (browser.cookie_enabled ? 'Enabled' : 'Blocked') : null} />
                    <KV label="Do Not Track"    value={browser.do_not_track === '1' ? 'Enabled' : browser.do_not_track === '0' ? 'Disabled' : 'Unset'} />
                    <KV label="Speech Voices"   value={browser.speech_voices} />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground font-mono bg-muted/50 px-3 py-2 rounded-lg break-all">
                    {(log.user_agent ?? '').substring(0, 150)}{log.user_agent?.length > 150 ? '…' : ''}
                </div>
            </div>

            {/* ── Network ──────────────────────────────────────────────────── */}
            <div>
                <SectionLabel icon={Wifi} label="Network" />
                <div className="bg-card border rounded-xl p-4 space-y-0">
                    <KV label="Connection"      value={network.effective_type ?? log.connection_type} />
                    <KV label="Type"            value={network.type} />
                    <KV label="Downlink"        value={network.downlink_mbps != null ? `${network.downlink_mbps} Mbps` : null} />
                    <KV label="RTT"             value={network.rtt_ms != null ? `${network.rtt_ms} ms` : null} />
                    <KV label="Save Data"       value={network.save_data != null ? (network.save_data ? 'Enabled' : 'Disabled') : null} />
                    <KV label="IP Source"       value={m.full_ip_data?.original_source} />
                </div>
            </div>

            {/* ── Performance Timeline ─────────────────────────────────────── */}
            {perfEntries.length > 0 && (
                <div>
                    <SectionLabel icon={Zap} label="Performance" />
                    <div className="bg-card border rounded-xl p-4">
                        <div className="space-y-2.5">
                            {perfEntries.map(({ label, value, color }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-bold font-mono" style={{ color }}>{fmtMs(value!)}</span>
                                    </div>
                                    <ProgressBar
                                        value={value!}
                                        max={Math.max(...perfEntries.map(e => e.value!))}
                                        color={`[background:${color}]`}
                                    />
                                </div>
                            ))}
                        </div>
                        <ResponsiveContainer width="100%" height={120} className="mt-4">
                            <BarChart data={perfEntries} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                                <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(v: any) => [`${v}ms`, 'Time']} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {perfEntries.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <KV label="Transfer Size"   value={perf.transfer_size_kb != null ? `${perf.transfer_size_kb} KB` : null} />
                        <KV label="Nav Type"        value={perf.nav_type} />
                    </div>
                </div>
            )}

            {/* ── Preferences ──────────────────────────────────────────────── */}
            <div>
                <SectionLabel icon={Activity} label="User Preferences" />
                <div className="bg-card border rounded-xl p-4 space-y-0">
                    <KV label="Color Scheme"    value={prefs.color_scheme} />
                    <KV label="Reduced Motion"  value={prefs.reduced_motion != null ? (prefs.reduced_motion ? 'Enabled' : 'Disabled') : null} />
                    <KV label="Contrast"        value={prefs.contrast} />
                    <KV label="Forced Colors"   value={prefs.forced_colors != null ? (prefs.forced_colors ? 'Active' : 'None') : null} />
                </div>
            </div>

            {/* ── Battery ──────────────────────────────────────────────────── */}
            {battery && (
                <div>
                    <SectionLabel icon={Battery} label="Battery" />
                    <div className="bg-card border rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1">
                                <ProgressBar
                                    value={battery.level ?? 0}
                                    color={battery.level > 20 ? 'bg-emerald-500' : 'bg-red-500'}
                                />
                            </div>
                            <span className="text-sm font-bold">{battery.level}%</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${battery.charging ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                {battery.charging ? '⚡ Charging' : 'On Battery'}
                            </span>
                        </div>
                        <KV label="Charging Time"    value={battery.charging_time && isFinite(battery.charging_time) ? fmtMs(battery.charging_time * 1000) : null} />
                        <KV label="Discharge Time"   value={battery.discharging_time && isFinite(battery.discharging_time) ? fmtMs(battery.discharging_time * 1000) : null} />
                    </div>
                </div>
            )}

            {/* ── Storage ──────────────────────────────────────────────────── */}
            {storage && (
                <div>
                    <SectionLabel icon={HardDrive} label="Browser Storage Quota" />
                    <div className="bg-card border rounded-xl p-4">
                        {storage.quota_mb && storage.usage_mb != null && (
                            <>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-muted-foreground">Used</span>
                                    <span className="font-bold">{storage.usage_mb} MB / {storage.quota_mb} MB</span>
                                </div>
                                <ProgressBar value={storage.usage_mb} max={storage.quota_mb} color="bg-cyan-500" />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Feature Support Matrix ────────────────────────────────────── */}
            {Object.keys(features).length > 0 && (
                <div>
                    <SectionLabel icon={Code2} label="Browser Feature Support" />
                    <div className="bg-card border rounded-xl p-4">
                        <div className="flex flex-wrap gap-1.5">
                            {Object.entries(features).map(([k, v]) => (
                                <FeatureBadge key={k} label={k} enabled={!!v} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Fingerprints ─────────────────────────────────────────────── */}
            {(fp.canvas || fp.audio || fp.math) && (
                <div>
                    <SectionLabel icon={Fingerprint} label="Fingerprints" />
                    <div className="bg-card border rounded-xl p-4 space-y-3">
                        {fp.canvas && (
                            <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Canvas Hash</p>
                                <p className="font-mono text-[10px] break-all bg-muted/50 p-2 rounded">{fp.canvas.substring(0, 80)}…</p>
                            </div>
                        )}
                        {fp.audio && fp.audio !== 'timeout' && fp.audio !== 'error' && (
                            <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Audio Fingerprint</p>
                                <p className="font-mono text-[10px] break-all bg-muted/50 p-2 rounded">{String(fp.audio).substring(0, 80)}…</p>
                            </div>
                        )}
                        {fp.math && (
                            <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Math Fingerprint (JS Engine)</p>
                                <p className="font-mono text-[10px] break-all bg-muted/50 p-2 rounded">{fp.math}</p>
                            </div>
                        )}
                        {fp.fonts && Array.isArray(fp.fonts) && (
                            <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Detected Fonts ({fp.fonts.length})</p>
                                <p className="text-xs text-muted-foreground">{fp.fonts.join(', ')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Raw Meta JSON ─────────────────────────────────────────────── */}
            <div>
                <SectionLabel icon={Cpu} label="Raw Session Data" />
                <pre className="text-[10px] bg-muted/50 border rounded-xl p-4 overflow-auto max-h-72 font-mono leading-relaxed">
                    {JSON.stringify(log.meta, null, 2)}
                </pre>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const AdminLogs = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword]               = useState("");
    const [loading, setLoading]                 = useState(false);
    const [logs, setLogs]                       = useState<any[]>([]);
    const [search, setSearch]                   = useState("");
    const [viewMode, setViewMode]               = useState<"overview" | "list" | "device" | "fingerprint">("overview");
    const [selectedIds, setSelectedIds]         = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting]           = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem("admin_auth") === "true") {
            setIsAuthenticated(true);
            fetchLogs();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const envPw = import.meta.env.VITE_ADMIN_PASSWORD;
        if (!envPw) { toast.error("Admin password not configured."); return; }
        if (password === envPw) {
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
        try {
            const { data, error } = await supabase
                .from("user_visits").select("*")
                .order("created_at", { ascending: false }).limit(1000);
            if (error) toast.error("Failed to fetch: " + error.message);
            else setLogs(data || []);
        } finally {
            setLoading(false);
            setSelectedIds(new Set());
        }
    };

    const filteredLogs = useMemo(() =>
        logs.filter(l => JSON.stringify(l).toLowerCase().includes(search.toLowerCase())),
        [logs, search]
    );

    // ── Stats ─────────────────────────────────────────────────────────────────

    const stats = useMemo(() => {
        if (!logs.length) return null;

        const uniqueVisitors = new Set(logs.map(l => l.meta?.visitor_id).filter(Boolean)).size;

        const timedLogs = logs.filter(l => (l.meta?.interaction?.time_on_page_ms ?? 0) > 1000);
        const avgTimeMs = timedLogs.length
            ? timedLogs.reduce((s, l) => s + l.meta.interaction.time_on_page_ms, 0) / timedLogs.length
            : 0;

        const today = new Date();
        const dayMap: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            dayMap[d.toISOString().split('T')[0]] = 0;
        }
        logs.forEach(l => { const day = l.created_at?.split('T')[0]; if (day && day in dayMap) dayMap[day]++; });
        const visitsByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

        const pageMap: Record<string, number> = {};
        logs.forEach(l => { if (l.page_path) pageMap[l.page_path] = (pageMap[l.page_path] || 0) + 1; });
        const topPages = Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
            .map(([page, count]) => ({ page: page === '/' ? '/ (Home)' : page, count }));

        const deviceMap: Record<string, number> = {};
        logs.forEach(l => { const d = l.device_type || 'unknown'; deviceMap[d] = (deviceMap[d] || 0) + 1; });
        const deviceData = Object.entries(deviceMap)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

        const browserMap: Record<string, number> = {};
        logs.forEach(l => {
            const b = l.meta?.browser_info?.name || parseBrowser(l.user_agent || '');
            browserMap[b] = (browserMap[b] || 0) + 1;
        });
        const browserData = Object.entries(browserMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
            .map(([name, count]) => ({ name, count }));

        const countryMap: Record<string, number> = {};
        logs.forEach(l => { if (l.country) countryMap[l.country] = (countryMap[l.country] || 0) + 1; });
        const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
            .map(([country, count]) => ({ country, count }));
        const topCountry = topCountries[0]?.country || '—';

        const schemeMap: Record<string, number> = {};
        logs.forEach(l => { const s = l.meta?.preferences?.color_scheme || 'unknown'; schemeMap[s] = (schemeMap[s] || 0) + 1; });
        const schemeData = Object.entries(schemeMap).map(([name, value]) => ({ name, value }));

        const returningCount = logs.filter(l => l.meta?.session?.is_first_visit === false).length;
        const newCount       = logs.length - returningCount;

        const osMap: Record<string, number> = {};
        logs.forEach(l => { const o = l.meta?.os?.name || 'Unknown'; osMap[o] = (osMap[o] || 0) + 1; });
        const osData = Object.entries(osMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
            .map(([name, count]) => ({ name, count }));

        const bpMap: Record<string, number> = {};
        logs.forEach(l => { const b = l.meta?.screen_info?.viewport_bp || 'unknown'; bpMap[b] = (bpMap[b] || 0) + 1; });
        const bpData = ['xs','sm','md','lg','xl','2xl'].map(bp => ({ bp, count: bpMap[bp] || 0 }));

        return { uniqueVisitors, avgTimeMs, visitsByDay, topPages, deviceData, browserData, topCountries, topCountry, schemeData, returningCount, newCount, osData, bpData };
    }, [logs]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const deleteLogs = async (ids: string[]) => {
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('user_visits').delete().in('id', ids);
            if (error) toast.error("Delete failed: " + error.message);
            else { toast.success(`Deleted ${ids.length} logs.`); setLogs(logs.filter(l => !ids.includes(l.id))); setSelectedIds(new Set()); }
        } finally { setIsDeleting(false); }
    };

    const clearAllLogs = async () => {
        const ids = logs.map(l => l.id);
        if (!ids.length) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('user_visits').delete().in('id', ids);
            if (error) toast.error("Clear failed: " + error.message);
            else { toast.success("All logs cleared."); setLogs([]); }
        } finally { setIsDeleting(false); }
    };

    const toggleSelectAll = (checked: boolean) =>
        setSelectedIds(checked ? new Set(filteredLogs.map(l => l.id)) : new Set());

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    // ── Overview ──────────────────────────────────────────────────────────────

    const renderOverview = () => {
        if (!stats || !logs.length) return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
                <BarChart2 className="h-10 w-10 opacity-20" />
                <p>No data yet — visit the portfolio to start collecting analytics.</p>
            </div>
        );

        const StatCard = ({ label, value, sub, gradient }: any) => (
            <div className={`rounded-xl p-5 text-white shadow-sm ${gradient}`}>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
                <p className="text-3xl font-bold">{value}</p>
                {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
            </div>
        );

        const ChartCard = ({ title, children }: any) => (
            <Card className="shadow-sm border">
                <CardHeader className="pb-1 pt-4 px-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
                </CardHeader>
                <CardContent className="px-5 pb-5">{children}</CardContent>
            </Card>
        );

        return (
            <div className="space-y-5 p-4 md:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Visits"      value={logs.length.toLocaleString()}            sub="all time"              gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
                    <StatCard label="Unique Visitors"   value={stats.uniqueVisitors.toLocaleString()}   sub="by visitor ID"         gradient="bg-gradient-to-br from-purple-500 to-purple-700" />
                    <StatCard label="Avg Time on Page"  value={stats.avgTimeMs > 0 ? fmtMs(stats.avgTimeMs) : '—'} sub="per session" gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
                    <StatCard label="Top Country"       value={stats.topCountry}                        sub={`${stats.topCountries[0]?.count || 0} visits`} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Visits — Last 14 Days">
                        <ResponsiveContainer width="100%" height={190}>
                            <AreaChart data={stats.visitsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(v: any) => [v, 'Visits']} labelFormatter={fmtDay} />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#vg)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Top Pages">
                        <ResponsiveContainer width="100%" height={190}>
                            <BarChart data={stats.topPages} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="page" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={90} />
                                <Tooltip formatter={(v: any) => [v, 'Visits']} />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 5, 5, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartCard title="Device Types">
                        <ResponsiveContainer width="100%" height={190}>
                            <PieChart>
                                <Pie data={stats.deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                                    {stats.deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Browsers">
                        <ResponsiveContainer width="100%" height={190}>
                            <BarChart data={stats.browserData} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={60} />
                                <Tooltip formatter={(v: any) => [v, 'Visits']} />
                                <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                                    {stats.browserData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Operating Systems">
                        <ResponsiveContainer width="100%" height={190}>
                            <BarChart data={stats.osData} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                                <Tooltip formatter={(v: any) => [v, 'Visits']} />
                                <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                                    {stats.osData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <ChartCard title="Top Countries">
                            <ResponsiveContainer width="100%" height={190}>
                                <BarChart data={stats.topCountries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="country" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip formatter={(v: any) => [v, 'Visits']} />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    <div className="flex flex-col gap-4">
                        <ChartCard title="Viewport Breakpoints">
                            <ResponsiveContainer width="100%" height={120}>
                                <BarChart data={stats.bpData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <XAxis dataKey="bp" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip formatter={(v: any) => [v, 'Visits']} />
                                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="New vs Returning">
                            <div className="flex items-center justify-around py-2">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-indigo-500">{stats.newCount}</p>
                                    <p className="text-xs text-muted-foreground mt-1">New</p>
                                </div>
                                <div className="h-10 w-px bg-border" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-500">{stats.returningCount}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Returning</p>
                                </div>
                            </div>
                        </ChartCard>
                    </div>
                </div>

                <ChartCard title="Color Scheme Preference">
                    <div className="flex gap-6 items-center justify-center py-2">
                        {stats.schemeData.map(({ name, value }: any, i: number) => (
                            <div key={name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: name === 'dark' ? '#1e1b4b' : '#fef9c3', border: `2px solid ${name === 'dark' ? '#6366f1' : '#eab308'}` }} />
                                <span className="text-xs capitalize">{name}</span>
                                <span className="text-xs font-bold text-muted-foreground">({value})</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>
        );
    };

    // ── Grouped views ─────────────────────────────────────────────────────────

    const groupedLogs = useMemo(() => {
        if (viewMode !== 'device' && viewMode !== 'fingerprint') return [];
        return Object.values(filteredLogs.reduce((acc: any, log) => {
            let key = log.meta?.visitor_id || 'unknown';
            if (viewMode === 'fingerprint') {
                const fp = log.meta?.fingerprints;
                if (fp?.canvas && fp?.audio) key = `${fp.canvas.slice(0, 16)}_${fp.audio.slice(0, 8)}`;
                else return acc;
            }
            if (!acc[key]) acc[key] = { ...log, group_key: key, visit_count: 0, last_seen: log.created_at, latest_log: log, paths: new Set(), visitor_ids: new Set() };
            acc[key].visit_count++;
            acc[key].visitor_ids.add(log.meta?.visitor_id || 'unknown');
            if (new Date(log.created_at) > new Date(acc[key].last_seen)) { acc[key].last_seen = log.created_at; acc[key].latest_log = log; }
            acc[key].paths.add(log.page_path);
            return acc;
        }, {}));
    }, [filteredLogs, viewMode]);

    // ── Auth ──────────────────────────────────────────────────────────────────

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-sm shadow-xl border-slate-200 dark:border-slate-800">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-lg font-bold">Admin Access</p>
                        <p className="text-sm text-muted-foreground">Enter your secure password to view logs.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
                            <Button type="submit" className="w-full">Verify Identity</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tabs = [
        { id: 'overview',     icon: BarChart2,   label: 'Overview' },
        { id: 'list',         icon: List,        label: 'All Logs' },
        { id: 'device',       icon: Smartphone,  label: 'Visitors' },
        { id: 'fingerprint',  icon: ShieldCheck, label: 'Fingerprint' },
    ] as const;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* ── Toolbar ───────────────────────────────────────────────────── */}
            <div className="bg-background/95 backdrop-blur border-b px-4 md:px-6 py-4 flex flex-col gap-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg"><Monitor className="h-5 w-5 text-primary" /></div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Analytics Dashboard</h1>
                            <p className="text-xs text-muted-foreground">{logs.length.toLocaleString()} records</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-56 hidden md:block">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 bg-muted h-9" />
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchLogs} title="Refresh">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive border-red-200 hover:bg-red-50"
                            onClick={() => { sessionStorage.removeItem("admin_auth"); window.location.reload(); }}>
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex bg-muted p-1 rounded-lg gap-0.5">
                        {tabs.map(({ id, icon: Icon, label }) => (
                            <Button key={id} variant={viewMode === id ? "secondary" : "ghost"} size="sm"
                                onClick={() => setViewMode(id)}
                                className={`text-xs ${viewMode === id ? 'bg-background shadow-sm' : ''}`}>
                                <Icon className="h-3.5 w-3.5 mr-1" />{label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg text-sm border border-destructive/20">
                                <span className="font-semibold text-xs">{selectedIds.size} selected</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive" className="h-6 text-xs px-2">Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete {selectedIds.size} logs?</AlertDialogTitle>
                                            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteLogs(Array.from(selectedIds))} className="bg-destructive">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSelectedIds(new Set())}><X className="h-3.5 w-3.5" /></Button>
                            </div>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive border-destructive/20 text-xs">
                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear All
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-destructive">⚠ Clear All?</AlertDialogTitle>
                                    <AlertDialogDescription>Delete <b>{logs.length} records</b>. Cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={clearAllLogs} className="bg-destructive">Yes, Wipe</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-auto">
                {loading && !logs.length ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                        <p className="text-sm">Loading Analytics…</p>
                    </div>
                ) : viewMode === 'overview' ? renderOverview() : (
                    <div className="p-4 md:p-6">
                        <Card className="rounded-xl border shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        {viewMode === 'list' && (
                                            <TableHead className="w-10">
                                                <Checkbox checked={selectedIds.size === filteredLogs.length && filteredLogs.length > 0} onCheckedChange={toggleSelectAll} />
                                            </TableHead>
                                        )}
                                        <TableHead>{viewMode === 'list' ? 'Time' : 'Last Seen'}</TableHead>
                                        <TableHead>Location</TableHead>
                                        {(viewMode === 'device' || viewMode === 'fingerprint') && <TableHead className="text-center">Visits</TableHead>}
                                        {viewMode === 'list' && <TableHead>Path</TableHead>}
                                        <TableHead>Device / OS</TableHead>
                                        <TableHead>Browser</TableHead>
                                        {viewMode !== 'fingerprint' && <TableHead className="hidden lg:table-cell">Network</TableHead>}
                                        {viewMode === 'fingerprint' && <TableHead>Linked IDs</TableHead>}
                                        <TableHead className="text-right">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {viewMode === 'list' ? filteredLogs.map(log => (
                                        <TableRow key={log.id} className="group hover:bg-muted/40 transition-colors">
                                            <TableCell><Checkbox checked={selectedIds.has(log.id)} onCheckedChange={() => toggleSelect(log.id)} /></TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(log.created_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <span>{countryFlag(log.country || '')}</span>
                                                    <span className="font-medium">{log.city || '—'}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">{log.country}</span>
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-primary max-w-[120px] truncate">{log.page_path}</TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium capitalize block">{log.meta?.os?.name ?? log.device_type}</span>
                                                <span className="text-[10px] text-muted-foreground">{log.device_type} · {log.screen_resolution}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium block">{log.meta?.browser_info?.name || parseBrowser(log.user_agent || '')}</span>
                                                <span className="text-[10px] text-muted-foreground">{log.meta?.browser_info?.version}</span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <span className="text-xs">{log.meta?.network?.effective_type ?? log.connection_type}</span>
                                                {log.meta?.network?.downlink_mbps && <span className="text-[10px] text-muted-foreground block">{log.meta.network.downlink_mbps} Mbps</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent className="w-[460px] sm:w-[560px] overflow-y-auto">
                                                        <SheetHeader>
                                                            <SheetTitle className="flex items-center gap-2 text-base">
                                                                <Activity className="h-4 w-4 text-primary" />
                                                                Session Analysis
                                                                <span className="text-xs font-mono font-normal text-muted-foreground">{log.id?.substring(0, 8)}</span>
                                                            </SheetTitle>
                                                        </SheetHeader>
                                                        <SessionModal log={log} />
                                                    </SheetContent>
                                                </Sheet>
                                            </TableCell>
                                        </TableRow>
                                    )) : (groupedLogs as any[]).map((group: any) => (
                                        <TableRow key={group.group_key} className="group hover:bg-muted/40 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground">{fmtDateTime(group.last_seen)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <span>{countryFlag(group.country || '')}</span>
                                                    <span className="font-medium">{group.city || '—'}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">{group.country}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-lg font-bold text-primary">{group.visit_count}</span>
                                                <span className="text-[10px] text-muted-foreground block">{group.paths.size} pages</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium capitalize block">{group.meta?.os?.name ?? group.device_type}</span>
                                                <span className="text-[10px] text-muted-foreground">{group.device_type}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium block">{group.meta?.browser_info?.name || parseBrowser(group.user_agent || '')}</span>
                                                <span className="text-[10px] text-muted-foreground">{group.meta?.browser_info?.version}</span>
                                            </TableCell>
                                            {viewMode === 'fingerprint' ? (
                                                <TableCell>
                                                    {group.visitor_ids.size > 1 ? (
                                                        <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded text-xs w-fit">
                                                            <ShieldCheck className="h-3 w-3" />{group.visitor_ids.size} IDs
                                                        </span>
                                                    ) : <span className="text-xs text-muted-foreground">Unique</span>}
                                                </TableCell>
                                            ) : (
                                                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                                    {group.meta?.network?.effective_type ?? group.connection_type}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent className="w-[460px] sm:w-[560px] overflow-y-auto">
                                                        <SheetHeader>
                                                            <SheetTitle className="flex items-center gap-2 text-base">
                                                                <Activity className="h-4 w-4 text-primary" />
                                                                {viewMode === 'fingerprint' ? 'Fingerprint Group' : 'Visitor Profile'}
                                                                <span className="text-xs font-mono font-normal text-muted-foreground">{group.group_key?.substring(0, 8)}</span>
                                                            </SheetTitle>
                                                        </SheetHeader>
                                                        <div className="mt-4 space-y-5 pb-24">
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {[
                                                                    { label: 'Total Visits', value: group.visit_count, gradient: 'from-indigo-500 to-indigo-700' },
                                                                    { label: 'Pages Visited', value: group.paths.size, gradient: 'from-purple-500 to-purple-700' },
                                                                    { label: 'Linked IDs', value: group.visitor_ids.size, gradient: 'from-pink-500 to-pink-700' },
                                                                ].map(({ label, value, gradient }) => (
                                                                    <div key={label} className={`rounded-xl p-3 text-white bg-gradient-to-br ${gradient}`}>
                                                                        <p className="text-[9px] uppercase opacity-70 mb-1">{label}</p>
                                                                        <p className="text-2xl font-bold">{value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Visited Pages</p>
                                                                <div className="space-y-1">
                                                                    {Array.from(group.paths).map((path: string) => (
                                                                        <div key={path} className="flex items-center gap-2 text-xs bg-muted/50 px-3 py-1.5 rounded-lg">
                                                                            <span className="font-mono text-primary">{path}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {group.visitor_ids.size > 0 && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Visitor IDs</p>
                                                                    <div className="space-y-1">
                                                                        {Array.from(group.visitor_ids).map((id: string) => (
                                                                            <div key={id} className="text-xs font-mono bg-muted/50 px-3 py-1.5 rounded-lg">{id}</div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Latest Session Data</p>
                                                                <SessionModal log={group.latest_log} />
                                                            </div>
                                                        </div>
                                                    </SheetContent>
                                                </Sheet>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLogs;
