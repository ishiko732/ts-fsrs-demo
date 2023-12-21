'use client';

export default function ConfigButtonGroup() {

    return <>
        <button
            type="reset"
            className="drawer-button btn btn-outline text-sm "
            onClick={() => {document.getElementById('fsrsSetting')?.click()}} 
        >
            Cancel
        </button>
        <button
            type="submit"
            className="drawer-button btn btn-outline bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            onClick={() => {document.getElementById('fsrsSetting')?.click()}} 
        >
            Save
        </button>
    </>

}