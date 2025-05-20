<template>
  <ElPopover trigger="hover" placement="right" width="420" popper-class="!p-4 !pb-8 !text-primary !rounded-lg !shadow-lg">
    <template #reference>
      <div class="w-fit cursor-pointer">
        <slot></slot>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col gap-4">
        <div class="text-sm font-semibold">
          <span
            >Combined APR: <span class="text-hyperlink">{{ formatNumber(combinedApr) }}%</span></span
          >
          <ul class="list-disc pl-4">
            <li>
              Farm APR:
              <span class="text-hyperlink"
                >{{ formatNumber((farmApr ?? 0).toFixed(2)) }}% <span v-if="!isPosition">{{ formatNumber((oldFarmApr ?? 0).toFixed(2)) }}%</span></span
              >
            </li>
            <li>
              LP Fee APR: <span class="text-hyperlink">{{ formatNumber((lpFeeApr ?? 0).toFixed(2)) }}%</span>
            </li>
          </ul>
        </div>
        <template v-if="isPosition">
          <span>APRs for individual positions may vary depending on the configs.</span>
        </template>
        <template v-else>
          <span
            >Calculated using the total liquidity in the pool versus the total reward amount. Actual APR may be higher as some liquidity is not staked or not
            in-range.
          </span>
          <span> APRs for individual positions may vary depending on the configs. </span>
        </template>
      </div>
    </template>
  </ElPopover>
</template>

<script lang="ts" setup>
  interface IProps {
    isPosition?: boolean
    farmApr: number | undefined
    lpFeeApr: number | undefined
    oldFarmApr?: number
  }

  const props = withDefaults(defineProps<IProps>(), {
    isPosition: false,
    farmApr: 0,
    lpFeeApr: 0,
    oldFarmApr: 0
  })

  const combinedApr = computed(() => {
    return ((props.farmApr ?? 0) + (props.lpFeeApr ?? 0)).toFixed(2)
  })
</script>

<style lang="scss" scoped></style>
