# SQLite Simplifier

A next-generation, type-safe SQLite query builder for React Native and Node.js — built for speed, readability, and developer experience.

Build complex SQLite queries using a clean fluent API with built-in:

- 🔒 Type safety
- 🔗 Relationship support
- ⚡ Duplicate query blocking
- 💾 Query caching
- 🛡️ SQL injection protection
- 📊 Aggregations
- 🎯 Advanced filtering

---

# ✨ Features

- 🔒 Fully Type-Safe API
- 🚀 Fluent Query Builder
- 🔗 LEFT / INNER / RIGHT Join Support
- 📊 Aggregate Functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`)
- 🎯 Advanced WHERE Conditions
- ⚡ Duplicate Query Blocking
- 💾 Smart Query Caching
- 🛡️ SQL Injection Protection
- 📝 Query Logging
- 🔄 Async/Await Support
- 📦 Lightweight & Fast
- 🧩 Extensible Architecture

---

# 📦 Installation

## npm

```bash
npm install sqlite-simplifier
```

## yarn

```bash
yarn add sqlite-simplifier
```

## pnpm

```bash
pnpm add sqlite-simplifier
```

---

# 🚀 Setup

```ts
import { createAdvancedQuery } from "sqlite-simplifier";
import { Database } from "./Database";

const db = new Database();

const query = createAdvancedQuery(db, true);
```

---

# 📖 Basic Query

```ts
const result = await query.find("transactions");
```

Generated SQL:

```sql
SELECT transactions.*
FROM transactions
```

---

# 🎯 Select Specific Fields

```ts
const result = await query.find("transactions", {
  select: {
    id: "id",
    amount: "amount",
    title: "title",
  },
});
```

Generated SQL:

```sql
SELECT
transactions.id as id,
transactions.amount as amount,
transactions.title as title
FROM transactions
```

---

# 🔗 LEFT JOIN Example

```ts
const result = await query.find("transactions", {
  select: {
    id: "id",
    amount: "amount",
    category_name: "category.name",
    category_color: "category.color",
  },
  include: {
    tableName: "categories",
    localKey: "category_id",
    foreignKey: "id",
    type: "left",
  },
});
```

Generated SQL:

```sql
SELECT
transactions.id as id,
transactions.amount as amount,
categories.name as category_name,
categories.color as category_color
FROM transactions

LEFT JOIN categories
ON transactions.category_id = categories.id
```

---

# ⚡ Simplified Query Builder

```ts
const result = await query
  .query("transactions")
  .select("id", "title", "amount")
  .leftJoin("categories", "category_id", "id")
  .count("transactionCount", "transactions.id")
  .groupBy("transactions.id")
  .orderBy("amount", "DESC")
  .limit(10)
  .get();
```

---

# 📊 Aggregate Functions

## COUNT

```ts
const result = await query
  .query("transactions")
  .count("totalTransactions", "id")
  .get();
```

## SUM

```ts
const result = await query
  .query("transactions")
  .sum("totalAmount", "amount")
  .get();
```

## AVG

```ts
const result = await query
  .query("transactions")
  .avg("averageAmount", "amount")
  .get();
```

## MAX

```ts
const result = await query
  .query("transactions")
  .max("highestAmount", "amount")
  .get();
```

## MIN

```ts
const result = await query
  .query("transactions")
  .min("lowestAmount", "amount")
  .get();
```

---

# 🎯 Advanced WHERE Conditions

```ts
import { where, orWhere } from "sqlite-simplifier";

const result = await query.find("transactions", {
  where: [where("amount", ">", 1000), orWhere("type", "=", "income")],
});
```

Generated SQL:

```sql
SELECT transactions.*
FROM transactions
WHERE amount > ?
OR type = ?
```

---

# 📦 IN Operator

```ts
const result = await query.find("transactions", {
  where: [where("category_id", "IN", [1, 2, 3])],
});
```

Generated SQL:

```sql
SELECT transactions.*
FROM transactions
WHERE category_id IN (?, ?, ?)
```

---

# 📅 BETWEEN Operator

```ts
const result = await query.find("transactions", {
  where: [where("amount", "BETWEEN", [1000, 5000])],
});
```

---

# 📊 GROUP BY

```ts
const result = await query.find("transactions", {
  select: {
    category_id: "category_id",
    total: "SUM(amount)",
  },
  groupBy: ["category_id"],
});
```

Generated SQL:

```sql
SELECT
transactions.category_id as category_id,
SUM(amount) as total
FROM transactions
GROUP BY category_id
```

---

# 🔥 HAVING Clause

```ts
const result = await query.find("transactions", {
  select: {
    category_id: "category_id",
    total: "SUM(amount)",
  },
  groupBy: ["category_id"],
  having: [where("total", ">", 5000)],
});
```

---

# 🔄 ORDER BY

```ts
import { asc, desc } from "sqlite-simplifier";

const result = await query.find("transactions", {
  orderBy: [desc("amount"), asc("title")],
});
```

Generated SQL:

```sql
ORDER BY amount DESC, title ASC
```

---

# 📄 Pagination

```ts
const result = await query.find("transactions", {
  limit: 10,
  offset: 20,
});
```

Generated SQL:

```sql
LIMIT 10
OFFSET 20
```

---

# ⚡ Duplicate Query Blocking

SQLite Simplifier automatically blocks duplicate simultaneous queries.

If the same query runs multiple times at the same moment, only one database execution happens internally.

## Example

```ts
await Promise.all([
  query.find("transactions"),
  query.find("transactions"),
  query.find("transactions"),
]);
```

### Internal Behavior

```txt
✅ First Query -> Executes SQL
♻️ Second Query -> Reuses existing promise
♻️ Third Query -> Reuses existing promise
```

## Benefits

- 🚀 Prevents duplicate DB calls
- 📱 Improves React Native performance
- 🔋 Reduces memory usage
- ⚡ Optimizes repeated API requests
- 💾 Better caching efficiency

---

# 💾 Query Cache

```ts
query.clearCache();
```

---

# 🛡️ SQL Injection Protection

All queries are automatically parameterized internally.

```ts
await query.find("users", {
  where: {
    email: userInput,
  },
});
```

Generated SQL:

```sql
SELECT users.*
FROM users
WHERE email = ?
```

---

# 📝 Query Logging

```ts
query.setLogging(true);
```

Example log:

```bash
🟢 Executing Query:
SELECT * FROM transactions WHERE amount > ?

🟡 Params:
[1000]

⚡ Execution Time: 2ms
```

---

# ✏️ Insert Data

```ts
await query.insert("transactions", {
  data: {
    title: "Salary",
    amount: 5000,
    type: "income",
  },
});
```

Generated SQL:

```sql
INSERT INTO transactions
(title, amount, type)
VALUES (?, ?, ?)
```

---

# 🛠️ Update Data

```ts
await query.update("transactions", {
  data: {
    amount: 8000,
  },
  where: {
    id: 1,
  },
});
```

Generated SQL:

```sql
UPDATE transactions
SET amount = ?
WHERE id = ?
```

---

# ❌ Delete Data

```ts
await query.delete("transactions", {
  where: {
    id: 1,
  },
});
```

Generated SQL:

```sql
DELETE FROM transactions
WHERE id = ?
```

---

# 🚀 Raw Query

```ts
const result = await query.raw(
  "SELECT * FROM transactions WHERE amount > ?",
  [1000],
);
```

---

# 📱 Perfect For

- React Native Apps
- React Apps
- Electron Apps
- Node.js APIs
- Offline-first Apps
- Local-first Databases

---

# 🛣️ Roadmap

- 🔥 Schema Builder
- 📡 Live Queries
- 📤 Migration System
- 🧠 Auto Relation Detection
- 📈 Query Performance Insights
- 🧪 Built-in Testing Helpers
- 🪄 AI-powered Query Suggestions

---

# ❤️ Why SQLite Simplifier?

Writing raw SQLite queries repeatedly becomes difficult to maintain.

SQLite Simplifier helps you:

- write cleaner queries
- reduce boilerplate
- improve readability
- prevent duplicate requests
- keep full SQL power
- ship faster

All with a modern TypeScript-first developer experience.

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Made with ❤️ by **Shadab Hussain**

React Native • TypeScript • SQLite • Open Source

### Connect With Me

- GitHub: https://github.com/oyeeshadab
- LinkedIn: https://www.linkedin.com/in/oye-shadab
- Portfolio: https://shadabhussain.netlify.app
