import userModel, { type UserTable } from '@server/models/users'
import type { Insertable, Selectable } from 'kysely'

class UserService {
  private async findUser(user: Partial<Selectable<UserTable>>) {
    const { oauthType, oauthId, email, id } = user
    let user_from_db: Selectable<UserTable> | undefined | null
    if (oauthType && oauthId) {
      user_from_db = await userModel.db
        .selectFrom('users')
        .selectAll()
        .where('oauthType', '=', oauthType)
        .where('oauthId', '=', oauthId)
        .executeTakeFirst()
    } else if (email) {
      user_from_db = await userModel.db.selectFrom('users').selectAll().where('email', '=', email).executeTakeFirst()
    } else if (id) {
      user_from_db = await userModel.findById(id)
    } else {
      throw new Error('Invalid user data')
    }
    return user_from_db ?? null
  }
  async createUser(user: Omit<Insertable<UserTable>, 'created' | 'updated'>) {
    const user_from_db = await this.findUser(user)
    if (user_from_db) {
      return { user: user_from_db, isNew: false }
    }
    const now = new Date()

    const newUser = await userModel.insertOne({
      name: user.name,
      email: user.email,
      password: user.password,
      oauthId: user.oauthId,
      oauthType: user.oauthType,
      created: +now,
      updated: +now,
    })
    return { user: newUser, isNew: true }
  }
}

export const userService = new UserService()
export default userService
