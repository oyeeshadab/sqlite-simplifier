import { Database } from "../Database";
import { WhereCondition } from "../types";

export async function select<T = any>(
  db: Database,
  table: string,
  where?: WhereCondition | WhereCondition[],
): Promise<T[]> {
  return db.select<T>({ table, where });
}

export async function selectAll<T = any>(
  db: Database,
  table: string,
): Promise<T[]> {
  return db.select<T>({ table });
}

export async function selectById<T = any>(
  db: Database,
  table: string,
  id: number,
  idField: string = "id",
): Promise<T | null> {
  const results = await db.select<T>({
    table,
    where: { field: idField, operator: "=", value: id },
    limit: 1,
  });
  return results[0] || null;
}

export async function selectWithFields<T = any>(
  db: Database,
  table: string,
  fields: string[],
  where?: WhereCondition | WhereCondition[],
): Promise<T[]> {
  return db.select<T>({ table, fields, where });
}

export async function selectFirst<T = any>(
  db: Database,
  table: string,
  where?: WhereCondition | WhereCondition[],
): Promise<T | null> {
  const results = await db.select<T>({ table, where, limit: 1 });
  return results[0] || null;
}
