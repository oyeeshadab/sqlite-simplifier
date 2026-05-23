export interface DatabaseConfig {
  name: string;
  location?: string;
}

export interface WhereCondition {
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN";
  value: any;
}

export interface InsertOptions {
  table: string;
  data: Record<string, any>;
  onConflict?: "ROLLBACK" | "ABORT" | "FAIL" | "IGNORE" | "REPLACE";
}

export interface SelectOptions {
  table: string;
  fields?: string[];
  where?: WhereCondition | WhereCondition[];
  orderBy?: { field: string; direction?: "ASC" | "DESC" };
  limit?: number;
  offset?: number;
}

export interface UpdateOptions {
  table: string;
  data: Record<string, any>;
  where?: WhereCondition | WhereCondition[];
}

export interface DeleteOptions {
  table: string;
  where?: WhereCondition | WhereCondition[];
}

export interface DropOptions {
  table: string;
  ifExists?: boolean;
}

export type QueryResult = any[];

export interface DatabaseInterface {
  insert(options: InsertOptions): Promise<number>;
  select<T = any>(options: SelectOptions): Promise<T[]>;
  update(options: UpdateOptions): Promise<number>;
  delete(options: DeleteOptions): Promise<number>;
  drop(options: DropOptions): Promise<void>;
  executeQuery(sql: string, params?: any[]): Promise<any[]>;
  close(): Promise<void>;
}

// Add ToggleReturn interface
export interface ToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}
