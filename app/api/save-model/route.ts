import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Model dosyası için cookie adları
const MODEL_FILE_COOKIE_NAME = "mbti_model_file"
const MODEL_URL_COOKIE_NAME = "mbti_model_url"

export async function POST(request: Request) {
  try {
    const { blobUrl, fileName } = await request.json()

    if (!blobUrl || !fileName) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
    }

    // Cookie'lere kaydet
    cookies().set({
      name: MODEL_FILE_COOKIE_NAME,
      value: fileName,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: "/",
    })

    cookies().set({
      name: MODEL_URL_COOKIE_NAME,
      value: blobUrl,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Model kaydetme hatası:", error)
    return NextResponse.json({ error: "Model kaydedilemedi" }, { status: 500 })
  }
}
