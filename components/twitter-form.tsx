"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Twitter, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { analyzeTweets } from "@/lib/analyze-tweets"
import { checkTwitterToken } from "@/lib/admin-service"
import { useRouter } from "next/navigation"

export function TwitterForm() {
  const [username, setUsername] = useState("")
  const [tweetCount, setTweetCount] = useState(100)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const result = await checkTwitterToken()
        setHasToken(result.hasToken)
      } catch (err) {
        console.error("Token kontrolü sırasında hata:", err)
        setHasToken(false)
      } finally {
        setCheckingToken(false)
      }
    }

    verifyToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      setError("Lütfen bir Twitter kullanıcı adı girin")
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      // Call the server action to analyze tweets
      const result = await analyzeTweets(username, tweetCount)

      // Complete the progress bar
      clearInterval(interval)
      setProgress(100)

      // Redirect to results page with the MBTI type
      setTimeout(() => {
        router.push(`/results?type=${result.mbtiType}&username=${username}`)
      }, 500)
    } catch (err: any) {
      setError(err.message || "Tweet analizi başarısız oldu. Lütfen kullanıcı adını kontrol edin ve tekrar deneyin.")
      setIsAnalyzing(false)
    }
  }

  if (checkingToken) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-slate-500">Sistem yapılandırması kontrol ediliyor...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Twitter Profili Analizi</CardTitle>
        <CardDescription>Twitter kullanıcı adınızı girin ve kaç tweet analiz edileceğini seçin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Twitter Kullanıcı Adı</Label>
            <div className="flex items-center">
              <div className="flex items-center px-3 border rounded-l-md bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <Twitter className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                id="username"
                placeholder="elonmusk"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-l-none"
                disabled={isAnalyzing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="tweet-count">Analiz Edilecek Tweet Sayısı</Label>
              <span className="text-sm text-slate-500">{tweetCount}</span>
            </div>
            <Slider
              id="tweet-count"
              min={50}
              max={500}
              step={50}
              value={[tweetCount]}
              onValueChange={(value) => setTweetCount(value[0])}
              disabled={isAnalyzing}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>50</span>
              <span>500</span>
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {progress < 30
                    ? "Tweetler alınıyor..."
                    : progress < 60
                      ? "Dil kalıpları işleniyor..."
                      : progress < 90
                        ? "Kişilik özellikleri belirleniyor..."
                        : "Analiz tamamlandı!"}
                </p>
                <p className="text-xs text-slate-500">
                  {progress < 100 ? "Profil analiz edilirken lütfen bekleyin" : "Sonuçlara yönlendiriliyorsunuz..."}
                </p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isAnalyzing || !username} className="w-full">
            {isAnalyzing ? (
              "Analiz Ediliyor..."
            ) : (
              <>
                Kişiliğimi Analiz Et <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
