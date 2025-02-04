<template>
  <ElDialog
    v-model="isOpen"
    :width="props.width"
    :style="{ 'max-width': '95%' }"
    :append-to-body="props.appendBody"
    :close-on-press-escape="props.closePressEscape"
    :close-on-click-modal="props.closeClickModal"
    :top="props.top"
    :align-center="props.alignCenter"
    :show-close="false"
    class="base-popup"
    @open="handleOpen"
    @close="handleClose"
  >
    <template #header>
      <div class="flex w-full items-center justify-between text-[22px] font-semibold leading-7 text-primary first-letter:uppercase">
        <slot name="title">
          <span>{{ props.title }}</span></slot
        >
        <slot name="close">
          <BaseIcon name="x" class="cursor-pointer" size="24" @click="setOpenPopup(props.name, false)" />
        </slot>
      </div>
    </template>

    <div ref="popupBody" class="popup-content" :style="{ padding: props.padding }">
      <slot />
    </div>
    <template v-if="isShowFooter" #footer>
      <div class="popup-footer">
        <slot name="footer" />
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useBaseStore } from '@/stores/base.store'
  import type { POPUP_NAME } from '~/types/popup.type'

  interface IPopup {
    name: POPUP_NAME
    width: string
    appendBody?: boolean
    isShowFooter?: boolean
    top?: string
    closeClickModal?: boolean
    closePressEscape?: boolean
    padding?: string
    title?: string
    alignCenter?: boolean
  }
  const props = withDefaults(defineProps<IPopup>(), {
    name: '',
    width: '600px',
    top: '5vh',
    isShowFooter: true,
    appendBody: true,
    closeClickModal: false,
    closePressEscape: true,
    padding: '0px',
    alignCenter: true,
    title: ''
  })

  const emits = defineEmits<{
    close: []
    open: []
  }>()

  const { setOpenPopup } = useBaseStore()
  const { popup } = storeToRefs(useBaseStore())
  const popupBody = ref<HTMLElement>()

  const isOpen = computed({
    // getter
    get() {
      return (
        useFindIndex(popup.value, (value) => {
          return value === props.name
        }) !== -1
      )
    },
    // setter
    set(value: boolean) {
      setOpenPopup(props.name, value)
    }
  })

  function handleOpen() {
    emits('open')
  }
  function handleClose() {
    emits('close')
  }

  defineExpose({ popupBody })
</script>

<style scoped>
  .popup-content {
    scroll-behavior: smooth;
  }
</style>
<style lang="scss">
  .base-popup {
    --el-dialog-border-radius: 16px;
    --el-dialog-padding-primary: 0;

    .el-dialog__header {
      padding: 19px 32px 15px;
    }
    .el-dialog__body {
      color: var(--color-primary);
    }
  }
</style>
