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
import { saveTwitterToken, uploadModelFile } from "@/lib/admin-service"
import { Progress } from "@/components/ui/progress"
import { adminLogout } from "@/lib/auth-service"

export default function AdminPage() {
  const [token, setToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)
    setUploadSuccess(false)

    if (!file) return

    if (!file.name.endsWith(".pkl")) {
      setUploadError("Lütfen geçerli bir PKL model dosyası seçin")
      return
    }

    setModelFile(file)
  }

  const handleFileUpload = async () => {
    if (!modelFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      // Simüle edilmiş yükleme ilerleme durumu
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Model dosyasını yükle
      const formData = new FormData()
      formData.append("file", modelFile)

      await uploadModelFile(formData)

      // Yükleme çubuğunu tamamla
      clearInterval(interval)
      setUploadProgress(100)
      setUploadSuccess(true)
      setModelFile(null)

      // Dosya seçim alanını sıfırla
      const fileInput = document.getElementById("model-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err: any) {
      setUploadError(err.message || "Model dosyası yüklenirken bir hata oluştu")
    } finally {
      setIsUploading(false)
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
                {uploadError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {uploadSuccess && (
                  <Alert className="mb-4 border-green-500 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertTitle>Başarılı</AlertTitle>
                    <AlertDescription>MBTI model dosyası başarıyla yüklendi</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-file">Eğitilmiş MBTI Model Dosyası (.pkl)</Label>
                    <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-md border-slate-200 dark:border-slate-700">
                      <BrainCircuit className="w-10 h-10 mb-4 text-slate-400" />
                      <div className="mb-2 text-sm font-medium">{modelFile ? modelFile.name : "Dosya seçilmedi"}</div>
                      <input id="model-file" type="file" accept=".pkl" onChange={handleFileChange} className="hidden" />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("model-file")?.click()}
                        disabled={isUploading}
                      >
                        Model Dosyası Seç
                      </Button>
                      <p className="mt-2 text-xs text-center text-slate-500">
                        Lütfen eğitilmiş MBTI sınıflandırma modelini içeren .pkl dosyasını seçin
                      </p>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-center text-slate-500">
                        {uploadProgress < 100 ? "Model yükleniyor..." : "Yükleme tamamlandı!"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleFileUpload} disabled={isUploading || !modelFile} className="w-full">
                  {isUploading ? "Yükleniyor..." : "Model Dosyasını Yükle"}
                </Button>
              </CardFooter>
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
