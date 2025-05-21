import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Twitter } from "lucide-react"
import { mbtiTypes } from "@/lib/mbti-data"
import { AdminFloatingPanel } from "@/components/admin-floating-panel"

export default function ResultsPage({ searchParams }: { searchParams: { type?: string; username?: string } }) {
  const mbtiType = searchParams.type
  const username = searchParams.username || "kullanıcı"

  // Redirect if no type is provided
  if (!mbtiType || !mbtiTypes[mbtiType as keyof typeof mbtiTypes]) {
    redirect("/")
  }

  const personalityData = mbtiTypes[mbtiType as keyof typeof mbtiTypes]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-4xl px-4 py-12 mx-auto">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">MBTI Sonuçlarınız</h1>
          <p className="max-w-[600px] mx-auto text-slate-500 dark:text-slate-400 md:text-xl">
            <span className="font-medium">@{username}</span>'in Twitter aktivitesine göre, kişilik tipi:
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{mbtiType}</CardTitle>
            <CardDescription className="text-xl">{personalityData.name}</CardDescription>
            <p className="mt-2 text-slate-500">{personalityData.nickname}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Kişilik Analizi</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Temel Özellikler</h4>
                    <ul className="grid gap-2 text-sm">
                      {personalityData.characteristics.map((trait, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Güçlü Yönler</h4>
                    <ul className="grid gap-2 text-sm">
                      {personalityData.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Zayıf Yönler</h4>
                    <ul className="grid gap-2 text-sm">
                      {personalityData.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500">✗</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Kariyer Önerileri</h4>
                    <ul className="grid gap-2 text-sm">
                      {personalityData.careers.map((career, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">→</span>
                          <span>{career}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="mb-4 text-sm text-slate-500">
                Diğer kişilik tipleri hakkında daha fazla bilgi edinmek ister misiniz?
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/">Başka Bir Twitter Profili Analiz Et</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`https://twitter.com/${username}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4 mr-2" />
                    Profili Görüntüle
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AdminFloatingPanel />
    </div>
  )
}
