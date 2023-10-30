export default function getFormattedDate(date: Date|string): string {
    return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long' }).format(new Date(date))
}