import { Database } from "../Database";

export async function insert(
  db: Database,
  table: string,
  data: Record<string, any>,
): Promise<number> {
  return db.insert({ table, data });
}

export async function insertMany(
  db: Database,
  table: string,
  dataArray: Record<string, any>[],
): Promise<number[]> {
  const results: number[] = [];
  for (const data of dataArray) {
    const id = await db.insert({ table, data });
    results.push(id);
  }
  return results;
}
