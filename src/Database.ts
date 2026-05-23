import SQLite, {
  SQLiteDatabase,
  Transaction,
  ResultSet,
  SQLError,
} from "react-native-sqlite-storage";

import {
  DatabaseConfig,
  InsertOptions,
  SelectOptions,
  UpdateOptions,
  DeleteOptions,
  DropOptions,
  DatabaseInterface,
} from "./types";

import { QueryBuilder } from "./utils/queryBuilder";

// Enable promises
SQLite.enablePromise(true);

export class Database implements DatabaseInterface {
  private db: SQLiteDatabase | null = null;
  private config: DatabaseConfig;
  private activeTransactions = 0;

  // Add debug flag to control logging
  private enableLogging: boolean = false;

  // Add query deduplication
  private lastQuery: { sql: string; params: string; timestamp: number } | null =
    null;
  private readonly QUERY_DEBOUNCE_MS = 100;

  constructor(config: DatabaseConfig, enableLogging: boolean = false) {
    this.config = config;
    this.enableLogging = enableLogging;
  }

  /**
   * ============================================
   * CONNECT
   * ============================================
   */

  async connect(): Promise<void> {
    if (!this.db) {
      if (this.enableLogging) {
        console.log("📱 Database connecting...");
      }

      this.db = await SQLite.openDatabase({
        name: this.config.name,
        location: this.config.location || "Library",
      });

      if (this.enableLogging) {
        console.log("✅ Database connected");
      }
    }
  }

  /**
   * ============================================
   * INSERT
   * ============================================
   */

  async insert(options: InsertOptions): Promise<number> {
    await this.ensureConnection();

    const { query, params } = QueryBuilder.buildInsertQuery(options);
    const result = await this.executeQuery(query, params);

    return result.insertId || 0;
  }

  /**
   * ============================================
   * SELECT
   * ============================================
   */

  async select<T = any>(options: SelectOptions): Promise<T[]> {
    await this.ensureConnection();

    const { query, params } = QueryBuilder.buildSelectQuery(options);
    const results = await this.executeQuery(query, params);

    return results as T[];
  }

  /**
   * ============================================
   * UPDATE
   * ============================================
   */

  async update(options: UpdateOptions): Promise<number> {
    await this.ensureConnection();

    const { query, params } = QueryBuilder.buildUpdateQuery(options);
    const result = await this.executeQuery(query, params);

    return result.rowsAffected || 0;
  }

  /**
   * ============================================
   * DELETE
   * ============================================
   */

  async delete(options: DeleteOptions): Promise<number> {
    await this.ensureConnection();

    const { query, params } = QueryBuilder.buildDeleteQuery(options);
    const result = await this.executeQuery(query, params);

    return result.rowsAffected || 0;
  }

  /**
   * ============================================
   * DROP TABLE
   * ============================================
   */

  async drop(options: DropOptions): Promise<void> {
    await this.ensureConnection();

    const query = QueryBuilder.buildDropQuery(options);
    await this.executeQuery(query);
  }

  /**
   * ============================================
   * EXECUTE QUERY
   * ============================================
   */

  async executeQuery(sql: string, params: any[] = []): Promise<any> {
    await this.ensureConnection();

    if (!this.db) {
      throw new Error("Database not connected");
    }

    // Prevent duplicate rapid queries
    const queryKey = `${sql}|${JSON.stringify(params)}`;
    const now = Date.now();

    if (
      this.lastQuery &&
      this.lastQuery.sql === queryKey &&
      now - this.lastQuery.timestamp < this.QUERY_DEBOUNCE_MS
    ) {
      if (this.enableLogging) {
        console.warn("⚠️ Duplicate query blocked:", sql.substring(0, 100));
      }
      // Throw error to prevent duplicate execution
      throw new Error("Duplicate query detected");
    }

    this.lastQuery = {
      sql: queryKey,
      params: queryKey,
      timestamp: now,
    };

    // Only log when explicitly enabled
    if (this.enableLogging) {
      console.log("🔍 SQL:", sql);
      console.log("📦 Params:", params);
    }

    return new Promise((resolve, reject) => {
      // Store reference to avoid race conditions
      const db = this.db;

      if (!db) {
        reject(new Error("Database connection lost"));
        return;
      }

      db.executeSql(
        sql,
        params,
        (results: ResultSet) => {
          try {
            const upperSql = sql.trim().toUpperCase();

            // INSERT
            if (upperSql.startsWith("INSERT")) {
              resolve({
                insertId: results.insertId,
              });
              return;
            }

            // UPDATE / DELETE
            if (
              upperSql.startsWith("UPDATE") ||
              upperSql.startsWith("DELETE")
            ) {
              resolve({
                rowsAffected: results.rowsAffected,
              });
              return;
            }

            // SELECT
            const rows: any[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }

            if (this.enableLogging && rows.length > 0) {
              console.log(`✅ Retrieved ${rows.length} rows`);
            }

            resolve(rows);
          } catch (error) {
            reject(error);
          }
        },
        (error: SQLError) => {
          console.error("❌ Database error:", error);
          reject(error);
          return false;
        },
      );
    });
  }

  /**
   * ============================================
   * MANUAL TRANSACTION
   * ============================================
   */

  async transaction(callback: (tx: Transaction) => void): Promise<void> {
    await this.ensureConnection();

    if (!this.db) {
      throw new Error("Database not connected");
    }

    this.activeTransactions++;

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          callback(tx);
        },
        (error) => {
          this.activeTransactions--;
          reject(error);
        },
        () => {
          this.activeTransactions--;
          resolve();
        },
      );
    });
  }

  /**
   * ============================================
   * CREATE TABLE
   * ============================================
   */

  async createTable(
    tableName: string,
    schema: Record<string, string>,
  ): Promise<void> {
    await this.ensureConnection();

    // Sanitize inputs to prevent SQL injection
    const sanitizedTableName = this.sanitizeIdentifier(tableName);

    const fields = Object.entries(schema)
      .map(([field, type]) => {
        const sanitizedField = this.sanitizeIdentifier(field);
        const sanitizedType = this.sanitizeType(type);
        return `${sanitizedField} ${sanitizedType}`;
      })
      .join(", ");

    const query = `
      CREATE TABLE IF NOT EXISTS ${sanitizedTableName}
      (${fields})
    `;

    await this.executeQuery(query);

    if (this.enableLogging) {
      console.log(`📋 Table created: ${sanitizedTableName}`);
    }
  }

  /**
   * ============================================
   * SANITIZATION HELPERS
   * ============================================
   */

  private sanitizeIdentifier(name: string): string {
    // Allow only alphanumeric and underscores
    const sanitized = name.replace(/[^a-zA-Z0-9_]/g, "");
    if (sanitized !== name) {
      throw new Error(`Invalid identifier: ${name}`);
    }
    return sanitized;
  }

  private sanitizeType(type: string): string {
    const validTypes = ["TEXT", "INTEGER", "REAL", "BLOB", "NUMERIC"];
    const baseType = type.toUpperCase().split(" ")[0];

    // Check if baseType is valid and not undefined
    if (!baseType || !validTypes.includes(baseType)) {
      throw new Error(`Invalid column type: ${type}`);
    }

    // Preserve additional constraints if they exist
    const constraints = type.toUpperCase().split(" ").slice(1);
    return [baseType, ...constraints].join(" ");
  }

  /**
   * ============================================
   * CLOSE DATABASE
   * ============================================
   */

  async close(): Promise<void> {
    if (this.enableLogging) {
      console.log("🔒 Closing database...");
    }

    // Wait for manual transactions
    while (this.activeTransactions > 0) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (this.db) {
      await this.db.close();
      this.db = null;

      if (this.enableLogging) {
        console.log("✅ Database closed");
      }
    }
  }

  /**
   * ============================================
   * UTILITY METHODS
   * ============================================
   */

  async isConnected(): Promise<boolean> {
    return this.db !== null;
  }

  setLogging(enabled: boolean): void {
    this.enableLogging = enabled;
  }

  clearQueryCache(): void {
    this.lastQuery = null;
  }

  /**
   * ============================================
   * ENSURE CONNECTION
   * ============================================
   */

  private async ensureConnection(): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
  }
}
