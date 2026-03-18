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

    const prompt = `คุณคือนักอ่านไพ่ทาโร่ผู้เชี่ยวชาญ จงสรุปคำทำนายเป็นภาษาไทยอย่างกระชับ (3-5 ประโยค) โดย:
- เชื่อมโยงไพ่ทุกใบเข้ากับหมวด "${topic}" และคำถาม "${question}"
- คำนึงถึงตำแหน่งของไพ่ในรูปแบบ "${spread}"
- ไพ่กลับหัวให้ตีความในแง่ท้าทาย/ระวัง
- น้ำเสียงอบอุ่น ลึกซึ้ง ให้กำลังใจ ไม่ยาวเกินไป
- ปิดท้ายด้วยข้อแนะนำสั้น ๆ 1 ประโยค

ไพ่ที่จั่วได้:
${cardDetails}

สรุปคำทำนาย:`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ reading: text });
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างคำทำนายได้" },
      { status: 500 }
    );
  }
}
