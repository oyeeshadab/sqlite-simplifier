// Main Database class
export { Database } from "./Database";

/**
 * ============================================
 * SIMPLE OPERATIONS
 * ============================================
 */

export { insert, insertMany } from "./operations/insert";

export {
  select,
  selectAll,
  selectById,
  selectWithFields,
  selectFirst,
} from "./operations/select";

export { update, updateById } from "./operations/update";

export { deleteRecords, deleteById, deleteAll } from "./operations/delete";

export { dropTable } from "./operations/drop";

/**
 * ============================================
 * ADVANCED QUERY BUILDER
 * ============================================
 */

export {
  AdvancedQuery,
  createAdvancedQuery,

  // WHERE HELPERS
  where,
  orWhere,

  // ORDER HELPERS
  asc,
  desc,

  // AGGREGATION HELPERS
  sum,
  avg,
  count,
  min,
  max,

  // TYPES
  type SQLOperator,
  type WhereCondition,
  type QueryOptions,
  type RelationConfig,
  type OrderByCondition,
} from "./advanced-queries";

/**
 * ============================================
 * TYPES
 * ============================================
 */

export type {
  DatabaseConfig,
  InsertOptions,
  SelectOptions,
  UpdateOptions,
  DeleteOptions,
  DropOptions,
  QueryResult,
  ToggleReturn,
} from "./types";
