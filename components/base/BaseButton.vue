<template>
  <button :class="classes" @click="emit('click')">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
  interface IProps {
    size?: 'sm' | 'md' | 'lg'
    type?: 'outline' | 'primary' | 'black' | 'surface' | 'linear'
    disabled?: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    size: 'lg',
    type: 'linear',
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
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-lg {
    height: 67px;
  }
  .btn-md {
    height: 54px;
  }
  .btn-sm {
    height: 36px;
  }

  .btn-linear {
    background: var(--color-linear-gradient);
    &:hover {
      opacity: 0.8;
    }
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
