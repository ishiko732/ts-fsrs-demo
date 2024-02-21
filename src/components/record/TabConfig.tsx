'use client';
import { Fragment, ReactNode, useState } from "react";

type Props = {
    tabNodes: { tabName: string, component: ReactNode|Promise<ReactNode> }[],
    defaultIndex: number
};


export default function TabConfig({ tabNodes, defaultIndex }: Props) {

    const [activeIndex, setActiveIndex] = useState(defaultIndex);
    const handleClick = (index: number) => {
        setActiveIndex(index);
    }
    return <div role="tablist" className="tabs tabs-lifted w-full tabs-lg">
        {
            tabNodes.map((tab, index) => {
                return <Fragment key={tab.tabName}>
                    <input type="radio"
                        name="tabConfig"
                        role="tab"
                        className="tab"
                        aria-label={tab.tabName}
                        onChange={() => handleClick(index)}
                        checked={activeIndex === index} />
                    <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">{tab.component}</div>
                </Fragment>
            })
        }
    </div>
}