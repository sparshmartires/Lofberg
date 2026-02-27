import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ slug: string[] }>
}

function normalizeLegacyResetLink(slug: string[]) {
  const decoded = decodeURIComponent(slug.join("/"))
  const queryStart = decoded.indexOf("?")

  if (queryStart === -1) {
    return { token: "", email: "" }
  }

  const query = decoded.slice(queryStart + 1).replace(/\+/g, "%2B")
  const params = new URLSearchParams(query)

  return {
    token: params.get("token") ?? "",
    email: params.get("email") ?? "",
  }
}

export default async function LegacyResetPasswordRedirect({ params }: PageProps) {
  const { slug } = await params
  const { token, email } = normalizeLegacyResetLink(slug)

  if (!token) {
    redirect("/forgot-password")
  }

  const nextUrl = email
    ? `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    : `/reset-password?token=${encodeURIComponent(token)}`

  redirect(nextUrl)
}
