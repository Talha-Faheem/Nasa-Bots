/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * api/donki.ts
 * Vercel Serverless Function fetching NASA DONKI space weather telemetry with 1-hour caching.
 * Protects NASA_API_KEY on server side; returns normalized JSON with Live NASA badge.
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(_req: Request) {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const today = new Date();
  const past30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const startDate = past30Days.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const donkiUrl = `https://api.nasa.gov/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${apiKey}`;

  try {
    const response = await fetch(donkiUrl);
    if (!response.ok) {
      throw new Error(`NASA DONKI HTTP ${response.status}`);
    }

    const data = await response.json();

    // Normalize events
    const normalized = Array.isArray(data)
      ? data.slice(0, 10).map((evt: any) => {
          const speed = evt.cmeAnalyses?.[0]?.speed ?? 600;
          let severity = 1;
          if (speed > 1200) severity = 4;
          else if (speed > 900) severity = 3;
          else if (speed > 500) severity = 2;

          return {
            activityID: evt.activityID,
            eventType: 'CME',
            startTime: evt.startTime,
            speed,
            severity,
            sourceLocation: evt.sourceLocation || 'Sun Active Region',
            badge: 'Live NASA',
            instruments: evt.instruments?.map((i: any) => i.displayName) || ['SOHO'],
          };
        })
      : [];

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch NASA DONKI live events',
        message: err.message,
        fallbackToArchived: true,
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
