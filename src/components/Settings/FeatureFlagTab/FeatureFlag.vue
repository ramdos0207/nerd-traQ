<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>{{ props.title }}</h3>
      <p>{{ props.description }}</p>
      <p v-if="featureFlags.flag_test.enabled">
        <strong>ていきょうしゅうりょうび</strong>:
        {{ getFullDayString(props.endAt) }}
      </p>
      <p v-else>
        <strong>提供終了日</strong>: {{ getFullDayString(props.endAt) }}
      </p>
    </div>
    <div>
      <AToggle v-model="value" :disabled="props.endAt < new Date()" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import { getFullDayString } from '/@/lib/basic/date'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'

const { featureFlags } = useFeatureFlagSettings()

const value = defineModel<boolean>({
  required: true
})

const props = defineProps<{
  title: string
  description: string
  endAt: Date
}>()
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.description {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
