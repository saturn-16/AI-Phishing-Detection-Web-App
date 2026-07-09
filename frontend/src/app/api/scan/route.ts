import { NextResponse } from "next/server";
import dns from "dns";
import { promisify } from "util";

const resolve4 = promisify(dns.resolve4);

export async function POST(req: Request) {
  try {
    let { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    // 1. Try to get ML Model prediction from Flask (local fallback if down)
    let mlPrediction = 0;
    let mlProbability = 0.05;
    try {
      const mlRes = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        mlPrediction = mlData.prediction;
        mlProbability = mlData.probability;
      }
    } catch {
      // Local ML backend down, will combine VT/AbuseIPDB with client features
    }

    // 2. Resolve hostname to IP for AbuseIPDB
    let resolvedIp = "";
    let hostname = "";
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `http://${url}`);
      hostname = urlObj.hostname;
      const ips = await resolve4(hostname);
      if (ips && ips.length > 0) {
        resolvedIp = ips[0];
      }
    } catch {
      // IP resolution failed, can happen with invalid domains
    }

    // 3. VirusTotal Scan Check
    let vtMalicious = 0;
    let vtSuspicious = 0;
    const vtKey = process.env.VIRUSTOTAL_API_KEY;
    if (vtKey) {
      try {
        // VirusTotal v3 URL ID is URL-safe base64 without padding
        const urlId = Buffer.from(url)
          .toString("base64")
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");

        const vtRes = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
          headers: {
            "x-apikey": vtKey,
          },
        });
        if (vtRes.ok) {
          const vtData = await vtRes.json();
          const stats = vtData.data?.attributes?.last_analysis_stats;
          if (stats) {
            vtMalicious = stats.malicious || 0;
            vtSuspicious = stats.suspicious || 0;
          }
        }
      } catch {
        // VT call failed
      }
    }

    // 4. AbuseIPDB IP Abuse Check
    let abuseConfidenceScore = 0;
    const abuseKey = process.env.ABUSEIPDB_API_KEY;
    if (abuseKey && resolvedIp) {
      try {
        const abuseRes = await fetch(
          `https://api.abuseipdb.com/api/v2/check?ipAddress=${resolvedIp}&maxAgeInDays=90`,
          {
            headers: {
              Key: abuseKey,
              Accept: "application/json",
            },
          }
        );
        if (abuseRes.ok) {
          const abuseData = await abuseRes.json();
          abuseConfidenceScore = abuseData.data?.abuseConfidenceScore || 0;
        }
      } catch {
        // AbuseIPDB call failed
      }
    }

    // 5. Combine predictions and scoring metrics
    // Heuristics flags
    const lengthFlag = url.length > 75;
    const httpsFlag = !url.startsWith("https://");
    const ipAddressFlag = resolvedIp !== "" && /(\d{1,3}\.){3}\d{1,3}/.test(url);
    const atSymbolFlag = url.includes("@");
    const suspiciousWords = ["login", "verify", "update", "secure", "account", "bank", "free", "password"];
    const keywordsCount = suspiciousWords.filter((w) => url.toLowerCase().includes(w)).length;

    // Calculate a consolidated probability score
    let totalRisk = mlProbability;
    
    // Boost score if VT flags it malicious
    if (vtMalicious > 0) {
      totalRisk = Math.max(totalRisk, 0.4 + (vtMalicious / 70) * 0.59);
    }
    // Boost score if AbuseIPDB flags it
    if (abuseConfidenceScore > 20) {
      totalRisk = Math.max(totalRisk, 0.3 + (abuseConfidenceScore / 100) * 0.69);
    }
    // Boost score if high heuristics alerts are present
    if (lengthFlag && httpsFlag && keywordsCount > 0) {
      totalRisk = Math.max(totalRisk, 0.5);
    }
    if (ipAddressFlag) {
      totalRisk = Math.max(totalRisk, 0.85); // raw IPs are extremely dangerous
    }

    const prediction = totalRisk > 0.4 ? 1 : 0;

    return NextResponse.json({
      prediction,
      probability: totalRisk,
      vtMalicious,
      vtSuspicious,
      abuseConfidenceScore,
      resolvedIp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Threat scanning failed" },
      { status: 500 }
    );
  }
}
