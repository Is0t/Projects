"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, BrainCircuit } from "lucide-react"

export function ModelUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setSuccess(false)

    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".pkl")) {
      setError("Lütfen geçerli bir PKL model dosyası seçin")
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(false)

    try {
      // Yükleme URL'si almak için API çağrısı
      const response = await fetch("/api/blob-upload-url?filename=" + encodeURIComponent(file.name))

      if (!response.ok) {
        throw new Error("Upload URL alınamadı")
      }

      const { uploadUrl, blobUrl } = await response.json()

      // İlerleme takibi için XMLHttpRequest kullanın
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", uploadUrl)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Blob URL'yi kaydetmek için API çağrısı
          const saveResponse = await fetch("/api/save-model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blobUrl, fileName: file.name }),
          })

          if (saveResponse.ok) {
            setSuccess(true)
            setFile(null)
            router.refresh()
          } else {
            throw new Error("Model kaydedilemedi")
          }
        } else {
          throw new Error("Dosya yüklenemedi")
        }
        setIsUploading(false)
      }

      xhr.onerror = () => {
        setError("Yükleme sırasında bir hata oluştu")
        setIsUploading(false)
      }

      // Dosyayı yükle
      xhr.send(file)
    } catch (err: any) {
      setError(err.message || "Dosya yüklenirken bir hata oluştu")
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 text-green-500">
          <CheckCircle2 className="w-4 h-4" />
          <AlertTitle>Başarılı</AlertTitle>
          <AlertDescription>Model dosyası başarıyla yüklendi</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-md border-slate-200 dark:border-slate-700">
        <BrainCircuit className="w-10 h-10 mb-4 text-slate-400" />
        <div className="mb-2 text-sm font-medium">{file ? file.name : "Dosya seçilmedi"}</div>
        <input id="model-file" type="file" accept=".pkl" onChange={handleFileChange} className="hidden" />
        <Button variant="outline" onClick={() => document.getElementById("model-file")?.click()} disabled={isUploading}>
          Model Dosyası Seç
        </Button>
        <p className="mt-2 text-xs text-center text-slate-500">
          Lütfen eğitilmiş MBTI sınıflandırma modelini içeren .pkl dosyasını seçin (90MB'a kadar)
        </p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center text-slate-500">
            {uploadProgress < 100 ? `Yükleniyor... %${uploadProgress}` : "Yükleme tamamlandı!"}
          </p>
        </div>
      )}

      <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
        {isUploading ? "Yükleniyor..." : "Model Dosyasını Yükle"}
      </Button>
    </div>
  )
}
