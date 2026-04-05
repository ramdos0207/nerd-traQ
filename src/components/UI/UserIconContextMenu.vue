<template>
  <ContextMenuContainer :position="position" @close="close">
    <div :class="$style.container">
      <span :class="$style.text" @click="withClose(openProfileModal)">
        プロフィールモーダルを表示
      </span>
      <span :class="$style.text" @click="withClose(copyUserId)">
        ユーザーIDをコピー
      </span>
      <span v-if="canOpenDM" :class="$style.text" @click="withClose(openDM)">
        DM画面を開く
      </span>
    </div>
  </ContextMenuContainer>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useRouter } from 'vue-router'

import ContextMenuContainer from '/@/components/UI/ContextMenuContainer.vue'
import useCopyText from '/@/composables/toast/useCopyText'
import type { Point } from '/@/lib/basic/point'
import { constructUserPath } from '/@/router'
import { useUsersStore } from '/@/store/entities/users'
import { useModalStore } from '/@/store/ui/modal'
import type { UserId } from '/@/types/entity-ids'
import type { MaybePromise } from '/@/types/utility'

const props = defineProps<{
  position: Point
  userId: UserId
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { usersMap } = useUsersStore()
const { pushModal } = useModalStore()
const { copyText } = useCopyText()
const router = useRouter()

const user = computed(() => usersMap.value.get(props.userId))

const canOpenDM = computed(
  () =>
    user.value &&
    !(user.value.bot && user.value.name.startsWith('Webhook#'))
)

const openProfileModal = () => {
  pushModal({ type: 'user', id: props.userId })
}

const copyUserId = () => {
  copyText(props.userId, 'ユーザーID')
}

const openDM = () => {
  if (!user.value) return
  router.push(constructUserPath(user.value.name))
}

const close = () => {
  emit('close')
}
const withClose = async (func: () => MaybePromise<void>) => {
  await func()
  close()
}
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-secondary;
  @include drop-shadow-default;
  display: grid;
  width: max-content;
  padding: 8px 16px;
  border-radius: 4px;
  contain: content;
}

.text {
  margin: 2px 0;
  cursor: pointer;
}
</style>
