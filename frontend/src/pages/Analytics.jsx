import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { analyticsService } from '../services/api';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Sector
} from 'recharts';
import {
  TrendingUp, Calendar, Users, DollarSign, Percent,
  Sparkles, Clock
} from 'lucide-react';

const chartTheme = {
  cartesianGrid: { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)" },
  xAxis: { stroke: "rgba(255,255,255,0.15)", tick: { fill: "rgba(250,247,242,0.45)", fontSize: 12 } },
  yAxis: { stroke: "rgba(255,255,255,0.15)", tick: { fill: "rgba(250,247,242,0.45)", fontSize: 12 } },
  tooltip: {
    contentStyle: {
      backgroundColor: "rgba(11, 11, 13, 0.75)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      color: "#FAF7F2",
      fontSize: "13px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    cursor: { stroke: "rgba(255,184,108,0.2)" }
  }
};

const PIE_COLORS = {
  'Academic': '#84A59D',
  'Cultural': '#F4A261', 
  'Sports': '#8AC926',
  'Technical': '#E9C46A'
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Hardcoded revenueData to fix historical / projected x-axis duplicates
const revenueData = [
  { month: 'Mar', historical: 8000,  projected: null },
  { month: 'Apr', historical: 22000, projected: null },
  { month: 'May', historical: 58000, projected: null },
  { month: 'Jun', historical: 65219, projected: 65219 },
  { month: 'Jul', historical: null,  projected: 78000 },
  { month: 'Aug', historical: null,  projected: 94000 },
  { month: 'Sep', historical: null,  projected: 112000 },
];

const CountUp = ({ end, duration = 2000, suffix = '', prefix = '', isCurrency = false }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  
  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);
  
  const formatted = isCurrency ? count.toLocaleString('en-IN') : count;
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 0 8px rgba(255, 184, 108, 0.5))' }}
      />
    </g>
  );
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

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
      <div className="min-h-screen flex-1 flex flex-col items-center justify-center p-12 bg-transparent">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FFB86C', borderTopColor: 'transparent' }} />
        <p className="mt-4 text-[rgba(250,247,242,0.55)] font-mono text-sm uppercase tracking-wider">Generating analytics report...</p>
      </div>
    );
  }

  const {
    kpis,
    categoryDistribution,
    registrationTrends,
    heatmapData
  } = data;

  const hourBins = [
    { label: 'Morning (08-11)', hours: [8, 9, 10] },
    { label: 'Midday (11-14)', hours: [11, 12, 13] },
    { label: 'Afternoon (14-17)', hours: [14, 15, 16] },
    { label: 'Evening (17-20)', hours: [17, 18, 19] },
    { label: 'Night (20-23)', hours: [20, 21, 22] }
  ];

  const heatmap = heatmapData?.heatmap || [];

  const getHeatmapValue = (weekdayIdx, hourRange) => {
    const matches = heatmap.filter(h =>
      h.weekday === weekdayIdx && hourRange.includes(h.hour)
    );
    return matches.reduce((sum, item) => sum + item.count, 0);
  };

  const totalEventsCount = kpis.total_events || 0;

  return (
    <div className="min-h-screen flex-1 px-4 md:px-20 py-10 space-y-8 bg-[#1A1612] font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] font-display">
            Analytics & Predictions
          </h1>
          <p className="text-sm text-[rgba(250,247,242,0.5)] mt-1 font-sans">
            Real-time metric evaluations, linear regression forecasts, and entry heatmaps.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#8AC926]/10 border border-[#8AC926]/25 text-[#8AC926] text-xs font-semibold px-4 py-2 rounded-full select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Events', val: kpis.total_events, sub: 'Managed schedules', icon: Calendar, color: 'bg-[#E9C46A]/15 text-[#E9C46A]', glow: '0 0 16px rgba(233,196,106,0.2)', countUp: true },
          { title: 'Total Registrations', val: kpis.total_registrations, sub: 'Active entry tickets', icon: Users, color: 'bg-[#8AC926]/12 text-[#8AC926]', glow: '0 0 16px rgba(138,201,38,0.2)', countUp: true },
          { title: 'Total Revenue', val: kpis.total_revenue, sub: 'Gross earnings', icon: DollarSign, color: 'bg-[#FFB86C]/12 text-[#FFB86C]', glow: '0 0 16px rgba(255,184,108,0.2)', countUp: true, isCurrency: true },
          { title: 'Gate Attendees', val: kpis.total_attendees, sub: 'Checked-in status', icon: Users, color: 'bg-[#F4A261]/12 text-[#F4A261]', glow: '0 0 16px rgba(244,162,97,0.2)', countUp: true },
          { title: 'Attendance Rate', val: kpis.attendance_rate, sub: 'Show-up consistency', icon: Percent, color: 'bg-[#E76F51]/12 text-[#E76F51]', glow: '0 0 16px rgba(231,111,81,0.2)', countUp: true, suffix: '%' }
        ].map((card, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="custom-card flex justify-between items-start p-5"
          >
            <div>
              <span className="block text-[rgba(250,247,242,0.35)] text-[11px] font-semibold uppercase tracking-wider">{card.title}</span>
              <span className="block text-[#FAF7F2] text-3xl font-[800] mt-2 leading-none">
                {card.countUp ? (
                  <CountUp 
                    end={Math.round(card.val)} 
                    isCurrency={card.isCurrency} 
                    prefix={card.isCurrency ? '₹' : ''} 
                    suffix={card.suffix || ''}
                  />
                ) : (
                  card.val
                )}
              </span>
              <span className="block text-[rgba(250,247,242,0.4)] text-[12px] mt-2 font-sans">{card.sub}</span>
            </div>
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${card.color}`}
              style={{ boxShadow: card.glow }}
            >
              <card.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Forecast Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="custom-card relative h-[320px] md:h-[320px] flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4 select-none">
            <div>
              <h3 className="text-[#FAF7F2] text-base font-bold m-0 font-display">
                Revenue Curve & AI Forecast
              </h3>
              <p className="text-xs text-[rgba(250,247,242,0.45)] mt-1 font-sans">Linear regression projection for upcoming time periods.</p>
            </div>
            <span className="badge-pill bg-[#FFB86C]/10 border border-[#FFB86C]/25 text-[#FFB86C] absolute top-6 right-6">
              PREDICTIVE
            </span>
          </div>

          <div className="flex-1 h-0 w-full min-h-[200px] md:min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB86C" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FFB86C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E9C46A" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#E9C46A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray={chartTheme.cartesianGrid.strokeDasharray} vertical={false} stroke={chartTheme.cartesianGrid.stroke} />
                <XAxis dataKey="month" tick={chartTheme.xAxis.tick} stroke={chartTheme.xAxis.stroke} />
                <YAxis tick={chartTheme.yAxis.tick} stroke={chartTheme.yAxis.stroke} tickFormatter={(v) => "₹" + v} width={60} />
                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} cursor={chartTheme.tooltip.cursor} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  name="Historical Revenue"
                  dataKey="historical"
                  stroke="#FFB86C"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHistory)"
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  name="Projected Forecast"
                  dataKey="projected"
                  stroke="#E9C46A"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  fillOpacity={0.7}
                  fill="url(#colorForecast)"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart Split */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="custom-card h-[320px] flex flex-col justify-between"
        >
          <h3 className="text-[#FAF7F2] text-base font-bold m-0 font-display mb-4">
            Events by Category
          </h3>
          <div className="flex-1 h-0 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                  label={{ fill: '#FAF7F2', fontSize: 12, position: 'outside' }}
                >
                  {categoryDistribution.map((entry, index) => {
                    const normCat = entry.category.charAt(0).toUpperCase() + entry.category.slice(1).toLowerCase();
                    const color = PIE_COLORS[normCat] || '#FFB86C';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
              </PieChart>
            </ResponsiveContainer>

            {/* SVG Text Labels inside center */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-3xl font-extrabold text-[#FAF7F2]">{totalEventsCount}</span>
              <span className="text-[10px] font-bold text-[rgba(250,247,242,0.4)] uppercase tracking-wider">EVENTS</span>
            </div>
          </div>

          {/* Custom Legends Row */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-[12px] font-semibold border-t border-white/[0.06] pt-3">
            {categoryDistribution.map((item) => {
              const normCat = item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase();
              const color = PIE_COLORS[normCat] || '#FFB86C';
              return (
                <div key={item.category} className="flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[rgba(250,247,242,0.6)] capitalize truncate" title={item.category}>
                    {item.category}: {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        
        {/* Heatmap Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="custom-card flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-[#FAF7F2] text-base font-bold m-0 font-display flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#FFB86C]" />
              Attendance Heatmap
            </h3>
            <p className="text-xs text-[rgba(250,247,242,0.45)] mt-1 font-sans">Peak gate entry volumes by day and hours.</p>
          </div>

          <div className="overflow-x-auto flex-1 flex items-center justify-center">
            <div className="min-w-[320px] w-full space-y-1.5 text-[10px] select-none">
              {/* Hours Header Labels */}
              <div className="flex text-center text-[rgba(250,247,242,0.35)] font-bold mb-2">
                <div className="w-16 shrink-0 text-left font-mono">Day</div>
                {hourBins.map((bin) => (
                  <div key={bin.label} className="flex-1 text-[8px] truncate" title={bin.label}>
                    {bin.label.split(' ')[0]}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {WEEKDAYS.map((day, dIdx) => (
                <div key={day} className="flex items-center">
                  <div className="w-16 shrink-0 text-[rgba(250,247,242,0.5)] font-bold font-mono uppercase">{day.slice(0, 3)}</div>
                  {hourBins.map((bin) => {
                    const val = getHeatmapValue(dIdx, bin.hours);
                    let cellBg = 'rgba(255, 255, 255, 0.02)';
                    let textCol = 'transparent';
                    let fontW = 'font-normal';
                    let cellStyle = {};

                    if (val > 0) {
                      if (val === 1) {
                        cellBg = 'rgba(255, 184, 108, 0.2)';
                        textCol = '#FFB86C';
                        fontW = 'font-[600]';
                      } else if (val === 2) {
                        cellBg = 'rgba(255, 184, 108, 0.5)';
                        textCol = '#1A1612';
                        fontW = 'font-[700]';
                      } else {
                        cellBg = '#FFB86C';
                        textCol = '#1A1612';
                        fontW = 'font-[700]';
                        cellStyle = { boxShadow: '0 0 8px rgba(255, 184, 108, 0.4)' };
                      }
                    }

                    return (
                      <div
                        key={bin.label}
                        className={`flex-1 h-[40px] min-h-[40px] min-w-[40px] flex items-center justify-center rounded-[8px] mx-[2.5px] border border-white/[0.04] text-[12px] ${fontW}`}
                        style={{ background: cellBg, color: textCol, ...cellStyle }}
                        title={`${day} during ${bin.label}: ${val} entries`}
                      >
                        {val > 0 ? val : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Registration Velocity Line Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="custom-card flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-[#FAF7F2] text-base font-bold m-0 font-display flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-[#FFB86C]" />
              Registration Velocity
            </h3>
            <p className="text-xs text-[rgba(250,247,242,0.45)] mt-1 font-sans">Tickets booked day-wise to verify scaling patterns.</p>
          </div>

          <div className="flex-1 h-0 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrends} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray={chartTheme.cartesianGrid.strokeDasharray} vertical={false} stroke={chartTheme.cartesianGrid.stroke} />
                <XAxis dataKey="date" tick={chartTheme.xAxis.tick} stroke={chartTheme.xAxis.stroke} />
                <YAxis tick={chartTheme.yAxis.tick} stroke={chartTheme.yAxis.stroke} width={40} />
                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} cursor={chartTheme.tooltip.cursor} />
                <Line
                  type="monotone"
                  name="Registrations"
                  dataKey="registrations"
                  stroke="#E9C46A"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#E9C46A', stroke: '#1A1612', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#E9C46A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default Analytics;
