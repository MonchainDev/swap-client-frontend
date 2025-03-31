import { ref, watch } from 'vue'

/**
 * Composition function that returns the previous value of a reactive reference
 * @param value The value to track
 * @returns The previous value
 */
export function usePreviousValue<T>(value: T) {
  const previousValue = ref<T | undefined>(undefined)
  const currentValue = ref<T>(value)

  watch(
    () => value,
    (newValue, oldValue) => {
      previousValue.value = oldValue
      currentValue.value = newValue
    },
    { immediate: false }
  )

  return previousValue
}
