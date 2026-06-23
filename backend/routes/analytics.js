const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get Analytics Summary (Admin only)
router.get('/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    // 1. KPI Counts
    const statsQuery = await db.query(`
      SELECT 
        (SELECT COUNT(*)::int FROM events) as total_events,
        (SELECT COUNT(*)::int FROM registrations WHERE payment_status = 'completed') as total_registrations,
        (SELECT COALESCE(SUM(amount), 0)::float FROM payments WHERE status = 'successful') as total_revenue,
        (SELECT COUNT(*)::int FROM attendance) as total_attendees
    `);
    const kpis = statsQuery.rows[0];
    
    // Calculate Attendance Rate
    const totalRegs = kpis.total_registrations || 0;
    const totalAtt = kpis.total_attendees || 0;
    kpis.attendance_rate = totalRegs > 0 ? Math.round((totalAtt / totalRegs) * 100) : 0;

    // 2. Event-wise Statistics
    const eventsQuery = await db.query(`
      SELECT 
        e.id, 
        e.title, 
        e.capacity, 
        e.price::float,
        e.category,
        COUNT(DISTINCT r.id)::int as registrations,
        COALESCE(SUM(p.amount), 0)::float as revenue,
        COUNT(DISTINCT a.id)::int as attendees
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id AND r.payment_status = 'completed'
      LEFT JOIN payments p ON e.id = p.event_id AND p.status = 'successful'
      LEFT JOIN tickets t ON r.id = t.registration_id
      LEFT JOIN attendance a ON t.id = a.ticket_id
      GROUP BY e.id
      ORDER BY e.date DESC
    `);
    const rawEvents = eventsQuery.rows;

    // Add Popularity Prediction to Event stats
    const eventsWithPredictions = rawEvents.map(event => {
      const fillRate = event.capacity > 0 ? (event.registrations / event.capacity) : 0;
      let popularity = 'Low Priority';
      let speedText = 'Slow registration speed';
      
      if (fillRate >= 0.6) {
        popularity = 'High Priority — Selling Fast';
        speedText = 'Likely to sell out soon';
      } else if (fillRate >= 0.3) {
        popularity = 'Medium Priority';
        speedText = 'Steady ticket sales';
      }

      return {
        ...event,
        fill_rate: Math.round(fillRate * 100),
        popularity_prediction: popularity,
        status_alert: speedText
      };
    });

    // 3. Category Split
    const categoryQuery = await db.query(`
      SELECT category, COUNT(*)::int as count 
      FROM events 
      GROUP BY category
    `);
    const categoryDistribution = categoryQuery.rows;

    // 4. Monthly Revenue
    const revenueQuery = await db.query(`
      SELECT TO_CHAR(created_at, 'Mon YYYY') as month, 
             SUM(amount)::float as revenue,
             MIN(created_at) as raw_date
      FROM payments
      WHERE status = 'successful'
      GROUP BY month
      ORDER BY raw_date ASC
    `);
    const monthlyRevenue = revenueQuery.rows.map(row => ({
      month: row.month,
      revenue: row.revenue
    }));

    // 5. Daily Registration Trends (past 15 days)
    const trendsQuery = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, 
             COUNT(*)::int as registrations
      FROM registrations
      WHERE payment_status = 'completed'
      GROUP BY date
      ORDER BY date ASC
      LIMIT 15
    `);
    const registrationTrends = trendsQuery.rows;

    // 6. Attendance Heatmap Data (Weekday vs Hour)
    // DOW: 0 is Sunday, 6 is Saturday
    const heatmapQuery = await db.query(`
      SELECT EXTRACT(DOW FROM checkin_time)::int as weekday,
             EXTRACT(HOUR FROM checkin_time)::int as hour,
             COUNT(*)::int as count
      FROM attendance
      GROUP BY weekday, hour
      ORDER BY weekday, hour
    `);
    const heatmapDataRaw = heatmapQuery.rows;

    // Map to frontend bins to calculate heatmapMax
    const bins = [
      [8, 9, 10],
      [11, 12, 13],
      [14, 15, 16],
      [17, 18, 19],
      [20, 21, 22]
    ];
    let heatmapMax = 0;
    for (let day = 0; day < 7; day++) {
      for (const hourRange of bins) {
        const cellCount = heatmapDataRaw
          .filter(h => h.weekday === day && hourRange.includes(h.hour))
          .reduce((sum, item) => sum + item.count, 0);
        if (cellCount > heatmapMax) {
          heatmapMax = cellCount;
        }
      }
    }
    if (heatmapMax === 0) heatmapMax = 1;

    const heatmapData = {
      heatmap: heatmapDataRaw,
      heatmapMax: heatmapMax,
      maxValue: heatmapMax
    };

    // 7. Revenue Forecasting (Simple Linear Regression)
    // Guard clause: if fewer than 3 months, return forecastInsufficient
    if (monthlyRevenue.length < 3) {
      return res.json({
        kpis,
        events: eventsWithPredictions,
        categoryDistribution,
        monthlyRevenue,
        registrationTrends,
        heatmapData,
        revenueForecast: [],
        forecastInsufficient: true
      });
    }

    // We project the next 3 time periods (months) based on existing monthly data
    const forecast = [];
    
    // Add all historical data to the merged forecast array first
    monthlyRevenue.forEach(row => {
      forecast.push({
        month: row.month,
        revenue: row.revenue,
        type: 'historical'
      });
    });

    // Add the last historical point as the start of the forecast line to connect them continuously
    if (monthlyRevenue.length > 0) {
      const lastHistorical = monthlyRevenue[monthlyRevenue.length - 1];
      forecast.push({
        month: lastHistorical.month,
        revenue: lastHistorical.revenue,
        type: 'forecast'
      });
    }

    // Calculate regression parameters: y = mx + c
    const n = monthlyRevenue.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    monthlyRevenue.forEach((data, index) => {
      const x = index + 1; // 1-indexed months
      const y = data.revenue;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const denominator = (n * sumXX - sumX * sumX);
    const m = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
    const c = (sumY - m * sumX) / n;

    // Project next 3 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const lastMonthDate = new Date(revenueQuery.rows[revenueQuery.rows.length - 1].raw_date);
    
    for (let i = 1; i <= 3; i++) {
      const forecastX = n + i;
      const forecastedValue = Math.max(0, m * forecastX + c); // Ensure non-negative forecast
      
      const nextMonth = new Date(lastMonthDate);
      nextMonth.setMonth(lastMonthDate.getMonth() + i);
      const monthLabel = `${months[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
      
      forecast.push({
        month: monthLabel,
        revenue: Math.round(forecastedValue * 100) / 100,
        type: 'forecast'
      });
    }

    return res.json({
      kpis,
      events: eventsWithPredictions,
      categoryDistribution,
      monthlyRevenue,
      registrationTrends,
      heatmapData,
      revenueForecast: forecast
    });
  } catch (error) {
    console.error('Analytics query error:', error);
    return res.status(500).json({ message: 'Failed to retrieve analytics dashboard data' });
  }
});

module.exports = router;
