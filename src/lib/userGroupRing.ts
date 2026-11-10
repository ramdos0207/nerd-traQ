import type { UserGroup } from '@traptitech/traq'

import type { UserId } from '/@/types/entity-ids'

/**
 * アイコンの周りにリングを表示するグループとその色
 * 配列の順番がリング上の並び順になる
 * グループ名は大文字小文字を区別せずに比較する
 */
export const USER_GROUP_RING_COLORS: ReadonlyArray<{
  name: string
  color: string
}> = [
  { name: 'Game', color: '#7733AA' },
  { name: 'Sound', color: '#FF7B19' },
  { name: 'graphics', color: '#F47FAD' },
  { name: 'SysAd', color: '#19A39D' },
  { name: 'Algorithm', color: '#B02525' },
  { name: 'CTF', color: '#C7F000' },
  { name: 'Kaggle', color: '#20BEFF' }
]

const colorByLoweredName = new Map(
  USER_GROUP_RING_COLORS.map(({ name, color }, index) => [
    name.toLowerCase(),
    { color, index }
  ])
)

/**
 * ユーザーIDごとに、所属しているリング対象グループの色一覧を作る
 * どの対象グループにも所属していないユーザーは含まれない
 */
export const buildUserGroupRingColorsMap = (
  userGroups: Iterable<UserGroup>
): Map<UserId, string[]> => {
  const indicesByUserId = new Map<UserId, Set<number>>()
  for (const group of userGroups) {
    const target = colorByLoweredName.get(group.name.toLowerCase())
    if (!target) continue

    for (const member of group.members) {
      const indices = indicesByUserId.get(member.id) ?? new Set<number>()
      indices.add(target.index)
      indicesByUserId.set(member.id, indices)
    }
  }

  const result = new Map<UserId, string[]>()
  for (const [userId, indices] of indicesByUserId) {
    result.set(
      userId,
      [...indices]
        .sort((a, b) => a - b)
        .flatMap(index => USER_GROUP_RING_COLORS[index]?.color ?? [])
    )
  }
  return result
}

/**
 * 色を等分したドーナツグラフ状の conic-gradient を作る
 */
export const buildRingGradient = (colors: readonly string[]): string => {
  if (colors.length === 0) return 'none'
  if (colors.length === 1) {
    return `conic-gradient(${colors[0]} 0 100%)`
  }

  const step = 100 / colors.length
  const stops = colors.map((color, i) => {
    const end = i === colors.length - 1 ? 100 : step * (i + 1)
    return `${color} 0 ${Number(end.toFixed(4))}%`
  })
  return `conic-gradient(${stops.join(', ')})`
}
