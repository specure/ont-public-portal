import { formatDate } from '@angular/common'
import { DefaultDateFormat } from '../enums/default-date-format.enum'

export function getDateDaysBack(days: number, format = DefaultDateFormat.FORMAT, locale = DefaultDateFormat.LOCALE) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDate(date, format, locale)
}
