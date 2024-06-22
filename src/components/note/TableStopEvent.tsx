'use client'
type Props= React.ComponentProps<"td">;

// @deprecated
export default function TableStopPropagationEvent({...props}:Props){

    return <td onClick={e=>e.stopPropagation()}>
        {props.children}
    </td>
}