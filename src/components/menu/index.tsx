import React from "react";
import dynamic from "next/dynamic";
import path from "path";
import fs from "fs";

async function dynamicReactNodes() {
  const itemsDir = path.join(process.cwd(), "src/components/menu/items");
  const filenames = fs.readdirSync(itemsDir);
  return filenames
    .filter(
      (filename) =>
        path.extname(filename) === ".tsx" && filename !== "index.tsx"
    )
    .map((filename) => {
      const Item = dynamic(() => import(`./items/${path.basename(filename)}`), {
        loading: () => (
          <li>
            <span className="loading loading-spinner loading-md"></span>
          </li>
        ),
      });
      return <Item key={filename} />;
    });
}

export default async function Menu() {
  const menuItems = await dynamicReactNodes();
  return (
    <div className="sm:fixed bottom-[3rem] right-[16%] m-4 p-4">
      <ul className="menu bg-base-200 rounded-box border-2  border-stone-500 dark:border-gray-600">
        {menuItems.map((item) => item)}
      </ul>
    </div>
  );
}
