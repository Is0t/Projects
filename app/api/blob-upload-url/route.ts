import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Dosya adı belirtilmedi" }, { status: 400 })
  }

  try {
    // Yükleme URL'si oluştur
    const { url, uploadUrl } = await put(`models/${filename}`, {
      access: "public",
      handleUploadUrl: true, // Client-side upload için gerekli
    })

    return NextResponse.json({ uploadUrl, blobUrl: url })
  } catch (error) {
    console.error("Blob URL oluşturma hatası:", error)
    return NextResponse.json({ error: "Upload URL oluşturulamadı" }, { status: 500 })
  }
}
