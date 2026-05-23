# SQLite Simplifier

A next-generation, type-safe SQLite query builder for React Native and Node.js — built for speed, readability, and developer experience.

Craft complex SQL queries with a clean fluent API, automatic relation handling, smart caching, and built-in duplicate query prevention.

---

## ✨ Features

- 🔒 **Fully Type-Safe API**  
  Get end-to-end TypeScript inference, autocomplete, and compile-time safety.

- 🚀 **Fluent Query Builder**  
  Write clean, readable SQL queries with an elegant chainable API.

- 🔗 **Advanced Relationship Support**  
  Easily handle `LEFT`, `INNER`, and `RIGHT` joins with minimal boilerplate.

- 📊 **Powerful Aggregations**  
  Built-in support for:
  - `COUNT`
  - `SUM`
  - `AVG`
  - `MIN`
  - `MAX`

- 🎯 **Smart Filtering Engine**  
  Create complex:
  - `WHERE`
  - `AND`
  - `OR`
  - `IN`
  - `LIKE`
  - Nested conditions

- ⚡ **Duplicate Query Blocking**  
  Automatically prevents duplicate simultaneous queries to reduce unnecessary database hits and improve performance.

- 💾 **Intelligent Query Caching**  
  Cache query results and instantly reuse them without re-executing SQL.

- 🛡️ **SQL Injection Protection**  
  Uses parameterized queries internally for maximum security.

- 📝 **Beautiful Query Logging**  
  Debug generated SQL queries with colorful developer-friendly logs.

- 📦 **Lightweight & Performant**  
  Minimal overhead with optimized query execution.

- 🔄 **Promise-based API**  
  Modern async/await support out of the box.

- 🧩 **Extensible Architecture**  
  Easily add plugins, custom helpers, and reusable query utilities.

---

# 📦 Installation

## Using npm

```bash
npm install sqlite-simplifier
```

## Using Yarn

```bash
yarn add sqlite-simplifier
```

## Using PNPM

```bash
pnpm add sqlite-simplifier
```

---

# 🚀 Quick Example

```ts
const result = await query
  .query("categories")
  .select("id", "name", "icon", "color")
  .leftJoin("transactions")
  .count("transactionCount", "transactions.id")
  .groupBy("categories.id")
  .get();
```

## Generated SQL

```sql
SELECT
  categories.id,
  categories.name,
  categories.icon,
  categories.color,
  COUNT(transactions.id) as transactionCount
FROM categories
LEFT JOIN transactions
ON categories.id = transactions.category_id
GROUP BY categories.id
```

---

# ⚡ Duplicate Query Blocking

SQLite Simplifier intelligently detects and blocks duplicate in-flight queries.

If the same query is executed multiple times simultaneously, only one database call is made — remaining requests automatically reuse the same promise result.

## ✅ Benefits

- 🚀 Reduces unnecessary database calls
- 📱 Prevents UI lag in React Native apps
- 🔋 Improves performance
- 💾 Saves memory and resources
- ⚡ Optimizes repeated requests automatically

## Example

```ts
await Promise.all([
  query.query("transactions").get(),
  query.query("transactions").get(),
  query.query("transactions").get(),
]);
```

### Internally

```txt
✅ First Query -> Executes SQL
♻️ Second Query -> Reuses existing promise
♻️ Third Query -> Reuses existing promise
```

Only one SQL query is executed.

---

# 🔗 Relationships

## LEFT JOIN

```ts
query.query("transactions").leftJoin("categories").get();
```

## INNER JOIN

```ts
query.query("transactions").innerJoin("categories").get();
```

---

# 📊 Aggregate Functions

## COUNT

```ts
query.query("transactions").count("total", "id").get();
```

## SUM

```ts
query.query("transactions").sum("totalAmount", "amount").get();
```

## AVG

```ts
query.query("transactions").avg("averageAmount", "amount").get();
```

---

# 🎯 Advanced Filtering

```ts
query
  .query("transactions")
  .where("amount", ">", 1000)
  .andWhere("type", "=", "expense")
  .orWhere("category_id", "=", 5)
  .get();
```

---

# 💾 Query Caching

```ts
query.query("transactions").cache(true).get();
```

---

# 🛡️ SQL Injection Protection

All queries use parameterized statements internally.

```ts
query.query("users").where("email", "=", userInput).get();
```

---

# 📝 Query Logging

```ts
query.enableLogger(true);
```

Example log:

```bash
🟢 Executing Query:
SELECT * FROM transactions WHERE amount > ?

🟡 Params:
[1000]

⚡ Execution Time: 3ms
```

---

# 📱 Perfect For

- React Native Apps
- React Applications
- Electron Apps
- Node.js APIs
- Offline-first Applications
- Local-first Apps

---

# 🛣️ Roadmap

- 🔥 Schema Builder
- 🧠 Auto Relation Detection
- 📡 Live Query Subscriptions
- 📤 Migration System
- 🧪 Built-in Testing Utilities
- 📈 Query Performance Insights
- 🪄 AI-powered Query Suggestions

---

# ❤️ Why SQLite Simplifier?

Writing raw SQL repeatedly is painful.

SQLite Simplifier gives you:

- Better readability
- Safer queries
- Faster development
- Cleaner architecture
- Modern developer experience

Without sacrificing SQL power.

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Built with ❤️ for developers who love clean and scalable code.
