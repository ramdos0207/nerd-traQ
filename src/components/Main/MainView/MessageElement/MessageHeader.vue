<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{
      user?.displayName ?? 'unknown'
    }}</span>
    <GradeBadge
      :class="$style.badge"
      :user-id="userId"
      :is-bot="user?.bot ?? false"
    />
    <span :class="$style.name">@{{ user?.name ?? 'unknown' }}</span>
    <span :class="$style.date">
      {{ dateMain }}<span :class="$style.dateMs">{{ dateMs }}</span>
    </span>
    <span
      v-if="createdAt !== updatedAt"
      :class="$style.editIcon"
      :title="updatedDate"
    >
      <AIcon :size="16" name="pencil-outline" mdi />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import { getDateRepresentation } from '/@/lib/basic/date'
import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

import GradeBadge from './GradeBadge.vue'

const props = defineProps<{
  userId: UserId
  createdAt: string
  updatedAt: string
}>()

const { usersMap, fetchUser } = useUsersStore()

const user = computed(() => usersMap.value.get(props.userId))
if (user.value === undefined) {
  fetchUser({ userId: props.userId })
}

const date = computed(() => getDateRepresentation(props.createdAt))
const dateMain = computed(() => date.value.split('.')[0])
const dateMs = computed(() => {
  const ms = date.value.split('.')[1]
  return ms !== undefined ? '.' + ms : ''
})
const updatedDate = computed(() => getDateRepresentation(props.updatedAt))
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
}

.displayName {
  font-weight: bold;
  flex: 2;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.badge {
  margin-left: 4px;
}

.name {
  @include color-ui-secondary;
  @include size-body2;
  margin-left: 4px;
  flex: 1;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.date {
  @include color-ui-secondary;
  @include size-caption;
  margin-left: 4px;
}

.dateMs {
  font-size: 0.75em;
}

.editIcon {
  @include color-ui-secondary;
  margin-left: 4px;
  flex-shrink: 0;
  cursor: default;
}
</style>
