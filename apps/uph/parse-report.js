const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));

const categories = report.categories;
console.log('Performance:', categories.performance.score * 100);
console.log('Accessibility:', categories.accessibility.score * 100);
console.log('Best Practices:', categories['best-practices'].score * 100);
console.log('SEO:', categories.seo.score * 100);

console.log('\n--- Audits ---');
console.log('FCP:', report.audits['first-contentful-paint'].displayValue);
console.log('LCP:', report.audits['largest-contentful-paint'].displayValue);
console.log('TBT:', report.audits['total-blocking-time'].displayValue);
console.log('CLS:', report.audits['cumulative-layout-shift'].displayValue);
