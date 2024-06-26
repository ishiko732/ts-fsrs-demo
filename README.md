# TS-FSRS-Demo

## introduction

Interval Repeat Flashcard Demo with Basic Simple Features Designed based on Next.js App Router, ts-fsrs, and Prisma.

use packages:

````
- prisma (global) npm install -g prisma
- next.js (>= 14.2.0)
- ts-fsrs (>= 3.5.3)
- tailwindcss (>= 3)
- shadcn 
- fsrs-browser (>= 0.6.1)
````

## Environment Variables

 An environment variable is a key value pair of string data that is stored on your machine's local environment. Refer to our [Environment variables reference documentation](https://www.prisma.io/docs/reference/api-reference/environment-variables-reference) for specific details.

> Ref(prisma docs): [https://www.prisma.io/docs/guides/development-environment/environment-variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)

 `.env`  

```bash
DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
DATABASE_URL_WITH_SCHEMA=${DATABASE_URL}&schema=fsrsDemo 
# example
DATABASE_URL="postgres://default:password@abc.com:5432/verceldb?sslmode=require&schema=fsrs"

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=**** # openssl rand -base64 32

# GitHub OAuth https://github.com/settings/developers
GITHUB_ID=***
GITHUB_SECRET=***

# if need lingq server
LINGQ_KEY=**** # copy from http://localhost:3000/api/lingq/key
```

update schema: src/prisma/schema.prisma
```prisma
datasource db {
  provider     = "postgresql" // or mysql
  url          = env("DATABASE_URL")
}
```

## How to run?
- run docker make sure the database is running on your machine: `docker-compose up`
- Configure the database environment and use `npm run db:push`
- Run demo

```bash
npm run dev # or yarn dev/ pnpm dev/ bun dev
```

- Open [localhost:3000](http://localhost:3000)
- Sign In

## Preview

### Home
![home](images/home.png)

> Tip: ts-fsrs version:3.5.3

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

## Settings

![setting-button](images/setting-button.png)
> Click on the button, and you can set up.

![FSRS Settings](images/settings.png)
> You can customize the parameters of your FSRS params

## Train
use `fsrs-browser` to train.

API Router:
http://localhost:3000/api/fsrs/train
![nodejs train](images/apiTrain.png)

Client:
http://localhost:3000/train
![training](images/train.png)


## Build
You can compile the demo for better performance by using `npm run build`, and then start the project using `npm run start`.
![build demo](images/build.png)