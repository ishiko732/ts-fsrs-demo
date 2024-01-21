interface MenuConfig {
  component: string;
  sort: number;
  filter?: boolean;
}

type Configs = {
  [key: string]: MenuConfig;
};

const addNote = {
  component: "addNote.tsx",
  sort: 1,
};

const searchNote = {
  component: "searchNote.tsx",
  sort: 2,
};
const Test = [
  {
    component: "clientTest.tsx",
    sort: 3,
    filter: process.env.NODE_ENV !== "production",
  },
  {
    component: "serverTest.tsx",
    sort: 4,
    filter: process.env.NODE_ENV !== "production",
  },
];

const Configs: Configs = {
  [`${addNote.component}`]: addNote,
  [`${searchNote.component}`]: searchNote,
  ...Test.reduce((acc, cur) => ({ ...acc, [cur.component]: cur }), {}),
};
export default Configs;
