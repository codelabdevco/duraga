import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

interface ReadingResult {
  trend: string;
  trendText: string;
  summary: string;
  advice: string;
  cardInsights: string[];
}

const FALLBACK: ReadingResult = {
  trend: "neutral",
  trendText: "",
  summary: "",
  advice: "",
  cardInsights: [],
};

function extractJSON(raw: string): ReadingResult {
  // Strategy 1: direct parse
  try {
    return validateReading(JSON.parse(raw));
  } catch { /* continue */ }

  // Strategy 2: strip ```json ... ``` (various formats)
  try {
    const stripped = raw
      .replace(/^[\s\S]*?```(?:json)?[\s\n]*/i, "")
      .replace(/[\s\n]*```[\s\S]*$/, "")
      .trim();
    return validateReading(JSON.parse(stripped));
  } catch { /* continue */ }

  // Strategy 3: extract first { ... } block
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return validateReading(JSON.parse(raw.slice(start, end + 1)));
    }
  } catch { /* continue */ }

  // Strategy 4: fix truncated JSON (max_tokens cut it)
  try {
    const start = raw.indexOf("{");
    if (start !== -1) {
      let truncated = raw.slice(start);
      const openQuotes = (truncated.match(/"/g) || []).length;
      if (openQuotes % 2 !== 0) truncated += '"';
      const openBrackets = (truncated.match(/\[/g) || []).length - (truncated.match(/\]/g) || []).length;
      for (let i = 0; i < openBrackets; i++) truncated += "]";
      const openBraces = (truncated.match(/\{/g) || []).length - (truncated.match(/\}/g) || []).length;
      for (let i = 0; i < openBraces; i++) truncated += "}";
      return validateReading(JSON.parse(truncated));
    }
  } catch { /* continue */ }

  // All strategies failed — return raw text as summary
  console.error("JSON extraction failed, raw:", raw.slice(0, 200));
  return { ...FALLBACK, summary: raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim() };
}

function validateReading(obj: Record<string, unknown>): ReadingResult {
  return {
    trend: typeof obj.trend === "string" ? obj.trend : "neutral",
    trendText: typeof obj.trendText === "string" ? obj.trendText : "",
    summary: typeof obj.summary === "string" ? obj.summary : "",
    advice: typeof obj.advice === "string" ? obj.advice : "",
    cardInsights: Array.isArray(obj.cardInsights)
      ? obj.cardInsights.map((s) => (typeof s === "string" ? s : ""))
      : [],
  };
}

interface CardInfo {
  nameTh: string;
  nameEn: string;
  meaningTh?: string;
  meaning: string;
  isReversed: boolean;
  positionName: string;
}

interface ReadingRequest {
  topic: string;
  spread: string;
  question: string;
  cards: CardInfo[];
}

export async function POST(req: NextRequest) {
  try {
    const { topic, spread, question, cards } = (await req.json()) as ReadingRequest;

    const cardDetails = cards
      .map(
        (c, i) =>
          `${i + 1}. ตำแหน่ง "${c.positionName}" — ${c.nameTh} (${c.nameEn})${c.isReversed ? " [กลับหัว]" : ""}\n   ความหมาย: ${c.meaningTh || c.meaning}`
      )
      .join("\n");

    const prompt = `คุณคือนักอ่านไพ่ทาโร่ผู้เชี่ยวชาญ อ่านไพ่ให้ผู้ใช้ที่เป็นคนทั่วไป (ไม่ใช่ผู้เชี่ยวชาญ) ให้เข้าใจง่าย

หมวด: "${topic}"
คำถาม: "${question}"
รูปแบบการวาง: "${spread}"

ไพ่ที่จั่วได้:
${cardDetails}

ตอบเป็น JSON เท่านั้น ตามโครงสร้างนี้:
{
  "trend": "very_positive" | "positive" | "neutral" | "caution" | "challenging",
  "trendText": "คำอธิบายแนวโน้มสั้นๆ 1 ประโยค เช่น พลังงานโดยรวมเป็นไปในทางที่ดี",
  "summary": "สรุปคำทำนายภาพรวม 3-4 ประโยค ภาษาง่ายๆ อบอุ่น เหมือนพี่สาวคุยให้ฟัง ไม่ใช้ศัพท์ทางเทคนิค ไม่ต้องมี ** หรือ markdown",
  "advice": "คำแนะนำปฏิบัติได้จริง 1-2 ประโยค ชัดเจน เช่น ลองพูดคุยกับคนที่คุณไว้ใจ",
  "cardInsights": [
    "วิเคราะห์ไพ่ใบที่ 1 ตามตำแหน่ง 2-3 ประโยค ภาษาง่าย",
    "วิเคราะห์ไพ่ใบที่ 2 ..."
  ]
}

กฎ:
- trend ให้ประเมินจากภาพรวมไพ่ทุกใบรวมกัน
- trendText ต้องสั้น กระชับ เข้าใจง่าย
- summary เขียนเหมือนเล่าเรื่อง ไม่ใช่ list
- cardInsights ต้องมีจำนวนเท่ากับไพ่ที่จั่ว (${cards.length} ใบ) เชื่อมโยงกับตำแหน่งและคำถาม
- ไพ่กลับหัวให้ตีความว่าเป็นสิ่งที่ต้องระวังหรือพัฒนา ไม่ใช่เรื่องร้าย
- ทุกอย่างเป็นภาษาไทย ห้ามมี markdown หรือ formatting
- ตอบ JSON เท่านั้น ไม่มีข้อความอื่นก่อนหรือหลัง`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Robust JSON extraction: try multiple strategies
    const parsed = extractJSON(text);
    return NextResponse.json({ reading: parsed });
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างคำทำนายได้" },
      { status: 500 }
    );
  }
}
