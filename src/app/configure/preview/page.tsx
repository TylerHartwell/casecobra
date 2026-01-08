import { db } from "@/db"
import { notFound } from "next/navigation"
import DesignPreview from "./DesignPreview"

const Page = async ({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => {
  const resolvedSearchParams = await searchParams
  const id = resolvedSearchParams.id

  if (!id || typeof id !== "string") {
    return notFound()
  }

  const configuration = await db.configuration.findUnique({
    where: { id }
  })

  if (!configuration) {
    return notFound()
  }

  return <DesignPreview configuration={configuration} />
}

export default Page
