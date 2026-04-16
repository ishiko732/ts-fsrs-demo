# ts-fsrs-demo

A spaced-repetition flashcard demo built on [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs), showcasing the FSRS algorithm in a minimal Next.js application.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Run](#run)
  - [Build](#build)
- [Screenshots](#screenshots)
- [Training](#training)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) / npm / yarn / bun
- Docker (for the local PostgreSQL instance)

### Environment Variables

Create a `.env` file in the project root. The variables below are required; see the [Prisma environment variables reference](https://www.prisma.io/docs/reference/api-reference/environment-variables-reference) for background on the URL format.

```bash
# PostgreSQL connection string
DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
DATABASE_URL_WITH_SCHEMA="${DATABASE_URL}&schema=fsrsDemo"

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=      # openssl rand -base64 32

# GitHub OAuth — https://github.com/settings/developers (used for production sign-in)
GITHUB_ID=
GITHUB_SECRET=
# Optional: GitHub user id treated as admin (default 62931549)
GITHUB_ADMIN_ID=62931549

# In non-production environments (NODE_ENV=development or vercel preview/dev),
# Better Auth's email/password provider is enabled with auto-signup; visit
# /signin and click "Sign in as Dev (preview)" to log in as the default user.

# Optional: RSA keys for an external service
# openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
RSA_PRIVATE_KEY=""
# openssl rsa -in private.pem -pubout -out public.pem
RSA_PUBLIC_KEY=""
```

### Installation

```bash
pnpm install
```

### Run

1. Start PostgreSQL via Docker:

   ```bash
   pnpm docker        # alias for `docker compose up`
   ```

2. Push the schema to the database:

   ```bash
   pnpm db:push
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Open <http://localhost:3000> and sign in.

### Build

```bash
pnpm build
pnpm start
```

![build demo](images/build.png)

## Screenshots

### Home

![home](images/home.png)

### Notes

![notes list](images/notes.png)

View added notes and their status. Click a note to open its detail page.

![note detail](images/detail.png)
![note forget](images/forget.png)

On the detail page you can click **forget** to reset the learning state of the card.

### Review

![question](images/question-font.png)
![answer](images/answer.png)

Keyboard shortcuts are supported for revealing the answer and grading. Use `Ctrl+Z` / `⌘+Z` to undo the last review.

![finish](images/finish.png)

A completion message is shown after finishing a review session.

### Settings

![setting button](images/setting-button.png)
![FSRS settings](images/settings.png)

Customize the FSRS parameters under settings.

## Training

Train your own FSRS parameters using the hosted optimizer:

- Hosted tool: <https://optimizer.parallelveil.com>
- Source code: <https://github.com/ishiko732/analyzer-and-train>

## License

See [LICENSE](./LICENSE).
