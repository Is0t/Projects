"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mbtiTypes } from "@/lib/mbti-data"

export function MBTIDescription() {
  const [selectedType, setSelectedType] = useState("INTJ")

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>MBTI Kişilik Tipleri</CardTitle>
        <CardDescription>16 farklı MBTI kişilik tipi hakkında bilgi edinin</CardDescription>

        <Tabs defaultValue="INTJ" onValueChange={setSelectedType} className="mt-4">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4 bg-slate-200 dark:bg-slate-800 p-1">
            {Object.keys(mbtiTypes).map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-slate-800 data-[state=active]:text-white dark:data-[state=active]:bg-slate-600 bg-transparent hover:bg-slate-300 dark:hover:bg-slate-700"
                style={{ backgroundColor: "transparent" }}
              >
                {type}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(mbtiTypes).map(([type, data]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{data.name}</h3>
                <p className="text-sm text-slate-500">{data.nickname}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Özellikler</h4>
                <ul className="grid gap-2 text-sm">
                  {data.characteristics.map((trait, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Güçlü Yönler</h4>
                <ul className="grid gap-2 text-sm">
                  {data.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Zayıf Yönler</h4>
                <ul className="grid gap-2 text-sm">
                  {data.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
      <CardContent className="pt-0">{/* Content moved to CardHeader */}</CardContent>
    </Card>
  )
}
