import type { Env } from '@server/bindings.js'
import { getContext } from 'hono/context-storage'

export class ContextUtils {
  static getContext() {
    return getContext<Env>()
  }
}
