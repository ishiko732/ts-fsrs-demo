import React from "react";
import dynamic from "next/dynamic";
import path from "path";
import fs from "fs";

function getNoteNumber(filename:string) {
  const match = filename.match(/_([0-9]+)\.tsx$/);
  return match ? parseInt(match[1]) : Infinity;
}

function comparator(a: string, b: string) {
  const noteNumberA = getNoteNumber(a);
  const noteNumberB = getNoteNumber(b);
  if (noteNumberA !== Infinity && noteNumberB !== Infinity) {
    return noteNumberA - noteNumberB;
  } else if (noteNumberA !== Infinity) {
    return -1;
  } else if (noteNumberB !== Infinity) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
}


async function dynamicReactNodes() {
  const itemsDir = path.join(process.cwd(), "src/components/menu/items");
  const filenames = fs.readdirSync(itemsDir);
  return filenames
    .filter(
      (filename) =>
        path.extname(filename) === ".tsx" && filename !== "index.tsx"
    )
    .sort(comparator)
    .map((filename) => {
      const Item = dynamic(() => import(`./items/${path.basename(filename)}`), {
        loading: () => (
          <li className="w-[54px] h-10">
            <span className="flex mx-auto my-auto loading loading-spinner loading-xs"></span>
          </li>
        ),
      });
      return <Item key={filename} />;
    });
}

export default async function Menu() {
  const menuItems = await dynamicReactNodes();
  return (
    <div className="flex sm:block justify-center sm:fixed bottom-[3rem] right-[16%] m-4 p-4">
      <ul className="flex-row sm:flex-col menu bg-base-200 rounded-box border-2  border-stone-500 dark:border-gray-600">
        {menuItems.map((item) => item)}
      </ul>
    </div>
  );
}
