import moment from 'moment-jalaali'

function calculateDuration(durSeconds) {
  let day, hour, minute, seconds
  seconds = Math.floor(durSeconds)
  minute = Math.floor(seconds / 60)
  seconds = seconds % 60
  hour = Math.floor(minute / 60)
  minute = minute % 60
  day = Math.floor(hour / 24)
  hour = hour % 24

  let duration = ''
  if (day) return 'بیش از یک روز'
  if (hour) {
    duration += hour + ' ساعت'
    if (minute) duration += ' و ' + minute + ' دقیقه'
    if (seconds) duration += ' و ' + seconds + ' ثانیه'
    return duration
  }
  if (minute) {
    duration += minute + ' دقیقه'
    if (seconds) duration += ' و ' + seconds + ' ثانیه'
    return duration
  }
  return seconds ? `${seconds} ثانیه` : '0 ثانیه'
}

export default {
  install(app) {
    moment.loadPersian({
      usePersianDigits: false,
      dialect: 'persian-modern',
    })

    // متدهای اصلی
    const dateTime = {
      getDate(input, outFormat = null, inFormat = null, onlyDate = false, timeFormat = 'HH:mm:ss') {
        const storageTimeZone = localStorage.getItem('user-time-zone')
        const userTimeZone = storageTimeZone || '+0330'

        if (!input && inFormat !== 'duration') return null
        if (input?.toString().startsWith('-')) return 'Invalid Date'

        outFormat = outFormat || 'jYYYY/jMM/jDD'

        // محاسبه مدت زمان
        if (outFormat === 'duration') {
          const dateOfExpired = moment.unix(input)
          const today = moment()
          return dateOfExpired.diff(today, 'days')
        }

        if (inFormat === 'calculateDuration') {
          return calculateDuration(input)
        }

        if (outFormat === 'HH:MM - jYYYY/jMM/jDD') {
          return moment(input).utcOffset(userTimeZone).format('HH:mm - jYYYY/jMM/jDD')
        }

        if (onlyDate) {
          const date = moment(input).utcOffset(userTimeZone)
          const jalaliDatePart = date.format(outFormat) // تاریخ با فرمت خواسته شده
          const timePart = date.format(timeFormat)
          return `${timePart} ${jalaliDatePart}`
        }

        // تبدیل timestamp
        if (inFormat === 'timestamp') {
          if (outFormat === 'jalaliDay') {
            return this.getJalaliDay(moment.unix(input).utcOffset(userTimeZone))
          }
          if (outFormat === 'jalaliMonth') {
            return this.getJalaliMonth(moment.unix(input).utcOffset(userTimeZone))
          }
          return moment.unix(input).utcOffset(userTimeZone).format(outFormat)
        }

        return this.isValidDate(input) ? moment(input, inFormat).format(outFormat) : 'ثبت نشده'
      },

      isValidDate(val = null) {
        const date = moment(val)
        return !!(date.isValid() && date.format('YYYY') > 1900)
      },

      getJalaliDay(date) {
        const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه']
        return days[date.isoWeekday() % 7]
      },

      getJalaliMonth(date) {
        const months = [
          'فروردین',
          'اردیبهشت',
          'خرداد',
          'تیر',
          'مرداد',
          'شهریور',
          'مهر',
          'آبان',
          'آذر',
          'دی',
          'بهمن',
          'اسفند',
        ]
        return months[parseInt(date.format('jMM')) - 1] || 'نامعلوم'
      },

      updateTimeZone(value) {
        localStorage.setItem('user-time-zone', value)
      },

      now() {
        return moment()
      },

      getFaDateTime(input, tz = null) {
        const storageTimeZone = localStorage.getItem('user-time-zone')
        const userTimeZone = tz || storageTimeZone || '+0330'

        const m = moment(input).utcOffset(userTimeZone)
        return `${m.format('jD jMMMM jYYYY')} ساعت ${m.format('HH:mm')}`
      },
    }
    app.config.globalProperties.$dateTime = dateTime
    app.provide('dateTime', dateTime)
  },
}
