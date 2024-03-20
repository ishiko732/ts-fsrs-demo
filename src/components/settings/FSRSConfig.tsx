import { ParametersType, updateParameters } from "@/lib/fsrs";
import ConfigButtonGroup from "./ConfigButtonGroup";
import Link from "next/link";
import CheckParams from "./CheckParams";
import { reschedule } from "@/lib/reschedule";

export default async function FSRSConfig(this: any, {uid,username,params}: {uid:number,username:string,params: ParametersType}) {
    const submit = async (uid:number,formData: FormData) => {
        'use server';
        // const uid = Number(session.user!!.id)
        const request_retention = Number(formData.get('request_retention'))
        const maximum_interval = Number(Number(formData.get('maximum_interval')).toFixed(0))
        const w = JSON.parse(formData.get('w') as string)
        const enable_fuzz = formData.get('enable_fuzz') === 'on' ? true : false
        const card_limit = Number(Number(formData.get('card_limit')).toFixed(0))
        const lapses = formData.get('lapses') ? Math.max(Number(formData.get('lapses')), 3) : 8
        const lingq_token = formData.get('lingq_token') ? String(formData.get('lingq_token')) : null
        const data = {
            request_retention,
            maximum_interval,
            w,
            enable_fuzz,
            card_limit,
            uid,
            lapses,
            lingq_token
        }
        const params= await updateParameters(data);
        if(params.enable_fuzz){
            // vercel serverless function has a 10s timeout
            console.time("reschedule");
            await reschedule(
              {
                ...params,
                w: JSON.parse(params.w as string),
              },
              uid
            );
            console.timeEnd("reschedule");
        }
        return true;
    }
    const method = submit.bind(null, uid)
    return <form action={method}>
        <CheckParams />
        <h1 className="divider flex justify-center items-center text-md">Settings({username})</h1>
        <div>
            <label htmlFor="request_retention" className="pr-4">request_retention:</label>
            <input name="request_retention" className="input input-bordered w-full"
                type="number" max={0.99} min={0.7} step={0.01}
                aria-label="request retention"
                defaultValue={params.params.request_retention} />
            <div className="label text-xs">Represents the probability of the target memory you want. Note that there is a trade-off between higher retention rates and higher repetition rates. It is recommended that you set this value between 0.8 and 0.9.</div>

            <label htmlFor="maximum_interval" className="pr-4">maximum_interval:</label>
            <input name="maximum_interval" className="input input-bordered w-full"
                type="number" max={36500} min={7} step={1}
                aria-label="maximum interval"
                defaultValue={params.params.maximum_interval} />
            <div className="label text-xs">The maximum number of days between reviews of a card. When the review interval of a card reaches this number of days, the {`'hard', 'good', and 'easy'`} intervals will be consistent. The shorter the interval, the more workload.</div>

            <label htmlFor="w" className="pr-4">w:</label>
            <input name="w" className="input input-bordered w-full"
                type="text"
                aria-label="w"
                defaultValue={JSON.stringify(params.params.w)} />
            <div className="label text-xs">Weights created by running the FSRS optimizer. By default, these are calculated from a sample dataset.</div>

            <div className="flex py-4">
                <label htmlFor="enable_fuzz" className="pr-4">enable_fuzz:</label>
                <input name='enable_fuzz'
                    type="checkbox" className="toggle toggle-info"
                    aria-label="enable fuzz"
                    defaultChecked={params.params.enable_fuzz} />
            </div>
            <div className="label text-xs">When enabled, this adds a small random delay to the new interval time to prevent cards from sticking together and always being reviewed on the same day.</div>

            <label htmlFor="card_limit" className="pr-4">card_limit:</label>
            <input name="card_limit" className="input input-bordered w-full"
                type="number" min={0} step={1}
                aria-label="card limit"
                defaultValue={params.card_limit} />
            <div className="label text-xs">Represents the maximum limit of new cards that can be learned today.</div>

            <label htmlFor="lapses" className="pr-4">lapses:</label>
            <input name="lapses" className="input input-bordered w-full"
                type="number" min={3} step={1}
                aria-label="lapses"
                defaultValue={params.lapses} />
            <div className="label text-xs">The card will automatically pause after reaching that number of lapses.</div>

            <label htmlFor="lingq_token" className="pr-4">lingq_token:<Link className="btn btn-xs" target="_blank" href={"https://www.lingq.com/accounts/apikey/"}>Get Key</Link></label>
            <input name="lingq_token" className="input input-bordered w-full"
                type="text"
                aria-label="lingq token"
                defaultValue={params.lingq_token ?? undefined} />
            <div className="label text-xs">Associate lingq’s card for FSRS scheduling.</div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-x-4">
            <ConfigButtonGroup />
        </div>
    </form>
}