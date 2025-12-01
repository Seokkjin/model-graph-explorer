import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { loadDatasets, getSalesByMonth, getSalesByCategory, getSalesByRegion, getSalesBySegment, getTopProducts, getSalesStats, getProphetForecast, Customer, Product, Order, Shipment, Time, Sale, ProphetResponse } from "@/lib/dataLoader";
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Users, Brain, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  
  // Prophet forecasting state
  const [prophetData, setProphetData] = useState<ProphetResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [forecastPeriods, setForecastPeriods] = useState(12);

  useEffect(() => {
    loadDatasets()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  
  // Function to run Prophet forecast
  const runProphetForecast = async () => {
    if (!data) return;
    
    setForecastLoading(true);
    setForecastError(null);
    
    try {
      const monthlyData = getSalesByMonth(data.sales, data.time);
      const forecast = await getProphetForecast(monthlyData, forecastPeriods);
      setProphetData(forecast);
    } catch (error) {
      console.error('Forecast error:', error);
      setForecastError(error instanceof Error ? error.message : 'Failed to generate forecast. Make sure the Python API is running on port 5000.');
    } finally {
      setForecastLoading(false);
    }
  };

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
            <TabsTrigger value="prophet">Prophet Forecast</TabsTrigger>
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

          <TabsContent value="prophet" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Prophet Forecasting Model
                    </CardTitle>
                    <CardDescription>Facebook Prophet Forecasting Model trained on all historical data</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={forecastPeriods}
                      onChange={(e) => setForecastPeriods(Number(e.target.value))}
                      className="px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value={6}>Forecast: 6 months</option>
                      <option value={12}>Forecast: 12 months</option>
                      <option value={18}>Forecast: 18 months</option>
                      <option value={24}>Forecast: 24 months</option>
                    </select>
                    <Button onClick={runProphetForecast} disabled={forecastLoading}>
                      {forecastLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Training...
                        </>
                      ) : (
                        'Run Forecast'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {forecastError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{forecastError}</AlertDescription>
                  </Alert>
                )}
                
                {prophetData && (
                  <div className="space-y-6">
                    {/* Model Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-blue-400">R² Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-300">
                            {prophetData.metrics.r2.toFixed(4)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Model fit quality
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-green-400">Accuracy</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-300">
                            {prophetData.metrics.accuracy.toFixed(2)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            MAPE: {(prophetData.metrics.mape * 100).toFixed(2)}%
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-orange-400">RMSE</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-300">
                            ${prophetData.metrics.rmse.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            MAE: ${prophetData.metrics.mae.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-purple-400">Explained Variance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-300">
                            {prophetData.metrics.explained_variance.toFixed(4)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max Error: ${prophetData.metrics.max_error.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Historical Data & Forecast Visualization */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Historical Data & Forecast</CardTitle>
                        <CardDescription>
                          Historical: {prophetData.data_info.total_records} months | 
                          Forecast: {prophetData.data_info.forecast_periods} months ahead
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={450}>
                          <LineChart 
                            data={[
                              ...prophetData.historical_data.map(d => ({
                                date: d.date,
                                actual: d.actual,
                                predicted: d.predicted,
                                forecast: null
                              })),
                              ...prophetData.future_forecast.map(d => ({
                                date: d.date,
                                actual: null,
                                predicted: null,
                                forecast: d.forecast
                              }))
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#fff" 
                              tick={{ fill: '#fff', fontSize: 11 }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                              }}
                            />
                            <YAxis 
                              stroke="#fff" 
                              tick={{ fill: '#fff' }}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                color: '#232736',
                                border: 'none',
                                borderRadius: '8px'
                              }}
                              labelStyle={{ color: '#232736', fontWeight: 600 }}
                              itemStyle={{ color: '#232736' }}
                              formatter={(value: any, name: string) => {
                                if (value === null) return null;
                                const formattedValue = `$${Number(value).toLocaleString()}`;
                                if (name === 'Actual Sales') return [formattedValue, 'Actual'];
                                if (name === 'Model Fit') return [formattedValue, 'Predicted'];
                                if (name === 'Future Forecast') return [formattedValue, 'Forecast'];
                                return [formattedValue, name];
                              }}
                            />
                            <Legend wrapperStyle={{ color: '#fff' }} />
                            
                            {/* Actual sales - dotted gray line */}
                            <Line 
                              type="monotone" 
                              dataKey="actual" 
                              stroke="#6b7280"
                              strokeWidth={2}
                              strokeDasharray="3 3"
                              dot={false}
                              name="Actual Sales"
                              connectNulls
                            />
                            
                            {/* Predicted - blue line */}
                            <Line 
                              type="monotone" 
                              dataKey="predicted" 
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={false}
                              name="Model Fit"
                              connectNulls
                            />
                            
                            {/* Future forecast - orange line */}
                            <Line 
                              type="monotone" 
                              dataKey="forecast" 
                              stroke="#f59e0b" 
                              strokeWidth={2}
                              dot={false}
                              name="Future Forecast"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Detailed Metrics Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Evaluation Metrics</CardTitle>
                        <CardDescription>Comprehensive model performance indicators</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-muted-foreground">MSE</p>
                            <p className="font-semibold">${prophetData.metrics.mse.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">MSLE</p>
                            <p className="font-semibold">{prophetData.metrics.msle.toFixed(4)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Median AE</p>
                            <p className="font-semibold">${prophetData.metrics.medae.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Pinball Loss</p>
                            <p className="font-semibold">{prophetData.metrics.mean_pinball_loss.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">D² Tweedie</p>
                            <p className="font-semibold">{prophetData.metrics.d2_tweedie.toFixed(4)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">D² Pinball</p>
                            <p className="font-semibold">{prophetData.metrics.d2_pinball.toFixed(4)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Trend Component */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Trend Component</CardTitle>
                        <CardDescription>Long-term trend extracted by Prophet model</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={prophetData.trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#fff" 
                              tick={{ fill: '#fff', fontSize: 10 }}
                            />
                            <YAxis 
                              stroke="#fff" 
                              tick={{ fill: '#fff' }}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                color: '#232736',
                                border: 'none'
                              }}
                              labelStyle={{ color: '#232736', fontWeight: 600 }}
                              itemStyle={{ color: '#232736' }}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Trend']}
                            />
                            <Legend wrapperStyle={{ color: '#fff' }} />
                            <Line 
                              type="monotone" 
                              dataKey="trend" 
                              stroke="#8b5cf6" 
                              strokeWidth={2}
                              dot={false}
                              name="Trend"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {!prophetData && !forecastError && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No forecast generated yet</p>
                    <p className="text-sm">Configure parameters and click "Run Forecast" to train the Prophet model</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
