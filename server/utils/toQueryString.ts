export default function toQueryString(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, values]) => {
    if (!values) return

    if (!Array.isArray(values)) {
      values = [values]
    }

    if (Array.isArray(values) && values.length === 0) return
    ;(values as string[]).forEach((value: string) => searchParams.append(key, value))
  })

  return searchParams.toString()
}
