'use client'
import { flushTimezone } from "@/actions/timezone"
import { get_custom_timezone } from "@/lib/date";
import { useEffect } from "react";


export function FlushTimeZonePage({ hourOffset = 4 }: { hourOffset?: number }) {
    useEffect(() => {
        const timezone = get_custom_timezone()

        flushTimezone(timezone, hourOffset ?? 4);
    }, [])
    return null;
}