import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { loadDatasets, getSalesByMonth, getSalesByCategory, getSalesByRegion, getSalesBySegment, getSalesByState, getSalesByStateAndCategory, getTopProducts, getSalesStats, getProphetForecast, Customer, Product, Order, Shipment, Time, Sale, ProphetResponse } from "@/lib/dataLoader";
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Users, Brain, AlertCircle, Lightbulb, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const COLORS = ['#ffc658', '#4a90e2', '#8884d8']; // Yellow (top products), Blue (sales by category), Violet (sales trends)

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string | null>(null);
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
  
  // Filter by region if one is selected
  const regionFilteredSales = selectedRegion
    ? data.sales.filter(sale => {
        const customer = data.customers.find(c => c.customer_key === sale.customer_key);
        return customer?.region === selectedRegion;
      })
    : data.sales;
  
  const stateData = getSalesByState(regionFilteredSales, data.customers).slice(0, 10);
  const stateCategoryData = getSalesByStateAndCategory(regionFilteredSales, data.customers, data.products, selectedRegion ? 20 : 10);
  
  // Filter sales by category if one is selected
  const filteredSales = selectedCategory 
    ? data.sales.filter(sale => {
        const product = data.products.find(p => p.product_key === sale.product_key);
        return product?.category === selectedCategory;
      })
    : data.sales;
  
  const segmentData = getSalesBySegment(filteredSales, data.customers);
  
  // Filter products by category if one is selected
  const productFilteredSales = selectedProductCategory
    ? data.sales.filter(sale => {
        const product = data.products.find(p => p.product_key === sale.product_key);
        return product?.category === selectedProductCategory;
      })
    : data.sales;
  
  const topProducts = getTopProducts(productFilteredSales, data.products, 10);
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
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
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
                  <CardDescription>Click a category to filter customer segments</CardDescription>
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
                      <Bar 
                        dataKey="sales" 
                        fill="#4a90e2"
                        onClick={(data) => setSelectedCategory(data.category)}
                        cursor="pointer"
                      >
                        {categoryData.map((entry) => (
                          <Cell
                            key={`cell-${entry.category}`}
                            fill={selectedCategory === entry.category ? "#f59e0b" : "#4a90e2"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Customer Segments</CardTitle>
                      <CardDescription>
                        {selectedCategory 
                          ? `Segments for ${selectedCategory}`
                          : 'Sales distribution by segment'}
                      </CardDescription>
                    </div>
                    {selectedCategory && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
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
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Region</CardTitle>
                  <CardDescription>Click a region to filter states</CardDescription>
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
                      <Bar 
                        dataKey="sales" 
                        fill="#8884d8"
                        onClick={(data) => setSelectedRegion(data.region)}
                        cursor="pointer"
                      >
                        {regionData.map((entry) => (
                          <Cell
                            key={`cell-${entry.region}`}
                            fill={selectedRegion === entry.region ? "#f59e0b" : "#8884d8"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {selectedRegion ? `States in ${selectedRegion}` : 'Top 10 States by Sales'}
                      </CardTitle>
                      <CardDescription>
                        {selectedRegion ? `All states in the ${selectedRegion} region` : 'Highest performing states'}
                      </CardDescription>
                    </div>
                    {selectedRegion && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRegion(null)}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stateData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#fff" tick={{ fill: '#fff' }} />
                      <YAxis 
                        dataKey="state" 
                        type="category" 
                        width={100} 
                        stroke="#fff" 
                        tick={{ fill: '#fff', fontSize: 11 }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', color: '#232736', border: 'none' }}
                        labelStyle={{ color: '#232736', fontWeight: 600 }}
                        itemStyle={{ color: '#232736' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                      />
                      <Bar dataKey="sales" fill="#10b981" />
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {selectedProductCategory ? `Top 10 ${selectedProductCategory} Products` : 'Top 10 Products by Sales'}
                      </CardTitle>
                      <CardDescription>
                        {selectedProductCategory ? `Best performing ${selectedProductCategory.toLowerCase()} products` : 'Best performing products across all categories'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={!selectedProductCategory ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProductCategory(null)}
                      >
                        All
                      </Button>
                      <Button 
                        variant={selectedProductCategory === "Technology" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProductCategory("Technology")}
                      >
                        Technology
                      </Button>
                      <Button 
                        variant={selectedProductCategory === "Furniture" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProductCategory("Furniture")}
                      >
                        Furniture
                      </Button>
                      <Button 
                        variant={selectedProductCategory === "Office Supplies" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProductCategory("Office Supplies")}
                      >
                        Office Supplies
                      </Button>
                    </div>
                  </div>
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

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Strategic Business Recommendations
                </CardTitle>
                <CardDescription>Data-driven insights and actionable recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Revenue Optimization */}
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Revenue Growth Opportunities</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          • <strong>Focus on {regionData[0]?.region} Region:</strong> This region generates ${regionData[0]?.sales.toLocaleString()} in sales. 
                          Increase marketing budget by 15-20% in this high-performing area to maximize returns.
                        </p>
                        <p>
                          • <strong>Expand {categoryData[0]?.category} Category:</strong> Your top category with ${categoryData[0]?.sales.toLocaleString()} in sales. 
                          Consider expanding product lines and creating bundled offers to increase average order value by 25%.
                        </p>
                        <p>
                          • <strong>Leverage {segmentData[0]?.segment} Segment:</strong> This customer segment drives significant revenue. 
                          Develop a loyalty program offering 10% discounts on bulk orders to increase retention and lifetime value.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Expansion */}
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start gap-3">
                    <Target className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Market Expansion Strategy</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          • <strong>Underperforming Region - {regionData[regionData.length - 1]?.region}:</strong> Only ${regionData[regionData.length - 1]?.sales.toLocaleString()} in sales. 
                          Launch targeted campaigns with localized promotions and consider partnerships with regional distributors.
                        </p>
                        <p>
                          • <strong>State-Level Opportunities:</strong> Analyze states within {regionData[1]?.region} region for untapped potential. 
                          Implement pilot programs in 2-3 strategic locations before full rollout.
                        </p>
                        <p>
                          • <strong>Cross-Region Learning:</strong> Apply successful tactics from {regionData[0]?.region} to other regions. 
                          Share best practices, sales strategies, and product positioning approaches.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Strategy */}
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-start gap-3">
                    <ShoppingCart className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Product Portfolio Optimization</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          • <strong>Promote Top Performer:</strong> "{topProducts[0]?.product_name}" generates ${topProducts[0]?.sales.toLocaleString()}. 
                          Feature prominently in marketing materials, create upsell opportunities, and ensure consistent inventory.
                        </p>
                        <p>
                          • <strong>Category Mix:</strong> Balance inventory based on performance - allocate 50% to {categoryData[0]?.category}, 
                          30% to {categoryData[1]?.category}, and 20% to {categoryData[2]?.category} to optimize warehouse space and cash flow.
                        </p>
                        <p>
                          • <strong>Slow-Moving Items:</strong> Review bottom 20% products for discontinuation or clearance sales. 
                          Redirect freed capital and warehouse space to high-performing categories.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Experience */}
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Customer Experience Enhancement</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          • <strong>Segment-Specific Campaigns:</strong> Create personalized email campaigns for each segment. 
                          {segmentData[0]?.segment} customers prefer premium options - highlight quality and features.
                        </p>
                        <p>
                          • <strong>Regional Customization:</strong> Adapt product offerings to regional preferences. 
                          States in {regionData[0]?.region} show strong category preferences - tailor inventory accordingly.
                        </p>
                        <p>
                          • <strong>Retention Program:</strong> Implement a tiered rewards system. Target customers spending above average (${stats.average.toLocaleString()}) 
                          with exclusive previews, free shipping, and priority support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Efficiency */}
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Risk Mitigation & Efficiency</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          • <strong>Inventory Management:</strong> Use forecasting data to maintain optimal stock levels. 
                          Reduce carrying costs by 15-20% while preventing stockouts of top 20 products.
                        </p>
                        <p>
                          • <strong>Seasonal Planning:</strong> Analyze monthly trends to prepare for peak periods. 
                          Increase staffing and inventory 30 days before high-sales months identified in trends.
                        </p>
                        <p>
                          • <strong>Diversification:</strong> Reduce dependency on top category ({categoryData[0]?.category} at {((categoryData[0]?.sales / stats.total) * 100).toFixed(1)}% of total sales). 
                          Develop complementary product lines to mitigate category-specific risks.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implementation Timeline */}
                <Card className="bg-accent/5 border-accent">
                  <CardHeader>
                    <CardTitle className="text-base">Recommended Implementation Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="font-semibold w-24 flex-shrink-0 text-blue-400">Immediate</div>
                        <div className="text-muted-foreground">
                          Optimize inventory for top products, launch retention program for high-value segments
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="font-semibold w-24 flex-shrink-0 text-green-400">30 Days</div>
                        <div className="text-muted-foreground">
                          Increase marketing in top region, develop category expansion plans, implement forecasting system
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="font-semibold w-24 flex-shrink-0 text-yellow-400">60-90 Days</div>
                        <div className="text-muted-foreground">
                          Launch campaigns in underperforming regions, roll out loyalty program, optimize product mix
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="font-semibold w-24 flex-shrink-0 text-purple-400">Quarterly</div>
                        <div className="text-muted-foreground">
                          Review performance metrics, adjust strategies based on results, expand successful initiatives
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expected Impact */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Expected Business Impact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="text-2xl font-bold text-green-400">15-25%</div>
                      <div className="text-muted-foreground mt-1">Revenue Growth</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="text-2xl font-bold text-blue-400">20-30%</div>
                      <div className="text-muted-foreground mt-1">Customer Retention</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded">
                      <div className="text-2xl font-bold text-purple-400">10-15%</div>
                      <div className="text-muted-foreground mt-1">Operational Efficiency</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
