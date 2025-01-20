<template>
  <button :class="classes" @click="emit('click')">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
  interface IProps {
    size?: 'sm' | 'md' | 'lg'
    type?: 'outline' | 'primary' | 'black' | 'surface'
    disabled?: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    size: 'lg',
    type: 'primary',
    disabled: false
  })

  const emit = defineEmits<{
    click: []
  }>()

  const classes = computed(() => {
    return ['btn', `btn-${props.size}`, `btn-${props.type}`, { disabled: props.disabled }]
  })
</script>

<style lang="scss" scoped>
  .btn {
    color: var(--color-primary);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-lg {
    height: 58px;
  }
  .btn-md {
    height: 54px;
  }
  .btn-sm {
    height: 46px;
  }

  .btn-primary {
    background-color: var(--color-pink);
    color: var(--color-white);
    &:hover {
      opacity: 0.8;
    }
  }
  .btn-black {
    background-color: var(--color-primary);
    color: var(--color-white);
    &:hover {
      opacity: 0.8;
    }
  }
  .btn-surface {
    background-color: var(--color-surface);
    color: var(--color-secondary);
    &:hover {
      opacity: 0.8;
    }
  }
  .disabled {
    opacity: 0.8;
    cursor: not-allowed;
    pointer-events: none;
    &:hover {
      opacity: 0.4;
    }
  }
</style>
