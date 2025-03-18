declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      GITHUB_ID: string
      GITHUB_SECRET: string
      GITHUB_ADMIN_ID: string
      LINGQ_KEY: string
      CRON_SECRET: string
    }
  }
}

type Required<T, K extends keyof T> = T & {
  [key in K]-?: T[key]
}