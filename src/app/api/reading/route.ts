import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

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
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    try {
      // Strip markdown code blocks if present
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ reading: parsed });
    } catch {
      // Fallback: return as plain text if JSON parse fails
      return NextResponse.json({
        reading: {
          trend: "neutral",
          trendText: "กำลังอ่านไพ่ให้คุณ",
          summary: text,
          advice: "",
          cardInsights: [],
        },
      });
    }
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างคำทำนายได้" },
      { status: 500 }
    );
  }
}
