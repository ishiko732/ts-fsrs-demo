import { db } from '@libs/db'
import type { Database } from '@models/index'
import type { Insertable, Kysely, Selectable, Updateable } from 'kysely'

type TablesOperationMap<T extends keyof Database = keyof Database> = {
  [K in T]: {
    select: Selectable<Database[K]>
    insert: Insertable<Database[K]>
    update: Updateable<Database[K]>
  }
}

type OperationDataType<T extends keyof Database, Op extends 'select' | 'update' | 'insert'> = TablesOperationMap[T][Op]

export class BaseModel<T extends keyof Database, P extends keyof Database[T] = 'id'> {
  protected readonly tableName: T
  protected readonly primaryKey: P

  constructor(tablename: T, primaryKey: P = 'id' as P) {
    this.tableName = tablename
    this.primaryKey = primaryKey
  }

  get db(): Kysely<Database> {
    return db
  }

  get table(): T {
    return this.tableName
  }

  // insertOne 方法接受与表结构匹配的数据
  async insertOne(data: OperationDataType<T, 'insert'>) {
    return db.insertInto(this.tableName).values(data).returningAll().executeTakeFirstOrThrow()
  }

  async findById(id: keyof P) {
    const result = await db
      .selectFrom(this.tableName)
      .selectAll()
      // @ts-expect-error 无法推断出返回值类型
      .where(this.primaryKey, '=', id)
      .limit(1)
      .executeTakeFirst()
    return result ?? null
  }

  // updateOne 方法接受与表结构匹配的数据
  async updateOne(id: keyof P, data: OperationDataType<T, 'update'>) {
    const [{ numUpdatedRows, numChangedRows }] = await db
      .updateTable(this.tableName)
      // @ts-expect-error 无法推断出类型
      .set(data)
      // @ts-expect-error 基类无法推断出返回值类型
      .where(this.primaryKey, '=', id)
      .execute()
    const updated = numUpdatedRows === BigInt(1) && numChangedRows === BigInt(1)
    return updated
  }

  // use static getter to get the table name
  static get tableName(): keyof Database {
    return this.tableName
  }
}
