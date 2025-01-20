export function useErrorImage() {
  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    if (target) {
      target.src = '/token-default.png'
    }
  }

  return {
    handleImageError
  }
}
