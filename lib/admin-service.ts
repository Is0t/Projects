"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Token için güvenli bir cookie adı
const TOKEN_COOKIE_NAME =
  "AAAAAAAAAAAAAAAAAAAAAGGB1AEAAAAArEb2S4wRAtORi56JOdQT6r74%2Fa4%3DB4kWlFG94zpzXWFxH9Ee8JSv0RSuJqdV83IlE0fkQnMz7pMBXg"
// Model dosyası adı için cookie
const MODEL_FILE_COOKIE_NAME = "mbti_model_file"
// Model URL'si için cookie
const MODEL_URL_COOKIE_NAME = "mbti_model_url"

// Token'ı kaydetme
export async function saveTwitterToken(token: string) {
  // Token'ı doğrula
  try {
    // Token formatını kontrol et (basit bir doğrulama)
    if (!token.startsWith("AAAA") && !token.startsWith("Bearer ")) {
      throw new Error("Geçersiz token formatı")
    }

    // Token'ı cookie'ye kaydet (gerçek uygulamada daha güvenli bir yöntem kullanılmalıdır)
    cookies().set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: "/",
    })

    // Admin sayfasını yeniden doğrula
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Token kaydedilirken hata:", error)
    throw new Error("Token kaydedilemedi")
  }
}

// Eğitilmiş modeli yükleme ve kaydetme
export async function uploadModelFile(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("Dosya bulunamadı")
    }

    if (!file.name.endsWith(".pkl")) {
      throw new Error("Geçerli bir PKL model dosyası yükleyin")
    }

    // Dosya adını cookie'ye kaydet
    // Not: Gerçek uygulamada, dosya içeriği bir veritabanına veya bulut depolama hizmetine kaydedilmelidir
    const fileName = `mbti_model_${Date.now()}.pkl`

    cookies().set({
      name: MODEL_FILE_COOKIE_NAME,
      value: fileName,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: "/",
    })

    console.log(`Model dosyası başarıyla yüklendi: ${fileName}`)

    return {
      success: true,
      message: "Model dosyası başarıyla yüklendi",
      fileName,
    }
  } catch (error: any) {
    console.error("Model dosyası yüklenirken hata:", error)
    throw new Error(error.message || "Model dosyası yüklenemedi")
  }
}

// Model dosya yolunu alma
export async function getModelPath() {
  const modelFile = cookies().get(MODEL_FILE_COOKIE_NAME)
  return modelFile?.value
}

// Model URL'sini alma
export async function getModelUrl() {
  const modelUrl = cookies().get(MODEL_URL_COOKIE_NAME)
  return modelUrl?.value
}

// Token'ın varlığını kontrol etme
export async function checkTwitterToken() {
  const token = cookies().get(TOKEN_COOKIE_NAME)
  return { hasToken: !!token?.value }
}

// Token'ı alma (sadece server action'larda kullanılmalıdır)
export async function getTwitterToken() {
  const token = cookies().get(TOKEN_COOKIE_NAME)
  if (!token?.value) {
    throw new Error("Twitter API token'ı bulunamadı")
  }
  return token.value
}
