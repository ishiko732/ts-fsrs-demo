import React, { useEffect } from 'react'



export default function ScheduleCard({nid,open}:{nid:number,open:boolean}) {
    const [schedule,setSchedule] = React.useState([])
    useEffect(()=>{
        fetch(`/api/fsrs?nid=${nid}`,{method:"post"}).then(res=>res.json()).then(res=>setSchedule(res))
    },[nid])

  return (
    <div>{!open?"show answer":JSON.stringify(schedule)}</div>

  )
}
