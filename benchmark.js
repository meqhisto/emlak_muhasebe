import { performance } from 'perf_hooks';

const transactions = Array.from({ length: 1000000 }, (_, i) => ({
  totalRevenue: Math.random() * 1000,
  officeRevenue: Math.random() * 500,
}));

const expenses = Array.from({ length: 1000000 }, (_, i) => ({
  amount: Math.random() * 200,
  isPaid: Math.random() > 0.5,
}));

function baseline() {
  const start = performance.now();
  const totalRev = transactions.reduce((acc, t) => acc + t.totalRevenue, 0);
  const officeRev = transactions.reduce((acc, t) => acc + t.officeRevenue, 0);
  const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalUnpaid = expenses.filter(e => !e.isPaid).reduce((acc, e) => acc + e.amount, 0);
  const end = performance.now();
  return { time: end - start, totalRev, officeRev, totalExp, totalUnpaid };
}

function optimized() {
  const start = performance.now();
  const { totalRev, officeRev } = transactions.reduce((acc, t) => {
    acc.totalRev += t.totalRevenue;
    acc.officeRev += t.officeRevenue;
    return acc;
  }, { totalRev: 0, officeRev: 0 });

  const { totalExp, totalUnpaid } = expenses.reduce((acc, e) => {
    acc.totalExp += e.amount;
    if (!e.isPaid) acc.totalUnpaid += e.amount;
    return acc;
  }, { totalExp: 0, totalUnpaid: 0 });
  const end = performance.now();
  return {
    time: end - start,
    totalRev,
    officeRev,
    totalExp,
    totalUnpaid
  };
}

// Verify correctness
const b = baseline();
const o = optimized();

if (Math.abs(b.totalRev - o.totalRev) > 0.1 ||
    Math.abs(b.officeRev - o.officeRev) > 0.1 ||
    Math.abs(b.totalExp - o.totalExp) > 0.1 ||
    Math.abs(b.totalUnpaid - o.totalUnpaid) > 0.1) {
  console.error("Optimized results do not match baseline!", b, o);
  process.exit(1);
}

// Warm up
for (let i = 0; i < 5; i++) {
  baseline();
  optimized();
}

let baselineTotal = 0;
let optimizedTotal = 0;
const iterations = 50;

for (let i = 0; i < iterations; i++) {
  baselineTotal += baseline().time;
  optimizedTotal += optimized().time;
}

console.log(`Baseline average: ${(baselineTotal / iterations).toFixed(4)}ms`);
console.log(`Optimized average: ${(optimizedTotal / iterations).toFixed(4)}ms`);
console.log(`Improvement: ${((baselineTotal - optimizedTotal) / baselineTotal * 100).toFixed(2)}%`);
