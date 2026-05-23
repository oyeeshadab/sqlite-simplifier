import { Database } from "./Database";

/**
 * ============================================
 * OPERATORS
 * ============================================
 */

export type SQLOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "LIKE"
  | "IN"
  | "NOT IN"
  | "BETWEEN"
  | "IS NULL"
  | "IS NOT NULL";

/**
 * ============================================
 * QUERY TYPES
 * ============================================
 */

export enum QueryType {
  SELECT = "SELECT",
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

/**
 * ============================================
 * TYPES
 * ============================================
 */

export interface WhereCondition {
  field: string;
  operator: SQLOperator;
  value?: any;
  logicalOperator?: "AND" | "OR";
}

export interface includeClause {
  tableName: string;
  localKey: string;
  foreignKey: string;
  type?: "left" | "inner" | "right";
}

export interface RelationConfig {
  table: string;
  localKey: string;
  foreignKey: string;
  type?: "left" | "inner" | "right";
}

export interface OrderByCondition {
  field: string;
  direction?: "ASC" | "DESC";
}

export interface QueryOptions {
  select?: Record<string, string>;
  include?: Record<string, any> | includeClause;
  where?: Record<string, any> | WhereCondition[];
  groupBy?: string | string[];
  having?: WhereCondition[];
  orderBy?: OrderByCondition | OrderByCondition[];
  limit?: number;
  offset?: number;
  distinct?: boolean;
  count?: {
    column?: string;
    as?: string;
  };
}

export interface InsertOptions {
  data: Record<string, any>;
}

export interface UpdateQueryOptions {
  data: Record<string, any>;
  where?: Record<string, any> | WhereCondition[];
}

export interface DeleteQueryOptions {
  where?: Record<string, any> | WhereCondition[];
}

/**
 * ============================================
 * HELPERS
 * ============================================
 */

export function where(
  field: string,
  operator: SQLOperator,
  value?: any,
): WhereCondition {
  return {
    field,
    operator,
    value,
    logicalOperator: "AND",
  };
}

export function orWhere(
  field: string,
  operator: SQLOperator,
  value?: any,
): WhereCondition {
  return {
    field,
    operator,
    value,
    logicalOperator: "OR",
  };
}

export function asc(field: string): OrderByCondition {
  return {
    field,
    direction: "ASC",
  };
}

export function desc(field: string): OrderByCondition {
  return {
    field,
    direction: "DESC",
  };
}

export function sum(field: string): string {
  return `SUM(${field})`;
}

export function avg(field: string): string {
  return `AVG(${field})`;
}

export function count(field: string): string {
  return `COUNT(${field})`;
}

export function min(field: string): string {
  return `MIN(${field})`;
}

export function max(field: string): string {
  return `MAX(${field})`;
}

/**
 * ============================================
 * SIMPLIFIED QUERY BUILDER
 * ============================================
 */

export class QueryBuilderSimplified {
  private table: string;
  private advancedQuery: AdvancedQuery;
  private selectFields: string[] = [];
  private relations: Record<string, any> = {};
  private whereConditions: Record<string, any> = {};
  private groupByFields: string[] = [];
  private orderByFields: Array<{ field: string; direction: "ASC" | "DESC" }> =
    [];
  private limitValue?: number;
  private offsetValue?: number;
  private aggregates: Array<{ alias: string; expression: string }> = [];
  private includeRelations: Record<string, boolean> = {};

  constructor(table: string, advancedQuery: AdvancedQuery) {
    this.table = table;
    this.advancedQuery = advancedQuery;
  }

  select(...fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  selectAll(): this {
    this.selectFields = [];
    return this;
  }

  aggregate(alias: string, expression: string): this {
    this.aggregates.push({ alias, expression });
    return this;
  }

  count(alias: string, field: string = "*"): this {
    return this.aggregate(alias, `COUNT(${field})`);
  }

  sum(alias: string, field: string): this {
    return this.aggregate(alias, `SUM(${field})`);
  }

  avg(alias: string, field: string): this {
    return this.aggregate(alias, `AVG(${field})`);
  }

  max(alias: string, field: string): this {
    return this.aggregate(alias, `MAX(${field})`);
  }

  min(alias: string, field: string): this {
    return this.aggregate(alias, `MIN(${field})`);
  }

  join(relation: string, config?: Partial<RelationConfig>): this {
    this.includeRelations[relation] = true;
    this.relations[relation] = config || {
      table: relation,
      localKey: `${this.table}_id`,
      foreignKey: "id",
    };
    return this;
  }

  leftJoin(relation: string, localKey?: string, foreignKey?: string): this {
    this.includeRelations[relation] = true;
    this.relations[relation] = {
      table: relation,
      localKey: localKey || `${this.table}_id`,
      foreignKey: foreignKey || "id",
      type: "left",
    };
    return this;
  }

  innerJoin(relation: string, localKey?: string, foreignKey?: string): this {
    this.includeRelations[relation] = true;
    this.relations[relation] = {
      table: relation,
      localKey: localKey || `${this.table}_id`,
      foreignKey: foreignKey || "id",
      type: "inner",
    };
    return this;
  }

  where(conditions: Record<string, any>): this {
    this.whereConditions = { ...this.whereConditions, ...conditions };
    return this;
  }

  groupBy(...fields: string[]): this {
    this.groupByFields = fields;
    return this;
  }

  orderBy(field: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.orderByFields.push({ field, direction });
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  private build(): QueryOptions {
    const select: Record<string, string> = {};

    if (this.selectFields.length > 0) {
      this.selectFields.forEach((field) => {
        select[field] = field;
      });
    }

    this.aggregates.forEach((agg) => {
      select[agg.alias] = agg.expression;
    });

    const include: Record<string, boolean> = {};
    Object.keys(this.includeRelations).forEach((rel) => {
      include[rel] = true;
    });

    return {
      select: Object.keys(select).length > 0 ? select : undefined,
      include: Object.keys(include).length > 0 ? include : undefined,
      where: this.whereConditions,
      groupBy: this.groupByFields.length > 0 ? this.groupByFields : undefined,
      orderBy: this.orderByFields,
      limit: this.limitValue,
      offset: this.offsetValue,
    };
  }

  async get<T = any>(): Promise<T[]> {
    const options = this.build();

    if (Object.keys(this.relations).length > 0) {
      this.advancedQuery.defineRelations(this.table, this.relations);
    }

    return this.advancedQuery.find<T>(this.table, options);
  }

  async first<T = any>(): Promise<T | null> {
    this.limitValue = 1;
    const options = this.build();

    if (Object.keys(this.relations).length > 0) {
      this.advancedQuery.defineRelations(this.table, this.relations);
    }

    return this.advancedQuery.findFirst<T>(this.table, options);
  }
}

/**
 * ============================================
 * ADVANCED QUERY
 * ============================================
 */

export class AdvancedQuery {
  private db: Database;
  private relations: Record<string, Record<string, RelationConfig>> = {};
  private enableLogging: boolean = false;
  private pendingQueries: Map<string, Promise<any>> = new Map();
  private lastQueryTime: number = 0;
  private readonly MIN_QUERY_INTERVAL_MS = 16;

  constructor(db: Database, enableLogging: boolean = false) {
    this.db = db;
    this.enableLogging = enableLogging;
  }

  /**
   * ============================================
   * DEFINE RELATIONS
   * ============================================
   */

  defineRelations(table: string, relations: Record<string, RelationConfig>) {
    this.relations[table] = relations;
  }

  defineAllRelations(
    relationsConfig: Record<string, Record<string, RelationConfig>>,
  ) {
    this.relations = { ...this.relations, ...relationsConfig };
  }

  /**
   * ============================================
   * QUERY BUILDER
   * ============================================
   */

  query(table: string): QueryBuilderSimplified {
    return new QueryBuilderSimplified(table, this);
  }

  /**
   * ============================================
   * SIMPLIFIED METHODS
   * ============================================
   */

  async findWhere<T = any>(
    table: string,
    where: Record<string, any>,
    options?: Partial<QueryOptions>,
  ): Promise<T[]> {
    return this.find<T>(table, {
      where,
      ...options,
    });
  }

  async findById<T = any>(
    table: string,
    id: number | string,
  ): Promise<T | null> {
    return this.findFirst<T>(table, {
      where: { id },
    });
  }

  async withCount<T = any>(
    table: string,
    relation: string,
    groupByField: string = "id",
  ): Promise<T[]> {
    return this.query(table)
      .leftJoin(relation)
      .groupBy(`${table}.${groupByField}`)
      .count(`${relation}Count`, `${relation}.id`)
      .get<T>();
  }

  async exists(table: string, where: Record<string, any>): Promise<boolean> {
    const result = await this.findFirst(table, { where, select: { id: "id" } });
    return result !== null;
  }

  /**
   * ============================================
   * CORE METHODS
   * ============================================
   */

  async find<T = any>(table: string, options: QueryOptions = {}): Promise<T[]> {
    const queryKey = this.getQueryKey("find", table, options);

    if (this.pendingQueries.has(queryKey)) {
      if (this.enableLogging) {
        console.warn(`⚠️ Duplicate find query blocked for ${table}`);
      }
      return this.pendingQueries.get(queryKey) as Promise<T[]>;
    }

    const now = Date.now();
    if (now - this.lastQueryTime < this.MIN_QUERY_INTERVAL_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.MIN_QUERY_INTERVAL_MS),
      );
    }
    this.lastQueryTime = Date.now();

    const promise = (async () => {
      try {
        const { sql, params } = this.buildSelectQuery(table, options);

        const results = await this.db.executeQuery(sql, params);
        return results as T[];
      } catch (error) {
        throw error;
      } finally {
        this.pendingQueries.delete(queryKey);
      }
    })();

    this.pendingQueries.set(queryKey, promise);
    return promise;
  }

  async findFirst<T = any>(
    table: string,
    options: QueryOptions = {},
  ): Promise<T | null> {
    const limitedOptions = { ...options, limit: 1 };
    const results = await this.find<T>(table, limitedOptions);
    return results.length > 0 ? (results[0] as T) : null;
  }

  async insert(table: string, options: InsertOptions): Promise<number> {
    try {
      const { sql, params } = this.buildInsertQuery(table, options);
      const result = await this.db.executeQuery(sql, params);
      return result.insertId || 0;
    } catch (error) {
      throw error;
    }
  }

  async update(table: string, options: UpdateQueryOptions): Promise<number> {
    try {
      const { sql, params } = this.buildUpdateQuery(table, options);
      const result = await this.db.executeQuery(sql, params);
      return result.rowsAffected || 0;
    } catch (error) {
      throw error;
    }
  }

  async updateById(
    table: string,
    id: number | string,
    data: Record<string, any>,
  ): Promise<number> {
    return this.update(table, {
      data,
      where: { id },
    });
  }

  async delete(table: string, options: DeleteQueryOptions): Promise<number> {
    try {
      const { sql, params } = this.buildDeleteQuery(table, options);
      const result = await this.db.executeQuery(sql, params);
      return result.rowsAffected || 0;
    } catch (error) {
      throw error;
    }
  }

  async deleteById(table: string, id: number | string): Promise<number> {
    return this.delete(table, {
      where: { id },
    });
  }

  async count(table: string, where?: Record<string, any>): Promise<number> {
    const options: QueryOptions = {
      select: { count: "COUNT(*)" },
    };

    if (where) {
      options.where = where;
    }

    const results = await this.find(table, options);
    return results[0]?.count || 0;
  }

  async raw<T = any>(sql: string, params: any[] = []): Promise<T> {
    try {
      return await this.db.executeQuery(sql, params);
    } catch (error) {
      throw error;
    }
  }

  setLogging(enabled: boolean): void {
    this.enableLogging = enabled;
    this.db.setLogging(enabled);
  }

  clearCache(): void {
    this.pendingQueries.clear();
    this.db.clearQueryCache();
  }

  private getQueryKey(method: string, table: string, options: any): string {
    return `${method}:${table}:${JSON.stringify(options)}`;
  }

  /**
   * ============================================
   * BUILD METHODS
   * ============================================
   */

  private buildSelectQuery(
    table: string,
    options: QueryOptions,
  ): { sql: string; params: any[] } {
    const params: any[] = [];
    let sql = `${QueryType.SELECT} `;

    if (options.distinct) {
      sql += `DISTINCT `;
    }

    sql += `${this.buildSelectClause(table, options)}\n`;
    if (options.count) {
      const column = options.count.column || "*";
      const alias = options.count.as || "count";
      const countColumn = column === "*" ? "*" : this.sanitizeColumn(column);

      sql += `,COUNT(${countColumn}) AS ${this.sanitizeIdentifier(alias)}\n`;
    }
    sql += `FROM ${this.sanitizeIdentifier(table)}\n`;
    sql += this.buildJoins(table, options);

    const whereClause = this.buildWhereClause(options.where, params);
    if (whereClause) {
      sql += `WHERE ${whereClause}\n`;
    }

    if (options.groupBy) {
      const groupBy = Array.isArray(options.groupBy)
        ? options.groupBy.join(", ")
        : options.groupBy;
      sql += `GROUP BY ${groupBy}\n`;
    }

    const havingClause = this.buildHavingClause(options.having, params);
    if (havingClause) {
      sql += `HAVING ${havingClause}\n`;
    }

    const orderByClause = this.buildOrderByClause(options.orderBy);
    if (orderByClause) {
      sql += `${orderByClause}\n`;
    }

    if (options.limit !== undefined) {
      sql += `LIMIT ${options.limit}\n`;
    }

    if (options.offset !== undefined) {
      sql += `OFFSET ${options.offset}\n`;
    }

    return { sql, params };
  }

  private buildInsertQuery(
    table: string,
    options: InsertOptions,
  ): { sql: string; params: any[] } {
    const fields = Object.keys(options.data);
    const placeholders = fields.map(() => "?").join(", ");
    const params = Object.values(options.data);

    const sql = `
      ${QueryType.INSERT} INTO ${this.sanitizeIdentifier(table)}
      (${fields.map((f) => this.sanitizeIdentifier(f)).join(", ")})
      VALUES (${placeholders})
    `;

    return { sql, params };
  }

  private buildUpdateQuery(
    table: string,
    options: UpdateQueryOptions,
  ): { sql: string; params: any[] } {
    const params: any[] = [];
    let sql = `${QueryType.UPDATE} ${this.sanitizeIdentifier(table)} SET `;

    const setClause = Object.keys(options.data)
      .map((field) => {
        params.push(options.data[field]);
        return `${this.sanitizeIdentifier(field)} = ?`;
      })
      .join(", ");

    sql += setClause;

    const whereClause = this.buildWhereClause(options.where, params);
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }

    return { sql, params };
  }

  private buildDeleteQuery(
    table: string,
    options: DeleteQueryOptions,
  ): { sql: string; params: any[] } {
    const params: any[] = [];
    let sql = `${QueryType.DELETE} FROM ${this.sanitizeIdentifier(table)}`;

    const whereClause = this.buildWhereClause(options.where, params);
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }

    return { sql, params };
  }

  private buildSelectClause(table: string, options: QueryOptions): string {
    if (!options.select) {
      return `${this.sanitizeIdentifier(table)}.*`;
    }

    const parts: string[] = [];

    for (const [alias, value] of Object.entries(options.select)) {
      if (value.includes(".")) {
        const [relationName, field] = value.split(".");
        const relation = relationName
          ? this.relations[table]?.[relationName]
          : undefined;

        if (relation && field) {
          parts.push(
            `${this.sanitizeIdentifier(relation.table)}.${this.sanitizeIdentifier(field)} as ${this.sanitizeIdentifier(alias)}`,
          );
        } else if (field) {
          parts.push(`${value} as ${this.sanitizeIdentifier(alias)}`);
        } else {
          parts.push(`${this.sanitizeIdentifier(alias)}`);
        }
        continue;
      }

      if (value.includes("(")) {
        parts.push(`${value} as ${this.sanitizeIdentifier(alias)}`);
        continue;
      }

      parts.push(
        `${this.sanitizeIdentifier(table)}.${this.sanitizeIdentifier(value)} as ${this.sanitizeIdentifier(alias)}`,
      );
    }

    return parts.join(", ");
  }

  private buildJoins(table: string, options: QueryOptions): string {
    if (!options.include) {
      return "";
    }

    const { tableName, localKey, foreignKey, type = "LEFT" } = options.include;

    if (!tableName || !localKey || !foreignKey) {
      return "";
    }
    const joinType = (type || "LEFT").toUpperCase();

    return `
    ${joinType} JOIN ${this.sanitizeIdentifier(tableName)}
    ON ${this.sanitizeIdentifier(table)}.${this.sanitizeIdentifier(localKey)}
    = ${this.sanitizeIdentifier(tableName)}.${this.sanitizeIdentifier(foreignKey)}
    `;
  }

  private buildWhereClause(
    where: Record<string, any> | WhereCondition[] | undefined,
    params: any[],
  ): string {
    if (!where) return "";

    const conditions: string[] = [];

    if (!Array.isArray(where)) {
      for (const [field, value] of Object.entries(where)) {
        conditions.push(`${this.sanitizeIdentifier(field)} = ?`);
        params.push(value);
      }
      return conditions.join(" AND ");
    }

    where.forEach((condition, index) => {
      const sql = this.buildCondition(condition, params);
      if (index === 0) {
        conditions.push(sql);
      } else {
        conditions.push(`${condition.logicalOperator || "AND"} ${sql}`);
      }
    });

    return conditions.join(" ");
  }

  private buildCondition(condition: WhereCondition, params: any[]): string {
    const field = this.sanitizeIdentifier(condition.field);

    switch (condition.operator) {
      case "IN":
      case "NOT IN":
        const placeholders = condition.value.map(() => "?").join(", ");
        params.push(...condition.value);
        return `${field} ${condition.operator} (${placeholders})`;

      case "BETWEEN":
        params.push(condition.value[0]);
        params.push(condition.value[1]);
        return `${field} BETWEEN ? AND ?`;

      case "IS NULL":
      case "IS NOT NULL":
        return `${field} ${condition.operator}`;

      default:
        params.push(condition.value);
        return `${field} ${condition.operator} ?`;
    }
  }

  private buildHavingClause(
    having: WhereCondition[] | undefined,
    params: any[],
  ): string {
    if (!having?.length) return "";

    const conditions: string[] = [];
    having.forEach((condition, index) => {
      const sql = this.buildCondition(condition, params);
      if (index === 0) {
        conditions.push(sql);
      } else {
        conditions.push(`${condition.logicalOperator || "AND"} ${sql}`);
      }
    });

    return conditions.join(" ");
  }

  private buildOrderByClause(
    orderBy?: OrderByCondition | OrderByCondition[],
  ): string {
    if (!orderBy) return "";

    const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
    const parts = orders.map(
      (order) =>
        `${this.sanitizeIdentifier(order.field)} ${order.direction || "ASC"}`,
    );

    return `ORDER BY ${parts.join(", ")}`;
  }

  private sanitizeIdentifier(name: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid SQL identifier: ${name}`);
    }

    return name;
  }

  private sanitizeColumn(column: string): string {
    return column
      .split(".")
      .map((part) => this.sanitizeIdentifier(part))
      .join(".");
  }
}

/**
 * ============================================
 * FACTORY
 * ============================================
 */

export function createAdvancedQuery(
  db: Database,
  enableLogging: boolean = false,
): AdvancedQuery {
  return new AdvancedQuery(db, enableLogging);
}
