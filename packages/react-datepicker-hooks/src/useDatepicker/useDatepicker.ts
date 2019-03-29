import {useState, useCallback} from 'react'
import {isBefore, isAfter} from 'date-fns'
import {
  getInitialMonths,
  MonthType,
  isDateSelected as isDateSelectedFn,
  isDateBlocked as isDateBlockedFn,
  isStartOrEndDate as isStartOrEndDateFn,
} from './useDatepicker.utils'

export const START_DATE = 'startDate'
export const END_DATE = 'endDate'

export type FocusedInput = 'startDate' | 'endDate' | null

export interface OnDateChange {
  focusedInput: FocusedInput
  startDate: Date | null
  endDate: Date | null
}

export interface UseDatepickerProps {
  onDateChange(data: OnDateChange): void
  minBookingDate?: Date
  maxBookingDate?: Date
  startDate: Date | null
  endDate: Date | null
  focusedInput: FocusedInput
  orientation?: 'horizontal' | 'vertical'
  numberOfMonths?: number
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  initialVisibleMonth?(numberOfMonths: number): MonthType[]
}

export function useDatepicker({
  startDate,
  endDate,
  focusedInput,
  minBookingDate,
  maxBookingDate,
  onDateChange,
  // orientation = 'horizontal',
  numberOfMonths = 2,
  firstDayOfWeek = 1,
}: // initialVisibleMonth = getInitialMonths,
UseDatepickerProps) {
  const [activeMonths] = useState(() => getInitialMonths(numberOfMonths, startDate))
  const isDateSelected = useCallback((date: Date) => isDateSelectedFn(date, startDate, endDate), [
    startDate,
    endDate,
  ])
  const isStartOrEndDate = useCallback(
    (date: Date) => isStartOrEndDateFn(date, startDate, endDate),
    [startDate, endDate],
  )
  const isDateBlocked = useCallback(
    (date: Date) => isDateBlockedFn(date, minBookingDate, maxBookingDate),
    [minBookingDate, maxBookingDate],
  )
  const onResetDates = () => {
    onDateChange({
      startDate: null,
      endDate: null,
      focusedInput: START_DATE,
    })
  }

  function onDaySelect(date: Date) {
    if (
      (focusedInput === END_DATE && startDate && isBefore(date, startDate)) ||
      (focusedInput === START_DATE && endDate && isAfter(date, endDate))
    ) {
      onDateChange({
        endDate: null,
        startDate: date,
        focusedInput: END_DATE,
      })
    } else if (focusedInput === START_DATE) {
      onDateChange({
        endDate,
        startDate: date,
        focusedInput: END_DATE,
      })
    } else if (focusedInput === END_DATE && startDate && !isBefore(date, startDate)) {
      onDateChange({
        startDate,
        endDate: date,
        focusedInput: null,
      })
    }
  }

  return {
    firstDayOfWeek,
    activeMonths,
    isDateSelected,
    isStartOrEndDate,
    isDateBlocked,
    onResetDates,
    onDaySelect,
  }
}