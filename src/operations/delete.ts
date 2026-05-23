import { Database } from "../Database";
import { WhereCondition } from "../types";

export async function deleteRecords(
  db: Database,
  table: string,
  where?: WhereCondition | WhereCondition[],
): Promise<number> {
  return db.delete({ table, where });
}

export async function deleteById(
  db: Database,
  table: string,
  id: number,
  idField: string = "id",
): Promise<number> {
  return db.delete({
    table,
    where: { field: idField, operator: "=", value: id },
  });
}

export async function deleteAll(db: Database, table: string): Promise<number> {
  return db.delete({ table });
}
