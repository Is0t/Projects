"use server"

import { revalidatePath } from "next/cache"
import { fetchTweets } from "./twitter-service"
import { getModelPath, getModelUrl } from "./admin-service"

// Tweet analizi yapan fonksiyon
export async function analyzeTweets(username: string, tweetCount: number) {
  try {
    // Twitter API'sinden tweetleri çek
    const tweetData = await fetchTweets(username, tweetCount)
    const tweets = tweetData.tweets || []

    // Tweet içeriklerini birleştir
    const allTweetText = tweets.map((tweet: any) => tweet.text || "").join("\n")

    // Eğitilmiş modeli kontrol et
    const modelPath = await getModelPath()
    const modelUrl = await getModelUrl()
    let mbtiType = ""

    if (modelPath && modelUrl) {
      console.log(`Eğitilmiş model kullanılıyor: ${modelPath}`)
      console.log(`Model URL: ${modelUrl}`)

      // Gerçek bir uygulamada, burada modelUrl kullanarak PKL dosyasını işleyecek bir API çağrısı yapılabilir
      // Örneğin:
      // const response = await fetch('https://your-python-api.com/predict', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: allTweetText, modelUrl })
      // });
      // const result = await response.json();
      // mbtiType = result.mbtiType;

      // Şimdilik basit bir simülasyon yapıyoruz
      mbtiType = await simulatePredictionWithModel(allTweetText)
    } else {
      console.log("Eğitilmiş model bulunamadı, basit analiz kullanılıyor")
      // Model yoksa basit analiz kullan
      mbtiType = determineMBTIFromText(allTweetText)
    }

    // Sonuçlar sayfasını yeniden doğrula
    revalidatePath("/results")

    return {
      success: true,
      mbtiType,
      tweetCount: tweets.length,
      username,
    }
  } catch (error: any) {
    console.error("Tweet analizi sırasında hata:", error)
    throw new Error(error.message || "Tweet analizi başarısız oldu")
  }
}

// PKL dosyası ile tahmin yapma simülasyonu
async function simulatePredictionWithModel(tweetText: string): Promise<string> {
  // Bu fonksiyon gerçek bir PKL dosyası işleme yerine geçici bir simülasyon yapar
  // Gerçek uygulamada, burada bir API çağrısı veya serverless function kullanılabilir

  // Tweet içeriğine göre basit bir tahmin algoritması
  // Bu, gerçek bir model yerine geçici bir çözümdür

  // Örnek: Tweet içeriğindeki bazı anahtar kelimelere göre MBTI tipi tahmin et
  const textLower = tweetText.toLowerCase()

  // Basit bir kelime sayma yaklaşımı (gerçek bir model daha karmaşık olacaktır)
  const typeIndicators = {
    E: (textLower.match(/biz|hep beraber|parti|etkinlik|arkadaşlar|sosyal|konuşmak/g) || []).length,
    I: (textLower.match(/ben|düşünmek|kitap|yalnız|sakin|dinlenmek|okumak/g) || []).length,
    S: (textLower.match(/gerçek|somut|pratik|detay|şimdi|bugün|kesin/g) || []).length,
    N: (textLower.match(/fikir|gelecek|hayal|olasılık|teori|vizyon|anlam/g) || []).length,
    T: (textLower.match(/mantık|analiz|sistem|verimli|doğru|yanlış|karar/g) || []).length,
    F: (textLower.match(/hissetmek|değer|önemsemek|empati|duygu|sevgi|destek/g) || []).length,
    J: (textLower.match(/plan|düzen|kontrol|program|hedef|tamamlamak|karar/g) || []).length,
    P: (textLower.match(/seçenek|esnek|spontane|keşfetmek|değişim|uyum|belki/g) || []).length,
  }

  // En yüksek skora sahip tipleri seç
  const mbtiType = [
    typeIndicators.E > typeIndicators.I ? "E" : "I",
    typeIndicators.S > typeIndicators.N ? "S" : "N",
    typeIndicators.T > typeIndicators.F ? "T" : "F",
    typeIndicators.J > typeIndicators.P ? "J" : "P",
  ].join("")

  // Gerçek bir uygulamada, burada PKL dosyasından yüklenen modeli kullanarak tahmin yapılır
  console.log(`Tweet analizi tamamlandı, tahmin edilen MBTI tipi: ${mbtiType}`)

  return mbtiType
}

// Metin içeriğine göre basit bir MBTI tipi belirleme (yedek/fallback metod)
function determineMBTIFromText(text: string) {
  // Gerçek bir uygulamada, burada NLP ve makine öğrenimi kullanılacaktır
  // Bu basit örnek için, bazı anahtar kelimelere göre tip belirliyoruz

  const textLower = text.toLowerCase()

  // E vs I (Dışa dönük vs İçe dönük)
  const eScore = (textLower.match(/biz|hep beraber|parti|etkinlik|arkadaşlar|sosyal|konuşmak/g) || []).length
  const iScore = (textLower.match(/ben|düşünmek|kitap|yalnız|sakin|dinlenmek|okumak/g) || []).length

  // S vs N (Algısal vs Sezgisel)
  const sScore = (textLower.match(/gerçek|somut|pratik|detay|şimdi|bugün|kesin/g) || []).length
  const nScore = (textLower.match(/fikir|gelecek|hayal|olasılık|teori|vizyon|anlam/g) || []).length

  // T vs F (Düşünen vs Hisseden)
  const tScore = (textLower.match(/mantık|analiz|sistem|verimli|doğru|yanlış|karar/g) || []).length
  const fScore = (textLower.match(/hissetmek|değer|önemsemek|empati|duygu|sevgi|destek/g) || []).length

  // J vs P (Yargılayan vs Algılayan)
  const jScore = (textLower.match(/plan|düzen|kontrol|program|hedef|tamamlamak|karar/g) || []).length
  const pScore = (textLower.match(/seçenek|esnek|spontane|keşfetmek|değişim|uyum|belki/g) || []).length

  // Skorlara göre MBTI tipini belirle
  const e_i = eScore > iScore ? "E" : "I"
  const s_n = sScore > nScore ? "S" : "N"
  const t_f = tScore > fScore ? "T" : "F"
  const j_p = jScore > pScore ? "J" : "P"

  return `${e_i}${s_n}${t_f}${j_p}`
}
