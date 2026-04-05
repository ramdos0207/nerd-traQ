import { ChannelSubscribeLevel } from '@traptitech/traq'

import { type MaybeRef, computed, toValue } from 'vue'

import { isDefined } from '/@/lib/basic/array'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useStaredChannels } from '/@/store/domain/staredChannels'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'

export const unreadSortModes = ['updatedAt', 'since', 'count'] as const
export type UnreadSortMode = (typeof unreadSortModes)[number]

export const unreadSortModeLabels: Record<UnreadSortMode, string> = {
  updatedAt: '最新投稿',
  since: '最古未読',
  count: '未読数'
}

const useChannelsWithNotification = (
  sortMode: MaybeRef<UnreadSortMode> = 'updatedAt'
) => {
  const { unreadChannelsMap, subscriptionMap } = useSubscriptionStore()
  const { channelsMap, dmChannelsMap } = useChannelsStore()
  const starredChannelStore = useStaredChannels()

  const mode = computed<'starred' | 'notified' | 'default' | 'both'>(() => {
    const { prioritizeNotifiedChannel, prioritizeStarredChannel } =
      useBrowserSettings()
    if (prioritizeStarredChannel.value) {
      return prioritizeNotifiedChannel.value ? 'both' : 'starred'
    }
    if (prioritizeNotifiedChannel.value) {
      return 'notified'
    }
    return 'default'
  })

  const sortedUnreadChannels = computed(() =>
    [...unreadChannelsMap.value.values()].sort((a, b) => {
      switch (toValue(sortMode)) {
        case 'since':
          return Date.parse(a.since) - Date.parse(b.since)
        case 'count':
          return b.count - a.count
        default:
          return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
      }
    })
  )

  const channelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .filter(unread => unread.noticeable)
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const channelsWithUnreadMessage = computed(() =>
    sortedUnreadChannels.value
      .filter(unread => !unread.noticeable)
      .map(unread => channelsMap.value.get(unread.channelId))
      .filter(isDefined)
  )

  const noticeableChannels = computed(() => {
    if (mode.value === 'starred' || mode.value === 'both') {
      const starred = channelsWithNotification.value.filter(channel =>
        starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      const notStarred = channelsWithNotification.value.filter(
        channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      return [...starred, ...notStarred]
    }

    return channelsWithNotification.value
  })

  const unreadChannels = computed(() => {
    if (mode.value === 'both') {
      const noticeable = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) ===
          ChannelSubscribeLevel.notified
      )
      const starred = channelsWithUnreadMessage.value.filter(
        channel =>
          starredChannelStore.staredChannelSet.value.has(channel.id) &&
          subscriptionMap.value.get(channel.id) !==
            ChannelSubscribeLevel.notified
      )

      const unread = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) !==
            ChannelSubscribeLevel.notified &&
          !starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      return [...noticeable, ...starred, ...unread]
    }
    if (mode.value === 'starred') {
      const starred = channelsWithUnreadMessage.value.filter(channel =>
        starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      const notStarred = channelsWithUnreadMessage.value.filter(
        channel => !starredChannelStore.staredChannelSet.value.has(channel.id)
      )
      return [...starred, ...notStarred]
    }
    if (mode.value === 'notified') {
      const noticeable = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) ===
          ChannelSubscribeLevel.notified
      )
      const unread = channelsWithUnreadMessage.value.filter(
        channel =>
          subscriptionMap.value.get(channel.id) !==
          ChannelSubscribeLevel.notified
      )
      return [...noticeable, ...unread]
    }

    return channelsWithUnreadMessage.value
  })

  const dmChannelsWithNotification = computed(() =>
    sortedUnreadChannels.value
      .map(unread => dmChannelsMap.value.get(unread.channelId ?? ''))
      .filter(isDefined)
  )

  return {
    noticeableChannels,
    unreadChannels,
    dmChannelsWithNotification
  }
}

export default useChannelsWithNotification
