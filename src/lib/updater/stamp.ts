import apis from '/@/lib/apis'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useMessagesStore } from '/@/store/entities/messages'
import { useToastStore } from '/@/store/ui/toast'
import type { MessageId, StampId } from '/@/types/entity-ids'

export const useStampUpdater = () => {
  const { addErrorToast } = useToastStore()
  const { upsertLocalStampHistory } = useStampHistory()
  const { recordStampUsage } = useStampRecommendations()
  const { addStampLocally, removeStampLocally } = useMessagesStore()

  const addStampOptimistically = async (
    messageId: MessageId,
    stampId: StampId,
    count = 1
  ) => {
    const cancel = addStampLocally(messageId, stampId, count)
    upsertLocalStampHistory(stampId, new Date())
    recordStampUsage(stampId)
    try {
      await apis.addMessageStamp(messageId, stampId, { count })
    } catch {
      addErrorToast('メッセージにスタンプを追加できませんでした')
      cancel?.()
    }
  }

  const removeStampOptimistically = async (
    messageId: MessageId,
    stampId: StampId
  ) => {
    const cancel = removeStampLocally(messageId, stampId)
    try {
      await apis.removeMessageStamp(messageId, stampId)
    } catch {
      addErrorToast('メッセージからスタンプを削除できませんでした')
      cancel?.()
    }
  }

  return { addStampOptimistically, removeStampOptimistically }
}
