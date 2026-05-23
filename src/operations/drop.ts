import { Database } from "../Database";

export async function dropTable(
  db: Database,
  table: string,
  ifExists: boolean = true,
): Promise<void> {
  return db.drop({ table, ifExists });
}
