"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { analyzeTweets } from "@/lib/analyze-tweets"
import { useRouter } from "next/navigation"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".pkl")) {
      setError("Please upload a valid PKL file")
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Process the file
      const formData = new FormData()
      formData.append("file", file)

      // Call the server action to analyze tweets
      const result = await analyzeTweets(formData)

      // Complete the progress bar
      clearInterval(interval)
      setUploadProgress(100)

      // Redirect to results page with the MBTI type
      setTimeout(() => {
        router.push(`/results?type=${result.mbtiType}`)
      }, 500)
    } catch (err) {
      setError("Failed to analyze tweets. Please try again.")
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Your Twitter Data</CardTitle>
        <CardDescription>
          Upload the PKL file containing your Twitter data to analyze your personality type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
              {file ? <FileText className="w-8 h-8 text-slate-500" /> : <Upload className="w-8 h-8 text-slate-500" />}
            </div>
            <div className="text-center">
              {file ? (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  <label htmlFor="file-upload" className="font-medium text-primary hover:underline cursor-pointer">
                    Click to upload
                  </label>{" "}
                  or drag and drop your PKL file
                </div>
              )}
            </div>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".pkl"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-slate-500">
              {uploadProgress < 100 ? "Analyzing your tweets..." : "Analysis complete!"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
          {isUploading ? "Analyzing..." : "Analyze My Personality"}
        </Button>
      </CardFooter>
    </Card>
  )
}
