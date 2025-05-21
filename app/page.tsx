import { TwitterForm } from "@/components/twitter-form"
import { MBTIDescription } from "@/components/mbti-description"
import { AdminFloatingPanel } from "@/components/admin-floating-panel"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-5xl px-4 py-12 mx-auto">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Twitter MBTI Kişilik Analizi</h1>
          <p className="max-w-[600px] mx-auto text-slate-500 dark:text-slate-400 md:text-xl">
            Twitter paylaşımlarınıza göre kişilik tipinizi keşfedin
          </p>
        </div>

        <div className="grid gap-8 mt-12">
          <TwitterForm />
          <MBTIDescription />
        </div>
      </div>
      <AdminFloatingPanel />
    </div>
  )
}
