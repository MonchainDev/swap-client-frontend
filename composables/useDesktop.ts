export default function useDesktop() {
  const breakpoints = useBreakpoints(
    { large: 768 } // Will enable SSR mode and render like if the screen was 768px wide
  )

  const isDesktop = computed(() => {
    return breakpoints.greater('large').value
  })

  return { isDesktop }
}
