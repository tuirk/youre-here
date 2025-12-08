import { JournalEntry } from "@/types/event";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface SentimentResult {
  color: string;
  intensity: number;
  categories: string[];
  temporalScope: "point" | "smear" | "forward";
  endDateOffset?: number; // days from anchor date
}

const SENTIMENT_PROMPT = `You are a sentiment analysis engine for a reflective journal app. Analyze the journal entry and return a JSON object with these fields:

1. "categories": array of 1-3 emotion categories from this list: joy, sadness, anger, anxiety, love, hope, mixed, neutral
2. "intensity": number 0.0-1.0 representing emotional strength (0.1 = barely there, 1.0 = overwhelming)
3. "temporalScope": one of:
   - "point" — a single moment or day
   - "smear" — a feeling spanning time (e.g. "the past week", "since March")
   - "forward" — anticipation about the future (e.g. "next month I'm worried about...")
4. "endDateOffset": only if temporalScope is "smear" or "forward", the number of days the feeling spans (negative for past, positive for future). For example "the past week" = -7, "next month" = 30.

Rules:
- Handle nuance: "I keep telling myself it's fine but I can't sleep" is anxiety, NOT joy
- Mixed emotions are valid: someone can feel joy AND sadness simultaneously
- "neutral" is for genuinely flat entries, not for entries you're unsure about
- Intensity should reflect the emotional weight of the writing, not just whether emotions are named

Return ONLY valid JSON, no markdown, no explanation.

Example input: "today was rough. got into it with my boss again but then sarah called and honestly that made everything better"
Example output: {"categories":["anger","love"],"intensity":0.7,"temporalScope":"point"}

Example input: "the past two weeks have been this slow dread about the move"
Example output: {"categories":["anxiety"],"intensity":0.6,"temporalScope":"smear","endDateOffset":-14}`;

export const analyzeEntry = async (
  text: string,
  apiKey: string
): Promise<SentimentResult | null> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SENTIMENT_PROMPT },
              { text: `Journal entry:\n"${text}"` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    // Strip markdown fences if present
    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as SentimentResult;

    // Validate
    if (!parsed.categories || typeof parsed.intensity !== "number") return null;

    return {
      categories: parsed.categories,
      intensity: Math.max(0, Math.min(1, parsed.intensity)),
      temporalScope: parsed.temporalScope || "point",
      endDateOffset: parsed.endDateOffset,
      color: "", // filled by color mapping
    };
  } catch (e) {
    console.error("Gemini analysis failed:", e);
    return null;
  }
};

// --- Region summary generation ---

const SUMMARY_PROMPT = `You are a reflective journal companion. Given a set of journal entries from around the same time period, write a brief 1-2 sentence summary of that period.

Tone: warm, observational, reflective — like a thoughtful friend looking back. Not clinical or formal.

Example: "A heavy week — you kept returning to the conversation with your mother. Some brightness around Wednesday when coffee with a friend broke through."

Return ONLY the summary text, no quotes, no explanation.`;

export const generateRegionSummary = async (
  entries: JournalEntry[],
  apiKey: string
): Promise<string | null> => {
  if (entries.length === 0) return null;

  const entriesText = entries
    .map((e) => {
      const d = new Date(e.anchorDate);
      return `[${d.toLocaleDateString()}] ${e.text}`;
    })
    .join("\n\n");

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SUMMARY_PROMPT },
              { text: `Journal entries:\n${entriesText}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
};
