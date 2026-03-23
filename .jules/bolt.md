## 2024-03-23 - Initial observation
**Learning:** Found an app dealing with expenses, transactions and consultants, with some large filtering inside useMemo hooks.
**Action:** Let's look closely at `useMemo` hooks in pages to optimize them.
## 2024-03-23 - Reports performance optimization
**Learning:** Found an O(12 * n) operation inside `useMemo` in `pages/Reports.tsx` that iterates over transactions and expenses for every month.
**Action:** Replaced it with an O(n) operation by iterating over transactions and expenses only once and assigning them to the correct month bucket. This reduces CPU cycles and prevents main-thread blocking on large datasets.
