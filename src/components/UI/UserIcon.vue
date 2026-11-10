<template>
  <div
    :role="isClickable ? 'button' : 'img'"
    :class="[$style.container]"
    :style="styles.container"
    @click="onClick"
    @contextmenu.prevent.stop="onContextMenu"
  >
    <div
      v-if="ring"
      data-testid="user-icon-ring"
      :class="$style.ring"
      :data-is-inactive="$boolAttr(isInactive)"
      :style="styles.ring"
    />
    <div v-if="hasNotification" :class="$style.indicator">
      <NotificationIndicator :size="indicatorSize" />
    </div>
    <div v-if="isInactive" :class="$style.mask" />
    <UserIconContextMenu
      v-if="contextMenuPosition"
      :position="contextMenuPosition"
      :user-id="userId"
      @close="closeContextMenu"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, toRef, watch } from 'vue'

import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'
import UserIconContextMenu from '/@/components/UI/UserIconContextMenu.vue'
import { useUserModalOpener } from '/@/composables/modal/useUserModalOpener'
import useContextMenu from '/@/composables/useContextMenu'
import { buildUserIconPath } from '/@/lib/apis'
import { buildRingGradient } from '/@/lib/userGroupRing'
import { useMeStore } from '/@/store/domain/me'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'
import type { FileId, UserId } from '/@/types/entity-ids'

export type IconSize =
  200 | 160 | 100 | 64 | 48 | 44 | 40 | 36 | 32 | 28 | 24 | 20

const props = withDefaults(
  defineProps<{
    userId: UserId
    fallbackIconFileId?: FileId
    size?: IconSize
    indicatorSize?: number
    preventModal?: boolean
    hasNotification?: boolean
    isInactive?: boolean
  }>(),
  {
    size: 36,
    indicatorSize: 10,
    preventModal: false,
    hasNotification: false,
    isInactive: false
  }
)

const { detail, myId } = useMeStore()
const { usersMap, fetchUser } = useUsersStore()
const { userGroupRingColorsMap } = useGroupsStore()

watch(
  () => props.userId,
  userId => {
    if (!userId) return
    fetchUser({ userId })
  },
  { immediate: true }
)

const user = computed(() =>
  props.userId === myId.value ? detail.value : usersMap.value.get(props.userId)
)
const userIconFileId = computed(
  () => user.value?.iconFileId ?? props.fallbackIconFileId ?? ''
)
const ringColors = computed(
  () => userGroupRingColorsMap.value.get(props.userId) ?? []
)
const ring = computed(() => {
  if (ringColors.value.length === 0) return undefined
  // 直径に比例させる (小さいアイコンでは潰れないよう下限を設ける)
  const width = Math.max(2, Math.round(props.size / 16)) * 0.5
  const gap = Math.max(1, Math.round(props.size / 36)) * 2
  return {
    width,
    // 画像の縮め幅が小数pxだと画像が補間されてぼやけるので整数に丸める
    inset: Math.round(width + gap),
    gradient: buildRingGradient(ringColors.value)
  }
})

const styles = reactive({
  container: computed(() => {
    const iconImage = userIconFileId.value
      ? `url(${buildUserIconPath(userIconFileId.value)})`
      : undefined
    const base = {
      width: `${props.size}px`,
      height: `${props.size}px`,
      backgroundImage: iconImage
    }
    if (!ring.value) return base

    // リングと隙間の分だけアイコン画像を内側に縮める
    // background-color は最後のレイヤーの clip に従うので、空のレイヤーを足して
    // 親が指定した背景色は隙間にも塗られるようにする
    return {
      ...base,
      padding: `${ring.value.inset}px`,
      backgroundImage: iconImage ? `${iconImage}, none` : undefined,
      backgroundOrigin: 'content-box, padding-box',
      backgroundClip: 'content-box, padding-box'
    }
  }),
  ring: computed(() => {
    if (!ring.value) return undefined
    // 内側の境界を 1px かけて透明→不透明に変化させ、ジャギーを抑える
    const w = ring.value.width
    const mask = `radial-gradient(farthest-side, transparent calc(100% - ${w + 0.5}px), #000 calc(100% - ${w - 0.5}px))`
    return {
      '--ring-gradient': ring.value.gradient,
      maskImage: mask,
      WebkitMaskImage: mask
    }
  })
})

const { isClickable, openModal } = useUserModalOpener(
  toRef(props, 'userId'),
  toRef(props, 'preventModal')
)

const onClick = (event: MouseEvent) => {
  if (props.preventModal) return

  event.preventDefault()
  event.stopPropagation()
  openModal()
}

const {
  position: contextMenuPosition,
  open: openContextMenu,
  close: closeContextMenu
} = useContextMenu()

const onContextMenu = (e: MouseEvent) => {
  openContextMenu({ x: e.pageX, y: e.pageY })
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  position: relative;
  border-radius: 100vw;
  flex: {
    shrink: 0;
    grow: 0;
  }
  background: {
    position: center;
    repeat: no-repeat;
    size: cover;
  }
  &[role='button'] {
    cursor: pointer;
  }
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 100vw;
  background-image: var(--ring-gradient);
  pointer-events: none;
  &[data-is-inactive] {
    // .mask と同じ濃さで半透明にする
    opacity: 0.5;
  }
}
.indicator {
  position: absolute;
  top: 0;
  right: 0;
}
.mask {
  @include background-primary;
  width: 100%;
  height: 100%;
  border-radius: 100vw;
  opacity: 0.5;
}
</style>
