import { db } from '@libs/db.js'
import type { Database } from '@models/index'
import type { Insertable, Kysely, Selectable, Updateable } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DiscriminatedUnionOfRecord<T extends Record<string, any>> = {
  [Key in keyof T]: { [S in Key]: T[S] }
}[keyof T]

type TablesOperationMap<T extends keyof Database = keyof Database> = {
  [K in T]: {
    select: Selectable<Database[K]>
    insert: Insertable<Database[K]>
    update: Updateable<Database[K]>
  }
}

type TableOpsUnion = DiscriminatedUnionOfRecord<TablesOperationMap<keyof Database>>

type OperationDataType<T extends keyof Database, Op extends 'select' | 'update' | 'insert'> = T extends keyof TableOpsUnion
  ? TableOpsUnion[T][Op]
  : never

type GetOperandType<
  T extends keyof TablesOperationMap,
  Op extends keyof TablesOperationMap[T],
  Key extends keyof TablesOperationMap[T][Op],
> = unknown extends TablesOperationMap[T][Op][Key]
  ? never
  : TablesOperationMap[T][Op][Key] extends never
    ? never
    : TablesOperationMap[T][Op][Key] extends number
      ? number
      : TablesOperationMap[T][Op][Key] extends string
        ? string
        : TablesOperationMap[T][Op][Key]

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

  // insertOne 方法接受与表结构匹配的数据
  async insertOne(data: OperationDataType<T, 'insert'>) {
    return db.insertInto(this.tableName).values(data).returningAll().executeTakeFirstOrThrow()
  }

  // @ts-expect-error 基类无法推断出返回值类型
  async findById(id: GetOperandType<T, 'select', P>) {
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
  async updateOne(
    // @ts-expect-error 基类无法推断出返回值类型
    id: GetOperandType<T, 'select', P>,
    data: OperationDataType<T, 'update'>,
  ) {
    const [{ numUpdatedRows, numChangedRows }] = await db
      .updateTable(this.tableName)
      .set(data)
      // @ts-expect-error 基类无法推断出返回值类型
      .where(this.primaryKey, '=', id)
      .execute()
    return { numChangedRows, numUpdatedRows }
  }

  // use static getter to get the table name
  static get tableName(): keyof Database {
    return this.tableName
  }
}
