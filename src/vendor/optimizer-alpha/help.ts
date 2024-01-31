

/**
 * if browser get browser timezone
 * if node get system timezone
 * @returns {string} current timezone
 */
function get_custom_timezone(): string {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * get current timezone offset
 * @param time  default is now
 * @returns {number} current timezone offset
 */
function get_custom_offset(time?: Date): number {
    return (time || new Date()).getTimezoneOffset()
}

/**
 * get current timezone offset in GMT
 * @param time default is now
 * @returns {number} current timezone offset in GMT in [-12,14]
 */
function get_custom_GMT(time?: Date): number {
    const offset = get_custom_offset(time)
    return Math.floor(-offset / 60)
}

function offset_date(timestamp: number, offset: number): Date {
    return new Date(timestamp + offset * 60 * 60 * 1000)
}

function offset_date_by_GMT(timestamp: number, GMT: number): Date {
    return new Date(timestamp + GMT * 60 * 60 * 1000)
}

/**
 * get date string in local timezone
 * > new Date(1706240575195).toLocaleString('UTC',{timeZone:'Asia/Shanghai'})
 * > '2024/1/26 11:42:55'
 * 
 * > new Date(1706240575195).toLocaleString('UTC',{timeZone:'America/New_York'})
 * > '2024/1/26 22:42:55'
 * 
 * > new Date(1706240575195).toLocaleString('UTC',{timeZone:'UTC'})
 * > '2024/1/26 03:42:55'
 * @param timestamp  timestamp in ms
 * @param timezone timezone string
 * @returns {string} date string in local timezone
 */
function offset_date_by_timezone(timestamp: number, timezone: string):string {
    return new Date(timestamp).toLocaleString("UTC", { timeZone: timezone })
}