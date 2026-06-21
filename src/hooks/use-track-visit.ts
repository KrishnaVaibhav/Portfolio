import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getCanvasFingerprint, getAudioFingerprint, getFontFingerprint } from '@/lib/fingerprint';
import { getIpData } from '@/lib/get-ip';
import { Json } from '@/integrations/supabase/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const parseBrowser = (ua: string): { name: string; version: string | null; engine: string } => {
    if (/Edg\//.test(ua))     return { name: 'Edge',    version: ua.match(/Edg\/([\d.]+)/)?.[1]     ?? null, engine: 'Blink' };
    if (/OPR\//.test(ua))     return { name: 'Opera',   version: ua.match(/OPR\/([\d.]+)/)?.[1]     ?? null, engine: 'Blink' };
    if (/Chrome\//.test(ua))  return { name: 'Chrome',  version: ua.match(/Chrome\/([\d.]+)/)?.[1]  ?? null, engine: 'Blink' };
    if (/Firefox\//.test(ua)) return { name: 'Firefox', version: ua.match(/Firefox\/([\d.]+)/)?.[1] ?? null, engine: 'Gecko' };
    if (/Safari\//.test(ua))  return { name: 'Safari',  version: ua.match(/Version\/([\d.]+)/)?.[1] ?? null, engine: 'WebKit' };
    return { name: 'Other', version: null, engine: 'Unknown' };
};

const parseOS = (ua: string): { name: string; version: string | null } => {
    if (/Windows NT 10/.test(ua)) return { name: 'Windows 10/11', version: null };
    if (/Windows NT 6\.3/.test(ua)) return { name: 'Windows 8.1', version: null };
    if (/Windows/.test(ua)) return { name: 'Windows', version: ua.match(/Windows NT ([\d.]+)/)?.[1] ?? null };
    if (/Mac OS X/.test(ua)) return { name: 'macOS', version: ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? null };
    if (/Android/.test(ua)) return { name: 'Android', version: ua.match(/Android ([\d.]+)/)?.[1] ?? null };
    if (/iPhone|iPad/.test(ua)) return { name: 'iOS', version: ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? null };
    if (/Linux/.test(ua)) return { name: 'Linux', version: null };
    if (/CrOS/.test(ua)) return { name: 'ChromeOS', version: null };
    return { name: 'Unknown', version: null };
};

const getViewportBreakpoint = (w: number): string => {
    if (w < 640) return 'xs';
    if (w < 768) return 'sm';
    if (w < 1024) return 'md';
    if (w < 1280) return 'lg';
    if (w < 1536) return 'xl';
    return '2xl';
};

const withTimeout = (promise: Promise<any>, ms: number, fallback: any) =>
    Promise.race([promise, new Promise(r => setTimeout(() => r(fallback), ms))]);

const safeGetItem = (s: Storage, k: string): string | null => { try { return s.getItem(k); } catch { return null; } };
const safeSetItem = (s: Storage, k: string, v: string) => { try { s.setItem(k, v); } catch { } };

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useTrackVisit = () => {
    const location = useLocation();
    const lastPath = useRef<string | null>(null);

    const startTime      = useRef<number>(Date.now());
    const maxScroll      = useRef<number>(0);
    const clickCount     = useRef<number>(0);
    const focusTime      = useRef<number>(0);
    const blurTime       = useRef<number>(0);
    const focusStart     = useRef<number>(Date.now());
    const firstClickTime = useRef<number | null>(null);
    const scrollChanges  = useRef<number>(0);
    const lastScrollDir  = useRef<'up' | 'down' | null>(null);
    const lastScrollY    = useRef<number>(0);
    const visitIdRef     = useRef<string | null>(null);
    const metaDataRef    = useRef<any>({});
    const pointerTypes   = useRef<Set<string>>(new Set());

    const getVisitorId = () => {
        let vid = safeGetItem(localStorage, 'visitor_id');
        if (!vid) { vid = crypto.randomUUID(); safeSetItem(localStorage, 'visitor_id', vid); }
        return vid;
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('ignore_analytics') === 'true') {
            safeSetItem(localStorage, 'ignore_analytics', 'true');
            console.log('🚫 Analytics tracking disabled for this device.');
        }
        if (safeGetItem(localStorage, 'ignore_analytics') === 'true') return;
        if (lastPath.current === location.pathname) return;
        lastPath.current = location.pathname;

        // ── Event listeners ────────────────────────────────────────────────────

        const handleScroll = () => {
            const h = document.documentElement, b = document.body;
            const scrollTop = h.scrollTop || b.scrollTop;
            const scrollHeight = (h.scrollHeight || b.scrollHeight) - h.clientHeight;
            const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
            if (pct > maxScroll.current) maxScroll.current = Math.min(100, pct);

            const dir = scrollTop > lastScrollY.current ? 'down' : 'up';
            if (dir !== lastScrollDir.current) { scrollChanges.current++; lastScrollDir.current = dir; }
            lastScrollY.current = scrollTop;
        };

        const handleClick = (e: MouseEvent) => {
            clickCount.current++;
            if (!firstClickTime.current) firstClickTime.current = Date.now() - startTime.current;
        };

        const handlePointer = (e: PointerEvent) => pointerTypes.current.add(e.pointerType);

        const handleFocus = () => { focusStart.current = Date.now(); };
        const handleBlur  = () => { focusTime.current += Date.now() - focusStart.current; };

        const handleVisChange = () => {
            if (document.visibilityState === 'hidden') {
                focusTime.current += Date.now() - focusStart.current;
                sendUpdate(true);
            } else {
                focusStart.current = Date.now();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('click', handleClick);
        window.addEventListener('pointerdown', handlePointer);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisChange);

        // Reset refs
        startTime.current      = Date.now();
        maxScroll.current      = 0;
        clickCount.current     = 0;
        focusTime.current      = 0;
        blurTime.current       = 0;
        focusStart.current     = Date.now();
        firstClickTime.current = null;
        scrollChanges.current  = 0;
        lastScrollDir.current  = null;
        lastScrollY.current    = 0;
        visitIdRef.current     = null;
        metaDataRef.current    = {};
        pointerTypes.current   = new Set();

        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Supabase keys missing.'); return; }

        // ── Main data collection ──────────────────────────────────────────────

        const logVisit = async () => {
            try {
                const [ipData, audioFp, batteryInfo, storageEstimate] = await Promise.all([
                    getIpData(),
                    withTimeout(getAudioFingerprint(), 2000, 'timeout'),
                    withTimeout(
                        (navigator as any).getBattery
                            ? (navigator as any).getBattery().then((b: any) => ({ level: Math.round(b.level * 100), charging: b.charging, charging_time: b.chargingTime, discharging_time: b.dischargingTime }))
                            : Promise.resolve(null),
                        1000, null
                    ),
                    withTimeout(
                        navigator.storage?.estimate?.() ?? Promise.resolve(null),
                        1000, null
                    ),
                ]);

                const canvasFp = getCanvasFingerprint();
                const fontsFp  = getFontFingerprint();

                // Performance — Navigation Timing
                let perfMetrics: any = {};
                if (window.performance) {
                    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                    if (nav) perfMetrics = {
                        load_time_ms:      Math.round(nav.loadEventEnd - nav.startTime),
                        ttfb_ms:           Math.round(nav.responseStart - nav.requestStart),
                        dom_content_ms:    Math.round(nav.domContentLoadedEventEnd - nav.startTime),
                        dns_ms:            Math.round(nav.domainLookupEnd - nav.domainLookupStart),
                        tcp_ms:            Math.round(nav.connectEnd - nav.connectStart),
                        request_ms:        Math.round(nav.responseEnd - nav.requestStart),
                        transfer_size_kb:  nav.transferSize ? Math.round(nav.transferSize / 1024) : null,
                        nav_type:          nav.type,
                    };
                }

                // FCP & LCP from paint entries (PerformanceObserver already fired by now)
                let fcp: number | null = null;
                try {
                    const paintEntry = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
                    if (paintEntry) fcp = Math.round(paintEntry.startTime);
                } catch { }

                // Math fingerprint — engines differ on edge-case float results
                const mathFp = [
                    Math.tan(-1e300),
                    Math.sin(Math.PI),
                    Math.acos(1 + Number.EPSILON),
                    Math.pow(10, -323),
                    1 / 0,
                ].map(n => (isFinite(n) ? n.toFixed(20) : String(n))).join('|');

                // GPU via WebGL
                let gpuRenderer: string | null = null;
                let gpuVendor: string | null   = null;
                let webglVersion: string | null = null;
                try {
                    const canvas = document.createElement('canvas');
                    const gl  = canvas.getContext('webgl2') as WebGL2RenderingContext | null
                             || canvas.getContext('webgl') as WebGLRenderingContext | null;
                    if (gl) {
                        webglVersion = gl instanceof WebGL2RenderingContext ? 'WebGL 2' : 'WebGL 1';
                        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
                        if (dbg) {
                            gpuRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
                            gpuVendor   = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   as string;
                        }
                    }
                } catch { }

                // Device & screen
                const ua             = navigator.userAgent;
                const language       = navigator.language;
                const screenRes      = `${screen.width}x${screen.height}`;
                const windowSize     = `${window.innerWidth}x${window.innerHeight}`;
                const timezone       = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const tzOffset       = new Date().getTimezoneOffset();
                const cpuCores       = navigator.hardwareConcurrency || null;
                const deviceMemory   = (navigator as any).deviceMemory ?? null;
                const maxTouchPoints = navigator.maxTouchPoints ?? 0;
                const pixelRatio     = window.devicePixelRatio || 1;
                const colorDepth     = screen.colorDepth;
                const orientation    = (screen as any).orientation?.type ?? 'unknown';
                const screenAvail    = `${screen.availWidth}x${screen.availHeight}`;
                const outerSize      = `${window.outerWidth}x${window.outerHeight}`;
                const viewportBp     = getViewportBreakpoint(window.innerWidth);

                const parsedBrowser = parseBrowser(ua);
                const parsedOS      = parseOS(ua);
                const allLanguages  = Array.from(navigator.languages || []);

                const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
                const connectionType = connection?.effectiveType ?? 'unknown';

                const visitorId    = getVisitorId();
                const currentCount = parseInt(safeGetItem(sessionStorage, 'visit_count') || '0') + 1;
                safeSetItem(sessionStorage, 'visit_count', currentCount.toString());

                let deviceType = 'desktop';
                if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
                else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

                const isFirstVisit = !safeGetItem(localStorage, 'has_visited');
                if (isFirstVisit) safeSetItem(localStorage, 'has_visited', 'true');

                // UTM / referrer parsing
                const utmParams: Record<string, string> = {};
                ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
                    const v = searchParams.get(k);
                    if (v) utmParams[k] = v;
                });
                let referrerDomain: string | null = null;
                try { if (document.referrer) referrerDomain = new URL(document.referrer).hostname; } catch { }

                // Media query signals
                const prefersColorScheme    = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const prefersReducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const prefersContrast       = window.matchMedia('(prefers-contrast: more)').matches ? 'more' : 'normal';
                const supportsHDR           = window.matchMedia('(dynamic-range: high)').matches;
                const forcedColors          = window.matchMedia('(forced-colors: active)').matches;
                const isPortraitMode        = window.matchMedia('(orientation: portrait)').matches;

                // Feature detection
                const tc = document.createElement('canvas');
                const features = {
                    webgl:           !!(tc.getContext('webgl') || tc.getContext('experimental-webgl')),
                    webgl2:          !!tc.getContext('webgl2'),
                    wasm:            typeof WebAssembly !== 'undefined',
                    service_worker:  'serviceWorker' in navigator,
                    push_api:        'PushManager' in window,
                    indexed_db:      !!window.indexedDB,
                    geolocation:     'geolocation' in navigator,
                    notifications:   'Notification' in window,
                    touch:           maxTouchPoints > 0,
                    webrtc:          !!(window as any).RTCPeerConnection,
                    speech_synth:    'speechSynthesis' in window,
                    media_devices:   !!(navigator.mediaDevices),
                    web_share:       !!navigator.share,
                    wake_lock:       'wakeLock' in navigator,
                    clipboard:       !!navigator.clipboard,
                    bluetooth:       !!(navigator as any).bluetooth,
                    usb:             !!(navigator as any).usb,
                    payment_request: !!(window as any).PaymentRequest,
                    css_grid:        CSS.supports('display', 'grid'),
                    css_custom_props:CSS.supports('color', 'var(--x)'),
                    pointer_coarse:  window.matchMedia('(pointer: coarse)').matches,
                    pointer_fine:    window.matchMedia('(pointer: fine)').matches,
                };

                // Speech voices count
                let speechVoiceCount = 0;
                try { speechVoiceCount = window.speechSynthesis?.getVoices()?.length ?? 0; } catch { }

                // Storage quota
                const storageQuota = storageEstimate ? {
                    quota_mb:  storageEstimate.quota ? Math.round(storageEstimate.quota / 1024 / 1024) : null,
                    usage_mb:  storageEstimate.usage ? Math.round(storageEstimate.usage / 1024 / 1024) : null,
                } : null;

                // Construct Meta
                const meta = {
                    full_ip_data:  ipData,
                    entry_time:    new Date().toISOString(),
                    page_path:     location.pathname,
                    referrer:      document.referrer || null,
                    referrer_domain: referrerDomain,
                    utm:           Object.keys(utmParams).length ? utmParams : null,
                    visitor_id:    visitorId,
                    session_visit_count: currentCount,
                    platform:      navigator.platform,

                    os: {
                        name:    parsedOS.name,
                        version: parsedOS.version,
                    },

                    browser_info: {
                        name:           parsedBrowser.name,
                        version:        parsedBrowser.version,
                        engine:         parsedBrowser.engine,
                        languages:      allLanguages,
                        cookie_enabled: navigator.cookieEnabled,
                        do_not_track:   navigator.doNotTrack,
                        speech_voices:  speechVoiceCount,
                    },

                    device_info: {
                        type:             deviceType,
                        memory_gb:        deviceMemory,
                        cpu_cores:        cpuCores,
                        max_touch_points: maxTouchPoints,
                        pixel_ratio:      pixelRatio,
                        color_depth:      colorDepth,
                        orientation:      orientation,
                        is_portrait:      isPortraitMode,
                        gpu_renderer:     gpuRenderer,
                        gpu_vendor:       gpuVendor,
                        webgl_version:    webglVersion,
                    },

                    screen_info: {
                        resolution:   screenRes,
                        available:    screenAvail,
                        window_inner: windowSize,
                        window_outer: outerSize,
                        viewport_bp:  viewportBp,
                        hdr_support:  supportsHDR,
                    },

                    network: {
                        effective_type: connectionType,
                        type:           connection?.type ?? 'unknown',
                        downlink_mbps:  connection?.downlink ?? null,
                        rtt_ms:         connection?.rtt ?? null,
                        save_data:      connection?.saveData ?? false,
                    },

                    performance: {
                        ...perfMetrics,
                        fcp_ms: fcp,
                    },

                    fingerprints: {
                        canvas: canvasFp,
                        audio:  audioFp,
                        fonts:  fontsFp,
                        math:   mathFp,
                    },

                    battery:  batteryInfo,
                    storage:  storageQuota,

                    preferences: {
                        color_scheme:    prefersColorScheme,
                        reduced_motion:  prefersReducedMotion,
                        contrast:        prefersContrast,
                        forced_colors:   forcedColors,
                    },

                    features,

                    session: {
                        is_first_visit: isFirstVisit,
                        visit_number:   currentCount,
                        pointer_types:  Array.from(pointerTypes.current),
                    },
                };

                metaDataRef.current = meta;

                const { data, error } = await supabase.from('user_visits').insert({
                    page_path:         location.pathname,
                    user_agent:        ua,
                    ip_address:        ipData.ip || null,
                    city:              ipData.city || null,
                    country:           ipData.country_name || null,
                    region:            ipData.region || null,
                    isp:               ipData.org || null,
                    device_type:       deviceType,
                    screen_resolution: screenRes,
                    window_size:       windowSize,
                    language:          language,
                    referrer:          document.referrer,
                    timezone:          timezone,
                    connection_type:   connectionType,
                    cpu_cores:         cpuCores,
                    gpu_renderer:      gpuRenderer,
                    meta:              meta as unknown as Json,
                }).select('id').single();

                if (error) console.error('Log visit error:', error);
                else if (data) visitIdRef.current = data.id;

            } catch (err) {
                console.error('Tracking fatal error:', err);
            }
        };

        logVisit();

        // ── Exit / Heartbeat ──────────────────────────────────────────────────

        const sendUpdate = (isBeacon = false) => {
            const vid = visitIdRef.current;
            if (!vid) return;

            const now = Date.now();
            const activeMs = focusTime.current + (document.visibilityState === 'visible' ? now - focusStart.current : 0);

            const exitMeta = {
                ...metaDataRef.current,
                interaction: {
                    time_on_page_ms:       now - startTime.current,
                    active_time_ms:        activeMs,
                    scroll_depth_percent:  maxScroll.current,
                    click_count:           clickCount.current,
                    scroll_direction_changes: scrollChanges.current,
                    first_click_ms:        firstClickTime.current,
                    input_methods:         Array.from(pointerTypes.current),
                    last_updated:          new Date().toISOString(),
                },
            };

            if (isBeacon) {
                fetch(`${SUPABASE_URL}/rest/v1/user_visits?id=eq.${vid}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({ meta: exitMeta }),
                    keepalive: true,
                }).catch(e => console.error('Beacon update failed', e));
            } else {
                supabase.from('user_visits').update({ meta: exitMeta as unknown as Json }).eq('id', vid)
                    .then(({ error }) => { if (error) console.error('Heartbeat DB Error:', error); });
            }
        };

        const heartbeat = setInterval(() => sendUpdate(false), 15000);

        return () => {
            clearInterval(heartbeat);
            document.removeEventListener('visibilitychange', handleVisChange);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('pointerdown', handlePointer);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            sendUpdate(true);
        };
    }, [location.pathname, location.search]);
};
