# TS-FSRS-Demo

## introduction

Interval Repeat Flashcard Demo with Basic Simple Features Designed based on Next.js App Router, ts-fsrs, and Prisma.

use packages:

````
- prisma (global) npm install -g prisma
- dotenv (global) npm install -g dotenv
- next.js (>= 13.4.0)
- ts-fsrs (>= 3.1.1)
- tailwindcss (>= 3)
- daisyui (>= 3.9.0)
````

## Environment Variables

 An environment variable is a key value pair of string data that is stored on your machine's local environment. Refer to our [Environment variables reference documentation](https://www.prisma.io/docs/reference/api-reference/environment-variables-reference) for specific details.

> Ref(prisma docs): [https://www.prisma.io/docs/guides/development-environment/environment-variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)

 `.env.local`  

```bash
DATABASE_URL="mysql://username:password@localhost:3306/fsrsDemo"
DATABASE_URL_WITH_SCHEMA=${DATABASE_URL}?schema=fsrsDemo
```

## How to run?

- Configure the database environment and use `npm run dbpush`
- Copy the [public/プログラミング必須英単語600+.json](https://github.com/ishiko732/ts-fsrs-demo/blob/main/public/%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0%E5%BF%85%E9%A0%88%E8%8B%B1%E5%8D%98%E8%AA%9E600%2B.json)  content and request the `/api/refresh` endpoint to load the data
- Run demo

```bash
npm run dev # or yarn dev/ pnpm dev/ bun dev
```

- Open [localhost:3000](http://localhost:3000)

## Display

### Home
![home](images/home.png)

> Tip: ts-fsrs version:3.1.1

### Notes
![Notes](images/notes.png)
> You can view the added note information and status here, and click on each note to enter the detailed note page.

![note detail](images/detail.png)
![note forget](images/forget.png)

> You can view detailed information about the note on this page, and you can click "forget" to reset the learning status of that card.

### Review

![question](images/question-font.png)
![show answer](images/answer.png)
> You can perform review operations on the review page, and it is possible to display the answer using the keyboard. You can also schedule the timing and use `Ctrl+Z` or `⌘+Z` to undo or revert the operation.

![finish](images/finish.png) 
> After completing the review, you will be prompted accordingly.

## Build
You can compile the demo for better performance by using `npm run build`, and then start the project using `npm run start`.
![build demo](images/build.png)
