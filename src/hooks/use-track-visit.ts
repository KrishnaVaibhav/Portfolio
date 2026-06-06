import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getCanvasFingerprint, getAudioFingerprint, getFontFingerprint } from '@/lib/fingerprint';
import { getIpData } from '@/lib/get-ip';
import { Json } from '@/integrations/supabase/types';

// Helper for safe timeout
const withTimeout = (promise: Promise<any>, ms: number, fallback: any) => {
    return Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
};

// Safe Storage Access
const safeGetItem = (storage: Storage, key: string): string | null => {
    try { return storage.getItem(key); } catch (e) { return null; }
};
const safeSetItem = (storage: Storage, key: string, value: string) => {
    try { storage.setItem(key, value); } catch (e) { }
};

export const useTrackVisit = () => {
    const location = useLocation();
    const lastPath = useRef<string | null>(null);

    // Interaction Tracking Refs
    const startTime = useRef<number>(Date.now());
    const maxScroll = useRef<number>(0);
    const clickCount = useRef<number>(0);
    const visitIdRef = useRef<string | null>(null);
    const metaDataRef = useRef<any>({});

    // Get or Create Persistent Visitor ID
    const getVisitorId = () => {
        let vid = safeGetItem(localStorage, 'visitor_id');
        if (!vid) {
            vid = crypto.randomUUID();
            safeSetItem(localStorage, 'visitor_id', vid);
        }
        return vid;
    };

    // Main Logging Logic
    useEffect(() => {
        // 1. IMMEDIATE PRIORITY: Check & Set Exclusion Flag
        // We do this first to ensure we never accidentally log an ignored user
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('ignore_analytics') === 'true') {
            safeSetItem(localStorage, 'ignore_analytics', 'true');
            console.log('🚫 Analytics tracking disabled for this device.');
        }

        // 2. CHECK STATUS: Access Storage
        const isIgnored = safeGetItem(localStorage, 'ignore_analytics') === 'true';

        // 3. HARD STOP: If ignored, do absolutely nothing.
        // We return early so no listeners are attached and no API calls are made.
        if (isIgnored) return;

        // --- BEYOND THIS POINT, WE ARE TRACKING ---

        const handleScroll = () => {
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop';
            const sh = 'scrollHeight';
            const percent = Math.round((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100);
            if (percent > maxScroll.current) maxScroll.current = percent;
        };
        const handleClick = () => clickCount.current++;

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('click', handleClick);

        if (lastPath.current === location.pathname) return;
        lastPath.current = location.pathname;

        startTime.current = Date.now();
        maxScroll.current = 0;
        clickCount.current = 0;
        visitIdRef.current = null;
        metaDataRef.current = {};

        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        if (!SUPABASE_URL || !SUPABASE_KEY) {
            console.error("CRITICAL: Supabase keys missing in build. Visit Log aborted.");
            return;
        }

        const logVisit = async () => {
            try {
                // Parallelize Gather
                const [ipData, audioFp, batteryInfo] = await Promise.all([
                    getIpData(),
                    withTimeout(getAudioFingerprint(), 2000, 'timeout'),
                    withTimeout(
                        (navigator as any).getBattery ? (navigator as any).getBattery().then((b: any) => ({ level: b.level, charging: b.charging })) : Promise.resolve({}),
                        1000,
                        {}
                    )
                ]);

                // Sync Fingerprints
                const canvasFp = getCanvasFingerprint();
                const fontsFp = getFontFingerprint();

                // Performance
                let perfMetrics: any = {};
                if (window.performance) {
                    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                    if (nav) {
                        perfMetrics = {
                            loadTime: nav.loadEventEnd - nav.startTime,
                            ttfb: nav.responseStart - nav.requestStart,
                            type: nav.type
                        };
                    }
                }

                // Standard Info
                const userAgent = navigator.userAgent;
                const language = navigator.language;
                const screenRes = `${window.screen.width}x${window.screen.height}`;
                const windowSize = `${window.innerWidth}x${window.innerHeight}`;
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const cpuCores = navigator.hardwareConcurrency || null;
                const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
                const connectionType = connection ? connection.effectiveType : 'unknown';

                const visitorId = getVisitorId();
                const currentCount = parseInt(safeGetItem(sessionStorage, 'visit_count') || '0') + 1;
                safeSetItem(sessionStorage, 'visit_count', currentCount.toString());

                let deviceType = 'desktop';
                if (/Mobi|Android/i.test(userAgent)) deviceType = 'mobile';
                else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'tablet';

                // Construct Meta
                const meta = {
                    full_ip_data: ipData,
                    fingerprints: {
                        canvas: canvasFp,
                        audio: audioFp,
                        fonts: fontsFp,
                    },
                    performance: perfMetrics,
                    battery: batteryInfo,
                    connection_details: connection ? { downlink: connection.downlink, rtt: connection.rtt } : {},
                    visitor_id: visitorId,
                    session_visit_count: currentCount,
                    platform: navigator.platform,
                };
                metaDataRef.current = meta;

                // Insert into Supabase
                const { data, error } = await supabase.from('user_visits').insert({
                    page_path: location.pathname,
                    user_agent: userAgent,
                    ip_address: ipData.ip || null,
                    city: ipData.city || null,
                    country: ipData.country_name || null,
                    region: ipData.region || null,
                    isp: ipData.org || null,
                    device_type: deviceType,
                    screen_resolution: screenRes,
                    window_size: windowSize,
                    language: language,
                    referrer: document.referrer,
                    timezone: timezone,
                    connection_type: connectionType,
                    cpu_cores: cpuCores,
                    meta: meta as unknown as Json
                }).select('id').single();

                if (error) {
                    console.error('Log visit error:', error);
                } else if (data) {
                    visitIdRef.current = data.id;
                }

            } catch (err) {
                console.error('Tracking fatal error:', err);
            }
        };

        logVisit();

        // ------------------------------------
        // Reliable Exit & Heartbeat Logic
        // ------------------------------------
        const sendUpdate = (isBeacon = false) => {
            const vid = visitIdRef.current;
            if (!vid) return;

            const timeOnPage = Date.now() - startTime.current;
            const exitMeta = {
                ...metaDataRef.current,
                interaction: {
                    time_on_page_ms: timeOnPage,
                    scroll_depth_percent: maxScroll.current,
                    click_count: clickCount.current,
                    last_updated: new Date().toISOString()
                }
            };

            const payload = { meta: exitMeta as unknown as Json };

            if (isBeacon) {
                const url = `${SUPABASE_URL}/rest/v1/user_visits?id=eq.${vid}`;
                fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(e => console.error('Beacon update failed', e));
            } else {
                supabase.from('user_visits')
                    .update(payload)
                    .eq('id', vid)
                    .then(({ error }) => {
                        if (error) console.error('Heartbeat DB Error:', error);
                    });
            }
        };

        const heartbeat = setInterval(() => { sendUpdate(false); }, 15000); // 15s

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') sendUpdate(true);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(heartbeat);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClick);
            sendUpdate(true);
        };
    }, [location.pathname, location.search]);
};
