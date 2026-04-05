<template>
  <teleport to="#message-menu-popup">
    <ClickOutside @click-outside="emit('close')">
      <div
        ref="menuContainerRef"
        :style="toolsMenuStyle"
        :class="$style.toolsMenu"
      >
        <slot />
      </div>
    </ClickOutside>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref, toRef } from 'vue'

import ClickOutside from '/@/components/UI/ClickOutside'
import useBoxSize from '/@/composables/dom/useBoxSize'
import type { Point } from '/@/lib/basic/point'

const props = defineProps<{
  position: Point
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const position = toRef(props, 'position')

const menuContainerRef = ref<HTMLDivElement | null>(null)
const { height, width } = useBoxSize(menuContainerRef)

const toolsMenuStyle = computed(() => {
  const margin = 20
  const menuWidth = width?.value ?? 0
  const fitsOnLeft = position.value.x - menuWidth >= margin
  return {
    top: `min(calc(100vh - ${(height?.value ?? 0) + margin}px), ${
      position.value.y
    }px)`,
    left: `${position.value.x}px`,
    transform: fitsOnLeft ? 'translateX(-100%)' : 'translateX(0)'
  }
})
</script>

<style lang="scss" module>
.toolsMenu {
  position: absolute;
  z-index: $z-index-message-element-tools-menu;
}
</style>
