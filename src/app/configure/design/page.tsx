import { db } from "@/db"
import { notFound } from "next/navigation"
import DesignConfigurator from "./DesignConfigurator"

const Page = async ({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) => {
  const id = searchParams?.id

  if (!id || typeof id !== "string") {
    return notFound()
  }

  const configuration = await db.configuration.findUnique({
    where: { id }
  })

  if (!configuration) {
    return notFound()
  }

  const { imageUrl, width, height } = configuration

  return <DesignConfigurator configId={configuration.id} imageDimensions={{ width, height }} imageUrl={imageUrl} />
}

export default Page
