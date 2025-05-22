"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Key, BrainCircuit } from "lucide-react"
import { saveTwitterToken } from "@/lib/admin-service"
import { adminLogout } from "@/lib/auth-service"
import { ModelUploader } from "@/components/model-uploader"

export default function AdminPage() {
  const [token, setToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError("Lütfen bir bearer token girin")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await saveTwitterToken(token)
      setSuccess(true)
      setToken("")
    } catch (err) {
      setError("Token kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-4xl px-4 py-12 mx-auto">
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Twitter MBTI Analizi Yönetim Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400">API yapılandırması ve model yönetimi</p>
        </div>

        <Tabs defaultValue="api-token" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="api-token">
              <Key className="w-4 h-4 mr-2" />
              API Token
            </TabsTrigger>
            <TabsTrigger value="model-upload">
              <BrainCircuit className="w-4 h-4 mr-2" />
              MBTI Model
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-token">
            <Card>
              <CardHeader>
                <CardTitle>Bearer Token Yapılandırması</CardTitle>
                <CardDescription>Twitter API'sine erişmek için bearer token'ınızı girin</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 border-green-500 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertTitle>Başarılı</AlertTitle>
                    <AlertDescription>Twitter API token'ı başarıyla kaydedildi</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleTokenSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="token">Twitter API Bearer Token</Label>
                      <Input
                        id="token"
                        type="password"
                        placeholder="Bearer token'ınızı girin"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        Bu token güvenli bir şekilde saklanacak ve yalnızca Twitter API istekleri için kullanılacaktır
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button onClick={handleTokenSubmit} disabled={isSubmitting || !token} className="w-full">
                  {isSubmitting ? "Kaydediliyor..." : "Token'ı Kaydet"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="model-upload">
            <Card>
              <CardHeader>
                <CardTitle>MBTI Model Yükleme</CardTitle>
                <CardDescription>Eğitilmiş MBTI sınıflandırma modelini yükleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <ModelUploader />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center flex justify-center gap-4">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Ana Sayfaya Dön
          </Button>
          <Button variant="destructive" onClick={adminLogout}>
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  )
}
