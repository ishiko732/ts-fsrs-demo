import FSRSSetting from "./settings/FSRSConfig";



export default async function Drawer({children}:{children:React.ReactNode}){
    return <>
        <div className="drawer drawer-end">
        <input id="fsrsSetting" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
            {children}
        </div> 
        <div className="drawer-side overflow-x-hidden overflow-y-auto">
            <label htmlFor="fsrsSetting" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="p-4 w-full sm:w-5/12 sm:min-h-full bg-base-200 text-base-content">
            <FSRSSetting/>
            </div>
        </div>
        </div>
    </>
}