"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Token için güvenli bir cookie adı
const TOKEN_COOKIE_NAME = "AAAAAAAAAAAAAAAAAAAAAGGB1AEAAAAArEb2S4wRAtORi56JOdQT6r74%2Fa4%3DB4kWlFG94zpzXWFxH9Ee8JSv0RSuJqdV83IlE0fkQnMz7pMBXg"

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

// Twitter API'sinden tweetleri çekme
export async function fetchTweets(username: string, count: number) {
  try {
    // Token'ı al
    const token = await getTwitterToken()

    // Twitter API URL'si
    const url = `https://api.twitter.com/2/users/by/username/${username}`

    // Kullanıcı ID'sini al
    const userResponse = await fetch(url, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      console.error("Twitter API kullanıcı hatası:", errorData)
      throw new Error(`Kullanıcı bulunamadı: ${errorData.errors?.[0]?.message || "Bilinmeyen hata"}`)
    }

    const userData = await userResponse.json()
    const userId = userData.data.id

    // Kullanıcının tweetlerini al
    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${Math.min(count, 100)}&tweet.fields=created_at,public_metrics,text`

    const tweetsResponse = await fetch(tweetsUrl, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
    })

    if (!tweetsResponse.ok) {
      const errorData = await tweetsResponse.json()
      console.error("Twitter API tweet hatası:", errorData)
      throw new Error(`Tweetler alınamadı: ${errorData.errors?.[0]?.message || "Bilinmeyen hata"}`)
    }

    const tweetsData = await tweetsResponse.json()

    // Tweetleri işle ve PKL formatında sakla (gerçek uygulamada)
    // Bu örnekte sadece tweet verilerini döndürüyoruz
    return {
      success: true,
      username,
      userId,
      tweets: tweetsData.data || [],
      tweetCount: tweetsData.data?.length || 0,
      // Gerçek uygulamada PKL dosya yolu
      pklFilePath: `/tmp/tweets_${username}_${Date.now()}.pkl`,
    }
  } catch (error: any) {
    console.error("Tweet çekerken hata:", error)
    throw new Error(error.message || "Tweetler alınamadı")
  }
}
