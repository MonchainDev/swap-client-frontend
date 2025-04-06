<template>
  <ElPopover trigger="hover" placement="left" width="420" popper-class="!p-4 !pb-8 !text-primary !rounded-lg !shadow-lg">
    <template #reference>
      <div class="cursor-pointer">
        <slot></slot>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col gap-4">
        <div class="text-sm font-semibold">
          <span
            >Combined APR: <span class="text-hyperlink">{{ combinedApr }}%</span></span
          >
          <ul class="list-disc pl-4">
            <li>Farm APR: <span class="text-hyperlink">16.70% 8.35%</span></li>
            <li>LP Fee APR: <span class="text-hyperlink">16.70%</span></li>
          </ul>
        </div>
        <span
          >Calculated using the total liquidity in the pool versus the total reward amount. Actual APR may be higher as some liquidity is not staked or not
          in-range.
        </span>
        <span> APRs for individual positions may vary depending on the configs. </span>
      </div>
    </template>
  </ElPopover>
</template>

<script lang="ts" setup>
  interface IProps {
    farmApr: number
    lpFeeApr: number
    oldFarmApr: number
  }

  const props = withDefaults(defineProps<IProps>(), {
    farmApr: 0,
    lpFeeApr: 0,
    oldFarmApr: 0
  })

  const combinedApr = computed(() => {
    return (props.farmApr + props.lpFeeApr).toFixed(2)
  })
</script>

<style lang="scss" scoped></style>
