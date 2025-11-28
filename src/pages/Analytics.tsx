import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { loadDatasets, getSalesByMonth, getSalesByCategory, getSalesByRegion, getSalesBySegment, getTopProducts, getSalesStats, Customer, Product, Order, Shipment, Time, Sale } from "@/lib/dataLoader";
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";

const COLORS = ['#ffc658', '#4a90e2', '#8884d8']; // Yellow (top products), Blue (sales by category), Violet (sales trends)

const Analytics = () => {
    // Removed emphasizedCategory state (no highlight on click)
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    customers: Customer[];
    products: Product[];
    orders: Order[];
    shipments: Shipment[];
    time: Time[];
    sales: Sale[];
  } | null>(null);

  useEffect(() => {
    loadDatasets()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Failed to load data</p>
      </div>
    );
  }

  const monthlyData = getSalesByMonth(data.sales, data.time);
  const categoryData = getSalesByCategory(data.sales, data.products).slice(0, 3);
  const regionData = getSalesByRegion(data.sales, data.customers);
  const segmentData = getSalesBySegment(data.sales, data.customers);
  const topProducts = getTopProducts(data.sales, data.products, 10);
  const stats = getSalesStats(data.sales);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Sales Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analysis of sales data across multiple dimensions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Sales"
            value={`$${stats.total.toLocaleString()}`}
            subtitle={`${stats.count} transactions`}
            icon={DollarSign}
          />
          <StatsCard
            title="Average Sale"
            value={`$${stats.average.toLocaleString()}`}
            subtitle="Per transaction"
            icon={TrendingUp}
          />
          <StatsCard
            title="Products"
            value={data.products.length.toString()}
            subtitle="Total catalog"
            icon={ShoppingCart}
          />
          <StatsCard
            title="Customers"
            value={data.customers.length.toString()}
            subtitle="Active customers"
            icon={Users}
          />
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Sales Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales Trend</CardTitle>
                  <CardDescription>Sales performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#fff" tick={{ fill: '#fff' }} />
                      <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', color: '#232736', border: 'none' }}
                        labelStyle={{ color: '#232736', fontWeight: 600 }}
                        itemStyle={{ color: '#232736' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                      />
                      <Legend wrapperStyle={{ color: '#232736' }} />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Product category performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" stroke="#fff" tick={{ fill: '#fff' }} />
                      <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', color: '#232736', border: 'none' }}
                        labelStyle={{ color: '#232736', fontWeight: 600 }}
                        itemStyle={{ color: '#232736' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                      />
                      <Legend wrapperStyle={{ color: '#232736' }} />
                      <Bar dataKey="sales" fill="#4a90e2">
                        {categoryData.map((entry, idx) => (
                          <Cell
                            key={`cell-${entry.category}`}
                            fill="#4a90e2"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>Sales distribution by segment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={segmentData}
                        dataKey="sales"
                        nameKey="segment"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={(entry) => `${entry.segment}: $${entry.sales.toLocaleString()}`}
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', color: '#232736', border: 'none' }}
                        labelStyle={{ color: '#232736', fontWeight: 600 }}
                        itemStyle={{ color: '#232736' }}
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Region</CardTitle>
                  <CardDescription>Geographic distribution of sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={regionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#fff" tick={{ fill: '#fff' }} />
                      <YAxis dataKey="region" type="category" width={100} stroke="#fff" tick={{ fill: '#fff' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', color: '#232736', border: 'none' }}
                        labelStyle={{ color: '#232736', fontWeight: 600 }}
                        itemStyle={{ color: '#232736' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                      />
                      <Legend wrapperStyle={{ color: '#232736' }} />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Products by Sales</CardTitle>
                  <CardDescription>Best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#fff" tick={{ fill: '#fff' }} />
                      <YAxis 
                        dataKey="product_name" 
                        type="category" 
                        width={200}
                        tick={{ fontSize: 12, fill: '#fff' }}
                        stroke="#fff"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', color: '#232736', border: 'none' }}
                        labelStyle={{ color: '#232736', fontWeight: 600 }}
                        itemStyle={{ color: '#232736' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                      />
                      <Legend wrapperStyle={{ color: '#232736' }} />
                      <Bar dataKey="sales" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
