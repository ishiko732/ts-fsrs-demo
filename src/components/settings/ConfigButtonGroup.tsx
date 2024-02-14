'use client';
import { useFormStatus } from 'react-dom';
import SaveParamsSubmit from '../LoadingSubmitButton';
export default function ConfigButtonGroup() {
    const { pending } = useFormStatus();
    
    return <>
        <button
            type="reset"
            className="drawer-button btn btn-outline text-sm "
            onClick={() => {document.getElementById('fsrsSetting')?.click()}} 
        >
            Cancel
        </button>
        <SaveParamsSubmit
            type="submit"
            className="drawer-button btn btn-outline bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            onClick={() => {
                const timeid =setTimeout(()=>{
                    !pending && document.getElementById('fsrsSetting')?.click()
                },200)
                return ()=>{
                    clearTimeout(timeid)
                }
            }} 
        >
            Save
        </SaveParamsSubmit>
    </>

}