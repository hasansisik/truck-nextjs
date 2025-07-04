import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconTruckDelivery } from "@tabler/icons-react"

import data from "./data.json"

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Dashboard İstatistikleri</h2>
          <Link href="/dashboard/tow-trucks">
            <Button variant="outline" className="flex items-center gap-2">
              <IconTruckDelivery size={18} />
              Çekici Yönetimi
            </Button>
          </Link>
        </div>
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  )
}
