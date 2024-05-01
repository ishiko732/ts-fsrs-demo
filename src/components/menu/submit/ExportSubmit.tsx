
'use client'

import { ExportRevLog } from "@/lib/log"
import { useState } from "react"


export type ExportType = {
    timezone: string,
    offset: number,
    revlogs: ExportRevLog[]
}


export default function ExportSubmitButton({ action }: { action: () => Promise<ExportType> }) {
    const [loading, setLoading] = useState(false)
    return <button disabled={loading} type='submit' onClick={async (e) => {
        setLoading(true)
        const data = await action();
        const logs = data.revlogs
        if(logs.length === 0){
            alert("No logs to export")
            setLoading(false)
            return;
        }
        const GMT = -data.offset / 60
        const head = Object.keys(logs[0]).join(',') + '\n'
        const body = logs.map(log => Object.values(log).join(',')).join('\n')

        const url = getDownloadUrl(head + body);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revlog_${data.timezone}_GMT${GMT}.csv`;
        setLoading(false)
        a.click();
    }}>
        {loading ? <span className="flex mx-auto h-6 loading loading-spinner loading-sm"></span> : <ExportIcon />}
    </button>
}

function ExportIcon() {

    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className={"w-6 h-6"} xmlns="http://www.w3.org/2000/svg"><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V288H216c-13.3 0-24 10.7-24 24s10.7 24 24 24H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM384 336V288H494.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H384zm0-208H256V0L384 128z"></path></svg>
}


function getDownloadUrl(data: string) {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    return url
}