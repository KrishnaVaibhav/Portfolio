import { Fragment, useEffect, useState } from "react";
import { TransitionLink } from "@/components/TransitionLink";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingUp, TrendingDown, CheckCircle2, XCircle, MinusCircle,
  AlertTriangle, Inbox, RefreshCw, ChartNoAxesCombined,
  ChevronDown, ChevronUp, Github, ShieldAlert, Star, CalendarDays, ArrowLeft,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Forecast = Tables<"forecasts">;

const SOURCE_URL = "https://github.com/KrishnaVaibhav/PipeLines/tree/main/daily-signals/stock-forecast";
const REASONING_TRUNCATE_LENGTH = 220;

const fmtPrice = (value: number | null) =>
  value == null ? "-" : `$${value.toFixed(2)}`;

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const asNumberArray = (value: unknown): number[] =>
  Array.isArray(value) ? value.filter((v): v is number => typeof v === "number") : [];

const toggleInSet = (set: Set<string>, key: string) => {
  const next = new Set(set);
  next.has(key) ? next.delete(key) : next.add(key);
  return next;
};

const DirectionBadge = ({ direction }: { direction: string }) => {
  const isRise = direction.toLowerCase() === "rise";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        isRise
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : "bg-red-500/10 text-red-500 border-red-500/20"
      }`}
    >
      {isRise ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {direction}
    </span>
  );
};

const AgreementIcon = ({ status }: { status: boolean | null }) => {
  if (status === true) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  if (status === false) return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  return <MinusCircle className="w-3.5 h-3.5 text-muted-foreground/50" />;
};

const ResultCell = ({ hit1d, hit7d }: { hit1d: boolean | null; hit7d: boolean | null }) => {
  const Status = ({ label, hit }: { label: string; hit: boolean | null }) => (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground w-6">{label}</span>
      <AgreementIcon status={hit} />
      <span className={hit == null ? "text-muted-foreground" : ""}>
        {hit === true ? "Hit" : hit === false ? "Miss" : "Pending"}
      </span>
    </div>
  );
  return (
    <div className="space-y-1">
      <Status label="1D" hit={hit1d} />
      <Status label="7D" hit={hit7d} />
    </div>
  );
};

const Sparkline = ({ closes }: { closes: number[] }) => {
  if (closes.length < 2) return <span className="text-xs text-muted-foreground">-</span>;
  const w = 64, h = 22, pad = 2;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const points = closes
    .map((v, i) => {
      const x = pad + (i / (closes.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const rising = closes[closes.length - 1] >= closes[0];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block align-middle">
      <polyline
        points={points}
        fill="none"
        stroke={rising ? "#10b981" : "#ef4444"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const RiskDetails = ({ forecast }: { forecast: Forecast }) => (
  <Collapsible>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
        <ShieldAlert className="w-3.5 h-3.5" />
        Risk Details
        <ChevronDown className="w-3.5 h-3.5" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 rounded-lg p-3 text-xs max-w-md">
        <div>
          <p className="text-muted-foreground mb-0.5">Stop Loss</p>
          <p className="font-mono font-medium">{fmtPrice(forecast.stop_loss_price)}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">Risk / Share</p>
          <p className="font-mono font-medium">
            {forecast.risk_per_share_pct != null ? `${forecast.risk_per_share_pct.toFixed(2)}%` : "-"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">Sector</p>
          <p className="font-medium">{forecast.sector ?? "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">ATR (14)</p>
          <p className="font-mono font-medium">{forecast.atr14 != null ? forecast.atr14.toFixed(2) : "-"}</p>
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>
);

const Signals = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());

  const fetchForecasts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("forecasts")
      .select("*")
      .order("confidence", { ascending: false });

    if (error) setError(error.message);
    else setForecasts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const COLUMN_COUNT = 8;

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      <AmbientBackground />
      <Navigation />

      <main id="main" className="relative z-content px-[var(--gutter)] pb-24 pt-32 md:pt-40">
        <div className="page">
          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="animate-rise-in">
              <div className="mb-6 grid h-16 w-16 place-items-center rounded-[18px] bg-gradient-to-br from-emerald-400 via-emerald-600 to-rose-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_20px_40px_-16px_rgba(0,0,0,0.45)]">
                <ChartNoAxesCombined className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] md:text-7xl">Daily Signals.</h1>
              <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground md:text-xl">
                Live AI-generated stock forecasts, refreshed daily from the Supabase pipeline.
              </p>
            </div>
            <Button asChild variant="outline" className="self-start md:self-auto">
              <a href={SOURCE_URL} target="_blank" rel="noreferrer noopener">
                <Github />
                View source
              </a>
            </Button>
          </div>

          <Card className="p-4 md:p-6 animate-rise-in" style={{ animationDelay: "120ms" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading…" : `${forecasts.length} forecast${forecasts.length === 1 ? "" : "s"} today`}
              </p>
              <Button variant="outline" size="sm" onClick={fetchForecasts} disabled={loading}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {loading && (
              <div className="space-y-3 py-2" aria-busy="true" aria-label="Fetching today's forecasts">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl px-2 py-3">
                    <div className="w-24 space-y-1.5">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-1.5 flex-1 max-w-[140px]" />
                    <Skeleton className="hidden h-5 w-14 rounded-full sm:block" />
                    <Skeleton className="ml-auto h-8 w-16" />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Couldn't load forecasts</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && !error && forecasts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">No forecasts yet. The pipeline hasn't run today.</p>
              </div>
            )}

            {!loading && !error && forecasts.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Price / 7D Trend</TableHead>
                    <TableHead className="w-[140px]">Confidence</TableHead>
                    <TableHead className="hidden sm:table-cell">Provider</TableHead>
                    <TableHead className="hidden md:table-cell">Technicals</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecasts.map((f, idx) => {
                    const rowKey = `${f.ticker}-${f.provider}-${idx}`;
                    const isExpanded = expandedRows.has(rowKey);
                    const isReasoningExpanded = expandedReasoning.has(rowKey);
                    const closes = asNumberArray(f.week_closes);
                    const sources = asStringArray(f.sources);
                    const technicalAgree =
                      f.technical_direction == null
                        ? null
                        : f.technical_direction.toLowerCase() === f.direction.toLowerCase();
                    const reasoning = f.reasoning ?? "";
                    const isLongReasoning = reasoning.length > REASONING_TRUNCATE_LENGTH;

                    return (
                      <Fragment key={rowKey}>
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold">{f.ticker}</span>
                              {f.actionable && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help text-amber-500" aria-label="Actionable signal"><Star className="h-3.5 w-3.5 fill-current" /></span>
                                  </TooltipTrigger>
                                  <TooltipContent>Actionable: AI and technicals agree, confidence ≥ 70%</TooltipContent>
                                </Tooltip>
                              )}
                              {f.earnings_date && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help text-muted-foreground" aria-label="Earnings date within window"><CalendarDays className="h-3.5 w-3.5" /></span>
                                  </TooltipTrigger>
                                  <TooltipContent>Earnings: {fmtDate(f.earnings_date)}</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{f.company_name}</p>
                          </TableCell>
                          <TableCell>
                            <DirectionBadge direction={f.direction} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{fmtPrice(f.price_at_forecast)}</span>
                              <Sparkline closes={closes} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={f.confidence} className="h-1.5" />
                              <span className="text-xs font-medium w-9 text-right">{f.confidence}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary" className="capitalize text-xs">
                              {f.provider}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono">{f.rsi14 != null ? `RSI ${f.rsi14.toFixed(0)}` : "-"}</span>
                              <AgreementIcon status={technicalAgree} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <ResultCell hit1d={f.hit_1d} hit7d={f.hit_7d} />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setExpandedRows((prev) => toggleInSet(prev, rowKey))}
                              aria-label={isExpanded ? "Collapse details" : "Expand details"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableCell colSpan={COLUMN_COUNT} className="py-4">
                              <div className="space-y-4 max-w-3xl">
                                <div>
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                                    Reasoning
                                  </h4>
                                  {reasoning ? (
                                    <>
                                      <p
                                        className={`text-sm text-foreground/90 leading-relaxed ${
                                          !isReasoningExpanded && isLongReasoning ? "line-clamp-3" : ""
                                        }`}
                                      >
                                        {reasoning}
                                      </p>
                                      {isLongReasoning && (
                                        <button
                                          onClick={() => setExpandedReasoning((prev) => toggleInSet(prev, rowKey))}
                                          className="text-xs text-primary hover:underline mt-1"
                                        >
                                          {isReasoningExpanded ? "Show less" : "Show more"}
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No reasoning provided.</p>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                                    Sources
                                  </h4>
                                  {sources.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {sources.map((url, sIdx) => (
                                        <a key={sIdx} href={url} target="_blank" rel="noreferrer noopener">
                                          <Badge
                                            variant="outline"
                                            className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                                          >
                                            {sIdx + 1}
                                          </Badge>
                                        </a>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No sources listed.</p>
                                  )}
                                </div>

                                <RiskDetails forecast={f} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Informational only, not financial advice.
          </p>

          <div className="mt-10 text-center">
            <Button asChild variant="ghost" size="sm" className="group">
              <TransitionLink to="/">
                <ArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                Back to portfolio
              </TransitionLink>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signals;
