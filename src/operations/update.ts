import { Database } from "../Database";
import { WhereCondition } from "../types";

export async function update(
  db: Database,
  table: string,
  data: Record<string, any>,
  where?: WhereCondition | WhereCondition[],
): Promise<number> {
  return db.update({ table, data, where });
}

export async function updateById(
  db: Database,
  table: string,
  id: number,
  data: Record<string, any>,
  idField: string = "id",
): Promise<number> {
  return db.update({
    table,
    data,
    where: { field: idField, operator: "=", value: id },
  });
}
