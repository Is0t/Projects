import type React from "react"
import { requireAdminAuth } from "@/lib/auth-service"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Paneli | Twitter MBTI Analizi",
  description: "Twitter MBTI Analizi Yönetim Paneli",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin kimliğini doğrula (login sayfası hariç)
  if (typeof window === "undefined") {
    try {
      await requireAdminAuth()
    } catch (error) {
      // Hata durumunda, requireAdminAuth zaten yönlendirme yapacaktır
      // Bu nedenle burada bir şey yapmamıza gerek yok
    }
  }

  return <>{children}</>
}
