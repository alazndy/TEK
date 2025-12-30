const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../katalog.csv');
const jsonPath = path.join(__dirname, '../src/data/brigade_products.json');

try {
  const data = fs.readFileSync(csvPath, 'utf8');
  const lines = data.split('\n');
  const products = [];

  // Remove header
  const header = lines.shift();

  lines.forEach(line => {
    if (!line.trim()) return;
    
    // Split by semicolon
    const parts = line.split(';');
    
    if (parts.length >= 5) {
      const category = parts[0].trim();
      const partNo = parts[1].trim();
      const model = parts[2].trim();
      const description = parts[3].trim();
      const priceStr = parts[4].trim(); // "2488.51" or "2,488.51"
      
      // Clean price string (remove currency symbols if any, handle commas vs dots)
      // Assuming 1234.56 format based on user input
      const price = parseFloat(priceStr.replace(/[^0-9.-]+/g,""));

      products.push({
        category,
        partNo,
        model,
        description,
        price: isNaN(price) ? 0 : price,
        manufacturer: 'Brigade',
        currency: 'GBP'
      });
    }
  });

  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
  console.log(`Successfully converted ${products.length} items to JSON.`);

} catch (err) {
  console.error('Error processing catalog:', err);
}
