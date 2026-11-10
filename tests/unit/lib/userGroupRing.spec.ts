import type { UserGroup } from '@traptitech/traq'

import {
  buildRingGradient,
  buildUserGroupRingColorsMap
} from '/@/lib/userGroupRing'

const group = (name: string, memberIds: string[]): UserGroup => ({
  id: `group-${name}`,
  name,
  description: '',
  type: '',
  icon: '',
  members: memberIds.map(id => ({ id, role: '' })),
  createdAt: '',
  updatedAt: '',
  admins: []
})

describe('buildUserGroupRingColorsMap', () => {
  it('collects colors of matching groups in the defined order', () => {
    const map = buildUserGroupRingColorsMap([
      group('Kaggle', ['a']),
      group('Game', ['a', 'b']),
      group('SysAd', ['a'])
    ])

    expect(map.get('a')).toEqual(['#7733AA', '#19A39D', '#20BEFF'])
    expect(map.get('b')).toEqual(['#7733AA'])
  })

  it('matches group names case-insensitively', () => {
    const map = buildUserGroupRingColorsMap([
      group('Graphics', ['a']),
      group('ctf', ['a'])
    ])

    expect(map.get('a')).toEqual(['#F47FAD', '#C7F000'])
  })

  it('ignores groups not in the list', () => {
    const map = buildUserGroupRingColorsMap([
      group('Unknown', ['a']),
      group('Sound', ['b'])
    ])

    expect(map.has('a')).toBe(false)
    expect(map.get('b')).toEqual(['#FF7B19'])
  })
})

describe('buildRingGradient', () => {
  it('returns none for no colors', () => {
    expect(buildRingGradient([])).toBe('none')
  })

  it('fills the whole ring with a single color', () => {
    expect(buildRingGradient(['#111111'])).toBe(
      'conic-gradient(#111111 0 100%)'
    )
  })

  it('splits the ring evenly for multiple colors', () => {
    expect(buildRingGradient(['#111111', '#222222', '#333333'])).toBe(
      'conic-gradient(#111111 0 33.3333%, #222222 0 66.6667%, #333333 0 100%)'
    )
  })
})
