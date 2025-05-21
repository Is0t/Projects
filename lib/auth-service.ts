"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Güvenli bir cookie adı
const AUTH_COOKIE_NAME = "admin_auth_token"

// Basit bir token oluşturma fonksiyonu
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Admin kimlik bilgileri (gerçek uygulamada veritabanında saklanmalıdır)
// NOT: Bu bilgileri .env dosyasında saklamak daha güvenlidir
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "mbti2024secure"

// Admin girişi
export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Kimlik bilgilerini kontrol et
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Başarılı giriş - token oluştur ve cookie'ye kaydet
    const token = generateToken()

    cookies().set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 gün
      path: "/",
    })

    revalidatePath("/admin")
    return { success: true }
  }

  // Başarısız giriş
  return { success: false, error: "Geçersiz kullanıcı adı veya şifre" }
}

// Admin çıkışı
export async function adminLogout() {
  cookies().delete(AUTH_COOKIE_NAME)
  revalidatePath("/admin")
  redirect("/admin/login")
}

// Admin kimlik doğrulama kontrolü
export async function checkAdminAuth() {
  const token = cookies().get(AUTH_COOKIE_NAME)
  return { isAuthenticated: !!token?.value }
}

// Admin kimliğini doğrula ve yönlendir
export async function requireAdminAuth() {
  const { isAuthenticated } = await checkAdminAuth()

  if (!isAuthenticated) {
    redirect("/admin/login")
  }
}
