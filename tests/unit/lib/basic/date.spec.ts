import {
  compareDate,
  compareDateString,
  getCurrentTimeString,
  getDateRepresentation,
  getDateRepresentationWithoutSameDate,
  getDayString,
  getFullDayString,
  getFullDayWithTimeString,
  getISOFullDayString,
  getTimeString
} from '/@/lib/basic/date'

const defaultDate1 = new Date('1985-12-04T15:21:34.123')
const defaultDate2 = new Date('2001-04-04T05:20:34.005')

describe('getTimeString', () => {
  it('can get time (1)', () => {
    expect(getTimeString(defaultDate1)).toBe('15:21:34.123')
  })
  it('can get time (2)', () => {
    expect(getTimeString(defaultDate2)).toBe('05:20:34.005')
  })
})

describe('getDayString', () => {
  it('can get day (1)', () => {
    expect(getDayString(defaultDate1)).toBe('12/04')
  })
  it('can get day (2)', () => {
    expect(getDayString(defaultDate2)).toBe('04/04')
  })
})

describe('getFullDayString', () => {
  it.each([
    [new Date(2026, 9, 30), 'R08/10/30'],
    [new Date(2026, 3, 1), 'R08/04/01'],
    [new Date(2118, 3, 1), 'R100/04/01'],
    [new Date(2019, 4, 1), 'R01/05/01'],
    [new Date(2019, 3, 30), 'H31/04/30'],
    [new Date(1989, 0, 8), 'H01/01/08'],
    [new Date(1989, 0, 7), 'S64/01/07'],
    [new Date(1926, 11, 25), 'S01/12/25'],
    [new Date(1926, 11, 24), 'T15/12/24'],
    [new Date(1912, 6, 30), 'T01/07/30'],
    [new Date(1912, 6, 29), 'M45/07/29']
  ])('formats %s as %s', (date, expected) => {
    expect(getFullDayString(date)).toBe(expected)
  })

  it('returns an empty string for an invalid date', () => {
    expect(getFullDayString(new Date(NaN))).toBe('')
  })

  it('can get full day (1)', () => {
    expect(getFullDayString(defaultDate1)).toBe('S60/12/04')
  })
  it('can get full day (2)', () => {
    expect(getFullDayString(defaultDate2)).toBe('H13/04/04')
  })
})

describe('getFullDayWithTimeString', () => {
  it('can get full day with time (1)', () => {
    expect(getFullDayWithTimeString(defaultDate1)).toBe(
      'S60/12/04 15:21:34.123'
    )
  })
  it('can get full day with time (2)', () => {
    expect(getFullDayWithTimeString(defaultDate2)).toBe(
      'H13/04/04 05:20:34.005'
    )
  })
})

describe('getISOFullDayString', () => {
  it('can get iso full day (1)', () => {
    expect(getISOFullDayString(defaultDate1)).toBe('1985-12-04')
  })
  it('can get iso full day (2)', () => {
    expect(getISOFullDayString(defaultDate2)).toBe('2001-04-04')
  })
})

describe('getCurrentTimeString', () => {
  it('should work', () => {
    vi.useFakeTimers()
    vi.setSystemTime('2022/05/30 12:34:56')
    expect(getCurrentTimeString()).toBe('12:34:56.000')
    vi.useRealTimers()
  })
})

describe('getDateRepresentation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const dateISO = '2010-05-02T14:28:57'

  it.each(['', 'invalid date', new Date(NaN)])(
    'returns an empty string for invalid input %s',
    date => {
      expect(getDateRepresentation(date)).toBe('')
    }
  )

  it('should say 今日 when updated today', () => {
    vi.setSystemTime('2010-05-02T15:00:00')
    expect(getDateRepresentation(dateISO)).toBe('今日 14:28:57.000')
  })
  it('should say 昨日 when updated yesterday', () => {
    vi.setSystemTime('2010-05-03T15:00:00')
    expect(getDateRepresentation(dateISO)).toBe('昨日 14:28:57.000')
  })

  describe('with daylight saving time', () => {
    beforeEach(() => {
      vi.stubEnv('TZ', 'America/New_York')
    })
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should say 昨日 after a 23-hour day', () => {
      vi.setSystemTime(new Date(2025, 2, 10))
      expect(getDateRepresentation(new Date(2025, 2, 9, 12, 34))).toBe(
        '昨日 12:34:00.000'
      )
    })

    it('should say 昨日 during a 25-hour day', () => {
      vi.setSystemTime(new Date(2025, 10, 2, 23, 30))
      expect(getDateRepresentation(new Date(2025, 10, 1, 12, 34))).toBe(
        '昨日 12:34:00.000'
      )
    })
  })

  it('should get MM/DD when updated in the same year', () => {
    vi.setSystemTime('2010-07-07T15:00:00')
    expect(getDateRepresentation(dateISO)).toBe('05/02 14:28:57.000')
  })
  it('should get a Japanese date when updated before last year', () => {
    vi.setSystemTime('2015-10-10T15:00:00')
    expect(getDateRepresentation(dateISO)).toBe('H22/05/02 14:28:57.000')
  })
})

describe('getDateRepresentationWithoutSameDate', () => {
  it('omits the date only for the same calendar day', () => {
    expect(
      getDateRepresentationWithoutSameDate(
        new Date(2026, 9, 30, 12, 34),
        new Date(2026, 9, 30, 15)
      )
    ).toBe('12:34:00.000')
  })

  it.each([
    [new Date(2026, 9, 31), '10/30 12:34:00.000'],
    [new Date(2026, 10, 30), '10/30 12:34:00.000'],
    [new Date(2027, 9, 30), 'R08/10/30 12:34:00.000']
  ])(
    'omits the year only in the same year when compared to %s',
    (fromDate, expected) => {
      expect(
        getDateRepresentationWithoutSameDate(
          new Date(2026, 9, 30, 12, 34),
          fromDate
        )
      ).toBe(expected)
    }
  )
})

describe('compareDate', () => {
  it('can compare time', () => {
    expect(
      compareDate(
        new Date(2020, 1, 1, 0, 0, 0, 0),
        new Date(2020, 2, 1, 0, 0, 0, 0)
      )
    ).toEqual(-1)
  })
  it('can compare time (inversed)', () => {
    expect(
      compareDate(
        new Date(2020, 1, 1, 0, 0, 0, 0),
        new Date(2020, 2, 1, 0, 0, 0, 0),
        true
      )
    ).toBe(1)
  })
  it('can compare same time', () => {
    expect(
      compareDate(
        new Date(2020, 1, 1, 0, 0, 0, 0),
        new Date(2020, 1, 1, 0, 0, 0, 0)
      )
    ).toBe(0)
  })
})

describe('compareDateString', () => {
  it('can compare time', () => {
    expect(
      compareDateString(
        '2021-02-19T17:09:24.53365Z',
        '2021-02-20T12:16:03.559831Z'
      )
    ).toEqual(-1)
  })
  it('can compare time (inversed)', () => {
    expect(
      compareDateString(
        '2021-02-19T17:09:24.53365Z',
        '2021-02-20T12:16:03.559831Z',
        true
      )
    ).toBe(1)
  })
  it('can compare same time', () => {
    expect(
      compareDateString(
        '2021-02-19T17:09:24.53365Z',
        '2021-02-19T17:09:24.53365Z'
      )
    ).toBe(0)
  })
})
