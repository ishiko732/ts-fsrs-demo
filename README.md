# TS-FSRS-Demo

## Train

You can now use this port for training: https://optimizer.parallelveil.com

Open Source Code: https://github.com/ishiko732/analyzer-and-train

## introduction

Interval Repeat Flashcard Demo with Basic Simple Features Designed based on Next.js App Router, ts-fsrs, Hono.js and kysely.

use packages:

````
- next.js (>= 14.2.0)
- ts-fsrs (>= 3.5.3)
- hono.js
- kysely
- tailwindcss (>= 3)
- shadcn 
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

# if need extra server
# RSA
# openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
RSA_PRIVATE_KEY=""
# openssl rsa -in private.pem -pubout -out public.pem
RSA_PUBLIC_KEY=""
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


## Build
You can compile the demo for better performance by using `npm run build`, and then start the project using `npm run start`.
![build demo](images/build.png)