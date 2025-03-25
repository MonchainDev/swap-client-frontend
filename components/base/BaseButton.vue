<template>
  <button :class="classes" class="flex items-center justify-center gap-2" @click="emit('click')">
    <BaseLoadingButton v-if="props.loading" />
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
  interface IProps {
    size?: 'sm' | 'md' | 'lg'
    type?: 'outline' | 'primary' | 'black' | 'surface' | 'linear'
    disabled?: boolean
    loading?: boolean
  }

  const props = withDefaults(defineProps<IProps>(), {
    size: 'lg',
    type: 'linear',
    disabled: false,
    loading: false
  })

  const emit = defineEmits<{
    click: []
  }>()

  const classes = computed(() => {
    return ['btn', `btn-${props.size}`, `btn-${props.type}`, { disabled: props.disabled }, { loading: props.loading }]
  })
</script>

<style lang="scss" scoped>
  .btn {
    color: var(--color-primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
  .btn-lg {
    height: 67px;
  }
  .btn-md {
    @apply h-[54px] sm:h-10;
  }
  .btn-sm {
    height: 36px;
  }

  .btn-linear {
    background: var(--color-linear-gradient);
    color: #fff;
    &:hover {
      opacity: 0.8;
    }
  }

  .btn-outline {
    background: #f5f5f5;
    border: 1px solid var(--color-gray-4);
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

  .loading {
    pointer-events: none;
    opacity: 0.8;
  }

  .btn.disabled {
    background: var(--color-gray-4) !important;
    // opacity: 0.8;
    cursor: not-allowed;
    pointer-events: none;
    color: var(--color-gray-6) !important;

    * {
      color: var(--color-gray-6) !important;
    }
    &:hover {
      opacity: 0.4;
    }
  }
</style>
