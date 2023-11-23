import { getWeekNumber } from './utils/tab-utils.js';

const d = new Date();
console.log(d);
console.log(getWeekNumber(d));

const a = new Date(2023, 6, 20);
console.log(a);
console.log(getWeekNumber(a));

const x = new Date(2004, 1, 1);
console.log(x);
console.log(getWeekNumber(x));

const y = new Date(2000, 1, 1);
console.log(y)
console.log(getWeekNumber(y));