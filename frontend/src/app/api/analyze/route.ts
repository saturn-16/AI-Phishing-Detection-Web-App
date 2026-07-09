import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const { url, isPhishing, probability, features, vtMalicious, abuseConfidenceScore } = await req.json();

    const prompt = `
Analyze the following URL scan result:
URL: ${url}
Verdict: ${isPhishing ? "PHISHING (High Risk)" : "SAFE (Low Risk)"}
Risk Probability: ${Math.round(probability * 100)}%
Heuristic Signals Extracted:
${JSON.stringify(features, null, 2)}

Global Threat Database Intel:
- VirusTotal Engine Detections: ${vtMalicious || 0} malicious engines flagged
- AbuseIPDB Confidence Score: ${abuseConfidenceScore || 0}% abuse confidence

CRITICAL FACTUAL ENFORCEMENT RULES:
1. You must ONLY write factual information that is directly supported by the results. For example, if VirusTotal detections are 0, you must state that no engines flagged it. If it is 16, state exactly 16. Do not hallucinate or make up false detection numbers.
2. If the URL is safe, write safe explanations. If it is a phishing link, explain why based on the flags.

HIGHLIGHTING RULES:
You must wrap key metrics, verdicts, security designations, and critical threat findings in double asterisks **like this** (e.g. **phishing**, **safe**, **16 malicious engines**, **0% abuse confidence**, **Not Secure**, **HTTPS encryption**, **suspicious keywords**). These will be parsed as highlighted text in our UI.

You must return a JSON object with exactly the following three keys:
1. "lexicalAnalysis" - A detailed 2-sentence explanation of why the URL structure, length, keywords, or subdomain patterns are safe or dangerous.
2. "protocolSecurity" - A detailed 2-sentence explanation of the URL's protocol (HTTPS/SSL) safety or vulnerability.
3. "threatIntel" - A detailed 2-sentence explanation summarizing the global threat database hits (VirusTotal engine counts and AbuseIPDB confidence scores) and what they imply.

Ensure the responses are specific to this URL and highly professional. Return only the JSON object.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert security system. Respond only with valid JSON as requested, with no conversational prefix or suffix.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("GROQ API ERROR RESPONSE:", response.status, errText);
      return NextResponse.json(
        { error: `Groq API error: ${errText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Invalid response from Groq API" },
        { status: 500 }
      );
    }

    const parsedContent = JSON.parse(content);
    return NextResponse.json(parsedContent);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}
