// eslint-disable-next-line no-unused-vars
class DateFormat {
  from(date = '') {
    try {
      const d = new Date(Date.parse(date))
      const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
      const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d)
      const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
      return `${ye}-${mo}-${da}`
    } catch (error) {
      return '----------'
    }
  }
}
