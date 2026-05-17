import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Sadece PDF ve TXT dosyaları desteklenir." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (file.type === "application/pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text;
    } else {
      extractedText = buffer.toString("utf-8");
    }

    const preview = extractedText.substring(0, 300).replace(/\n+/g, " ").trim();

    return NextResponse.json({
      success: true,
      fileName: file.name,
      charCount: extractedText.length,
      preview,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Dosya işlenemedi." }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
