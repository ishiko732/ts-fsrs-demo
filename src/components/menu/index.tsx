import React from 'react';
import dynamic from 'next/dynamic';
import path from 'path';
import fs from 'fs';
import Configs from './menu.config';
import LoadingMenu from './loading-menu';

function comparator(a: string, b: string) {
  const sortA = Configs[a]?.sort ?? Infinity;
  const sortB = Configs[b]?.sort ?? Infinity;
  if (sortA !== Infinity && sortB !== Infinity) {
    return sortA - sortB;
  } else if (sortA !== Infinity) {
    return -1;
  } else if (sortB !== Infinity) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
}

async function dynamicReactNodes() {
  const itemsDir = path.join(process.cwd(), 'src/components/menu/items');
  const filenames = fs.readdirSync(itemsDir);
  return filenames
    .filter(
      (filename) =>
        path.extname(filename) === '.tsx' && filename !== 'index.tsx'
    )
    .filter((filename) => Configs[filename]?.filter ?? true)
    .sort(comparator)
    .map((filename) => {
      const Item = dynamic(() => import(`./items/${path.basename(filename)}`), {
        loading: () => (
          <li className='w-[54px] h-10'>
            <LoadingMenu />
          </li>
        ),
      });
      return <Item key={filename} />;
    });
}

export default async function Menu() {
  const menuItems = await dynamicReactNodes();
  return (
    <div className='flex sm:block justify-center sm:fixed bottom-[3rem] right-[4rem] m-4 p-4 z-[999]'>
      <ul className='flex-row sm:flex-col menu bg-base-200 rounded-box border-2  border-stone-500 dark:border-gray-600'>
        {menuItems.map((item) => item)}
      </ul>
    </div>
  );
}
