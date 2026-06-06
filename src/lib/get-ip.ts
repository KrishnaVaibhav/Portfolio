/**
 * Fetches IP data from multiple free providers with failover.
 * Normalizes the response to a standard format.
 */

interface IpData {
    ip: string | null;
    city: string | null;
    region: string | null;
    country_name: string | null;
    org: string | null; // ISP
    original_source?: string;
}

export const getIpData = async (): Promise<IpData> => {
    const providers = [
        {
            name: 'ipapi.co',
            url: 'https://ipapi.co/json/',
            map: (data: any) => ({
                ip: data.ip,
                city: data.city,
                region: data.region,
                country_name: data.country_name,
                org: data.org
            })
        },
        {
            name: 'ipwho.is',
            url: 'https://ipwho.is/',
            map: (data: any) => ({
                ip: data.ip,
                city: data.city,
                region: data.region,
                country_name: data.country,
                org: data.connection?.isp || data.connection?.org
            })
        },
        {
            name: 'db-ip',
            url: 'https://api.db-ip.com/v2/free/self',
            map: (data: any) => ({
                ip: data.ipAddress,
                city: data.city,
                region: data.stateProv,
                country_name: data.countryName,
                org: 'Unknown (DB-IP)' // DB-IP free doesn't give ISP
            })
        }
    ];

    for (const provider of providers) {
        try {
            // Set a strict timeout for each provider
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout per provider

            const res = await fetch(provider.url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const json = await res.json();
                // Basic validation: must have an IP
                if (json.ip || json.ipAddress) {
                    const normalized = provider.map(json);
                    return { ...normalized, original_source: provider.name };
                }
            }
        } catch (e) {
            console.warn(`IP Fetch failed for ${provider.name}`, e);
            // Continue to next provider
        }
    }

    // Fallback if all fail
    return {
        ip: null,
        city: null,
        region: null,
        country_name: null,
        org: null,
        original_source: 'failed'
    };
};
