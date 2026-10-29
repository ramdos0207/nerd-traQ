import { type EffectScope, type MaybeRefOrGetter, effectScope, ref } from 'vue'

import { useDateRepresentation } from '/@/composables/useDateRepresentation'

describe('useDateRepresentation', () => {
  const scopes: EffectScope[] = []

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    scopes.forEach(scope => scope.stop())
    scopes.length = 0
    vi.useRealTimers()
  })

  const createDateRepresentation = (
    date: MaybeRefOrGetter<Readonly<Date> | string>
  ) => {
    const scope = effectScope()
    scopes.push(scope)
    const dateRepresentation = scope.run(() => useDateRepresentation(date))
    if (!dateRepresentation) throw new Error('Failed to create effect scope')
    return dateRepresentation
  }

  it('updates when a date ref changes across eras', () => {
    vi.setSystemTime(new Date(2026, 9, 30))
    const source = ref(new Date(2019, 3, 30, 12, 34))
    const date = createDateRepresentation(source)

    expect(date.value).toBe('H31/04/30 12:34:00.000')

    source.value = new Date(2019, 4, 1, 12, 34)

    expect(date.value).toBe('R01/05/01 12:34:00.000')
  })

  it('updates when a getter changes from missing data to a date string', () => {
    vi.setSystemTime(new Date(2026, 9, 30))
    const source = ref('')
    const date = createDateRepresentation(() => source.value)

    expect(date.value).toBe('')

    source.value = '2025-04-01T12:34:00'

    expect(date.value).toBe('R07/04/01 12:34:00.000')
  })

  it('updates when the date changes', () => {
    vi.setSystemTime(new Date(2025, 0, 1, 23, 59, 59))
    const date = createDateRepresentation(new Date(2025, 0, 1, 12, 34))

    expect(date.value).toBe('今日 12:34:00.000')

    vi.advanceTimersByTime(1000)

    expect(date.value).toBe('昨日 12:34:00.000')
  })

  it('shares a single timer between consumers', () => {
    createDateRepresentation('2025-01-01T12:34:00Z')
    createDateRepresentation('2025-01-01T12:35:00Z')

    expect(vi.getTimerCount()).toBe(1)
  })
})
