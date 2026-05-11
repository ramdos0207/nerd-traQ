<template>
  <ContextMenuContainer :position="position" @close="close">
    <div :class="$style.container">
      <span :class="$style.text" @click="withClose(add100Stamps)">
        100個付ける
      </span>
      <span :class="$style.text" @click="withClose(copyStampUserNames)">
        :@hoge:リストをコピー
      </span>
      <span :class="$style.text" @click="withClose(copyUserMentions)">
        @hogeリストをコピー
      </span>
    </div>
  </ContextMenuContainer>
</template>

<script lang="ts" setup>
import ContextMenuContainer from '/@/components/UI/ContextMenuContainer.vue'
import useCopyText from '/@/composables/toast/useCopyText'
import type { Point } from '/@/lib/basic/point'
import type { MessageStampById } from '/@/lib/messageStampList'
import { useStampUpdater } from '/@/lib/updater/stamp'
import { useUsersStore } from '/@/store/entities/users'
import type { MessageId } from '/@/types/entity-ids'
import type { MaybePromise } from '/@/types/utility'

const props = defineProps<{
  position: Point
  messageId: MessageId
  stamp: MessageStampById
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { usersMap } = useUsersStore()
const { copyText } = useCopyText()
const { addStampOptimistically } = useStampUpdater()

const getUserName = (userId: string) =>
  usersMap.value.get(userId)?.name ?? 'unknown'

const add100Stamps = () => {
  return addStampOptimistically(props.messageId, props.stamp.id, 100)
}

const copyStampUserNames = () => {
  const text = props.stamp.users
    .map(user => `:@${getUserName(user.id)}:`)
    .join('')
  return copyText(text, 'スタンプを付けたユーザー')
}

const copyUserMentions = () => {
  const text = props.stamp.users
    .map(user => `@${getUserName(user.id)}`)
    .join(' ')
  return copyText(text, 'スタンプを付けたユーザー')
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
