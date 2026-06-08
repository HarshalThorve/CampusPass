import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import MetricCard from '../components/MetricCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Calendar, Users, DollarSign, Percent, 
  Sparkles, Flame, Eye, BarChart3, Clock 
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await analyticsService.getDashboard();
        setData(result);
      } catch (err) {
        console.error('Error fetching analytics data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-dark-400 font-semibold">Generating analytics report...</p>
      </div>
    );
  }

  const {
    kpis,
    events,
    categoryDistribution,
    monthlyRevenue,
    registrationTrends,
    heatmapData,
    revenueForecast
  } = data;

  // Merge Monthly Revenue & Forecasted Revenue for a unified visualization
  const unifiedRevenueData = [
    ...monthlyRevenue.map(item => ({ ...item, type: 'Historical' })),
    ...revenueForecast.map(item => ({ month: item.month, revenue: item.projectedRevenue, type: 'Forecasted' }))
  ];

  // Render Attendance Heatmap grid
  // Weekday (0-6) vs Hour bins (we will bin hours into: 8-11: Morning, 11-14: Midday, 14-17: Afternoon, 17-20: Evening, 20-23: Night)
  const hourBins = [
    { label: 'Morning (08-11)', hours: [8, 9, 10] },
    { label: 'Midday (11-14)', hours: [11, 12, 13] },
    { label: 'Afternoon (14-17)', hours: [14, 15, 16] },
    { label: 'Evening (17-20)', hours: [17, 18, 19] },
    { label: 'Night (20-23)', hours: [20, 21, 22] }
  ];

  const getHeatmapValue = (weekdayIdx, hourRange) => {
    const matches = heatmapData.filter(h => 
      h.weekday === weekdayIdx && hourRange.includes(h.hour)
    );
    return matches.reduce((sum, item) => sum + item.count, 0);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-dark-100 font-display">
            Analytics & Predictions
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Real-time metric evaluations, linear regression forecasts, and entry heatmaps.
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Events"
          value={kpis.total_events}
          icon={Calendar}
          description="Managed schedules"
          color="blue"
        />
        <MetricCard
          title="Total Registrations"
          value={kpis.total_registrations}
          icon={Users}
          description="Active entry tickets"
          color="indigo"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${Math.round(kpis.total_revenue)}`}
          icon={DollarSign}
          description="Gross earnings"
          color="emerald"
          trend="up"
          trendValue="+24%"
        />
        <MetricCard
          title="Gate Attendees"
          value={kpis.total_attendees}
          icon={Users}
          description="Checked-in status"
          color="amber"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${kpis.attendance_rate}%`}
          icon={Percent}
          description="Show-up consistency"
          color="rose"
        />
      </div>

      {/* Row 1 Graphs: Unified Revenue Forecast & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Unified Revenue & Forecast */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-dark-100 font-display flex items-center">
                <BarChart3 className="w-4.5 h-4.5 mr-2 text-primary-500" />
                Revenue Curve & AI Forecast
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Linear regression projection for upcoming time periods.</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-dark-850 px-2 py-0.5 rounded uppercase">
              Predictive
            </span>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={unifiedRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-dark-800/40" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  name="Historical Revenue" 
                  dataKey="revenue" 
                  data={unifiedRevenueData.filter(d => d.type === 'Historical')} 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorHistory)" 
                />
                <Area 
                  type="monotone" 
                  name="Projected Forecast" 
                  dataKey="revenue" 
                  data={unifiedRevenueData} 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  fillOpacity={0.4} 
                  fill="url(#colorForecast)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Split */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-dark-100 font-display mb-6">
            Events by Category
          </h3>
          <div className="h-60 w-full flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-700 dark:text-dark-200 font-display">
                {kpis.total_events}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Categories</span>
            </div>
          </div>

          {/* Custom Labels List */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
            {categoryDistribution.map((item, idx) => (
              <div key={item.category} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-500 capitalize">{item.category}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Daily Registration Trends & Gate Attendance Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Heatmap Grid */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-dark-100 font-display flex items-center">
              <Clock className="w-4.5 h-4.5 mr-2 text-primary-500" />
              Attendance Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Peak gate entry volumes by day and hours.</p>
          </div>

          {/* Grid Layout */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[320px] space-y-1.5 text-[10px]">
              
              {/* Hour Labels Header */}
              <div className="flex text-center text-slate-400 font-bold mb-2">
                <div className="w-16 flex-shrink-0 text-left">Day</div>
                {hourBins.map((bin) => (
                  <div key={bin.label} className="flex-1 text-[8px] truncate" title={bin.label}>
                    {bin.label.split(' ')[0]}
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              {WEEKDAYS.map((day, dIdx) => (
                <div key={day} className="flex items-center">
                  {/* Day label */}
                  <div className="w-16 flex-shrink-0 text-slate-500 font-bold">{day.slice(0, 3)}</div>
                  {/* Hour cells */}
                  {hourBins.map((bin) => {
                    const val = getHeatmapValue(dIdx, bin.hours);
                    // Color density calculation
                    let cellBg = 'bg-slate-100 dark:bg-dark-900';
                    let textCol = 'text-slate-400 dark:text-dark-800';
                    if (val > 10) { cellBg = 'bg-primary-600'; textCol = 'text-white font-extrabold'; }
                    else if (val > 5) { cellBg = 'bg-primary-400'; textCol = 'text-white font-bold'; }
                    else if (val > 2) { cellBg = 'bg-primary-200 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300'; }
                    else if (val > 0) { cellBg = 'bg-primary-50 dark:bg-primary-950/20 text-primary-600'; }

                    return (
                      <div 
                        key={bin.label}
                        className={`flex-1 h-7 flex items-center justify-center rounded-md mx-0.5 border border-slate-200/20 transition-colors ${cellBg} ${textCol}`}
                        title={`${day} during ${bin.label}: ${val} entries`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Daily Registration Trends Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-dark-100 font-display flex items-center">
              <TrendingUp className="w-4.5 h-4.5 mr-2 text-primary-500" />
              Registration Velocity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Tickets booked day-wise to verify scaling patterns.</p>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-dark-800/40" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Line 
                  type="monotone" 
                  name="Registrations" 
                  dataKey="registrations" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 1 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
