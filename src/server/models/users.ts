import { BaseModel } from '@libs/table'
import type { ColumnType, Generated } from 'kysely'

export interface UserTable {
  id: Generated<number>
  
  name: ColumnType<string, string, never>
  email: ColumnType<string, string, never>
  password?: string
  oauthId: ColumnType<string, string, never>
  oauthType: ColumnType<string, string, never>
  created: number
  updated: number
}

class UserModel extends BaseModel<'users'> {
  constructor() {
    super('users')
  }
}

export const userModel = new UserModel()
export default userModel
