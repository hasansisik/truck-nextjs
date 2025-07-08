import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"


import data from "./data.json"

export default function Page() {
  return (
    <>
      <SectionCards />
      
      <DataTable data={data} />
    </>
  )
}