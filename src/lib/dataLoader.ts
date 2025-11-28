// Data loading utilities for CSV datasets

export interface Customer {
  customer_key: number;
  customer_name: string;
  segment: string;
  country: string;
  city: string;
  state: string;
  postal_code: string;
  region: string;
}

export interface Product {
  product_key: number;
  product_name: string;
  category: string;
  sub_category: string;
}

export interface Order {
  order_key: number;
  order_id: string;
  order_date: string;
}

export interface Shipment {
  ship_key: number;
  ship_mode: string;
  ship_date: string;
}

export interface Time {
  time_key: number;
  date: string;
  year: number;
  quarter: string;
  month: number;
  month_name: string;
  week: number;
  day: number;
  day_of_week: number;
  day_of_year: number;
}

export interface Sale {
  row_id: number;
  order_key: number;
  customer_key: number;
  product_key: number;
  ship_key: number;
  time_key: number;
  sales: number;
}

// Parse CSV data
function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      // Try to parse as number
      obj[header] = isNaN(Number(value)) ? value : Number(value);
    });
    
    return obj as T;
  });
}

// Load all datasets
export async function loadDatasets() {
  const [customersCSV, productsCSV, ordersCSV, shipmentsCSV, timeCSV, salesCSV] = await Promise.all([
    fetch('/dim_customer.csv').then(r => r.text()),
    fetch('/dim_product.csv').then(r => r.text()),
    fetch('/dim_order.csv').then(r => r.text()),
    fetch('/dim_shipment.csv').then(r => r.text()),
    fetch('/dim_time.csv').then(r => r.text()),
    fetch('/fact_sales.csv').then(r => r.text())
  ]);

  return {
    customers: parseCSV<Customer>(customersCSV),
    products: parseCSV<Product>(productsCSV),
    orders: parseCSV<Order>(ordersCSV),
    shipments: parseCSV<Shipment>(shipmentsCSV),
    time: parseCSV<Time>(timeCSV),
    sales: parseCSV<Sale>(salesCSV)
  };
}

// Analytics functions
export function getSalesByMonth(sales: Sale[], time: Time[]) {
  const timeMap = new Map(time.map(t => [t.time_key, t]));
  const monthlyData = new Map<string, number>();

  sales.forEach(sale => {
    const timeRecord = timeMap.get(sale.time_key);
    if (timeRecord) {
      const key = `${timeRecord.year}-${String(timeRecord.month).padStart(2, '0')}`;
      monthlyData.set(key, (monthlyData.get(key) || 0) + sale.sales);
    }
  });

  return Array.from(monthlyData.entries())
    .map(([date, sales]) => ({ date, sales: Math.round(sales * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getSalesByCategory(sales: Sale[], products: Product[]) {
  const productMap = new Map(products.map(p => [p.product_key, p]));
  const categoryData = new Map<string, number>();

  sales.forEach(sale => {
    const product = productMap.get(sale.product_key);
    if (product) {
      categoryData.set(product.category, (categoryData.get(product.category) || 0) + sale.sales);
    }
  });

  return Array.from(categoryData.entries())
    .map(([category, sales]) => ({ category, sales: Math.round(sales * 100) / 100 }))
    .sort((a, b) => b.sales - a.sales);
}

export function getSalesByRegion(sales: Sale[], customers: Customer[]) {
  const customerMap = new Map(customers.map(c => [c.customer_key, c]));
  const regionData = new Map<string, number>();

  sales.forEach(sale => {
    const customer = customerMap.get(sale.customer_key);
    if (customer) {
      regionData.set(customer.region, (regionData.get(customer.region) || 0) + sale.sales);
    }
  });

  return Array.from(regionData.entries())
    .map(([region, sales]) => ({ region, sales: Math.round(sales * 100) / 100 }))
    .sort((a, b) => b.sales - a.sales);
}

export function getSalesBySegment(sales: Sale[], customers: Customer[]) {
  const customerMap = new Map(customers.map(c => [c.customer_key, c]));
  const segmentData = new Map<string, number>();

  sales.forEach(sale => {
    const customer = customerMap.get(sale.customer_key);
    if (customer) {
      segmentData.set(customer.segment, (segmentData.get(customer.segment) || 0) + sale.sales);
    }
  });

  return Array.from(segmentData.entries())
    .map(([segment, sales]) => ({ segment, sales: Math.round(sales * 100) / 100 }))
    .sort((a, b) => b.sales - a.sales);
}

export function getTopProducts(sales: Sale[], products: Product[], limit = 10) {
  const productMap = new Map(products.map(p => [p.product_key, p]));
  const productSales = new Map<number, number>();

  sales.forEach(sale => {
    productSales.set(sale.product_key, (productSales.get(sale.product_key) || 0) + sale.sales);
  });

  return Array.from(productSales.entries())
    .map(([product_key, sales]) => ({
      product_name: productMap.get(product_key)?.product_name || 'Unknown',
      sales: Math.round(sales * 100) / 100
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

export function getSalesStats(sales: Sale[]) {
  const total = sales.reduce((sum, sale) => sum + sale.sales, 0);
  const average = total / sales.length;
  const max = Math.max(...sales.map(s => s.sales));
  const min = Math.min(...sales.map(s => s.sales));

  return {
    total: Math.round(total * 100) / 100,
    average: Math.round(average * 100) / 100,
    max: Math.round(max * 100) / 100,
    min: Math.round(min * 100) / 100,
    count: sales.length
  };
}
