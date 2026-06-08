import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, description, trend, trendValue, color = 'primary' }) => {
  
  const getColorClasses = () => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500',
          border: 'hover:border-emerald-500/20'
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-500',
          border: 'hover:border-rose-500/20'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-500',
          border: 'hover:border-amber-500/20'
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-500',
          border: 'hover:border-blue-500/20'
        };
      default:
        return {
          iconBg: 'bg-primary-50 dark:bg-primary-950/30 text-primary-500',
          border: 'hover:border-primary-500/20'
        };
    }
  };

  const styles = getColorClasses();

  return (
    <div className={`glass-panel p-6 rounded-xl border border-slate-200 dark:border-dark-800 transition-all duration-300 ${styles.border}`}>
      <div className="flex justify-between items-start">
        {/* Value and Title */}
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-dark-400">{title}</p>
          <h4 className="text-3xl font-extrabold text-slate-800 dark:text-dark-100 mt-2 font-display">
            {value}
          </h4>
        </div>
        {/* Icon */}
        <div className={`p-3 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Description / Trend Indicator */}
      {(description || trendValue) && (
        <div className="mt-4 flex items-center text-xs">
          {trend && (
            <span
              className={`flex items-center font-semibold mr-1.5 px-1.5 py-0.5 rounded ${
                trend === 'up'
                  ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20'
                  : trend === 'down'
                  ? 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20'
                  : 'text-slate-500 bg-slate-50 dark:text-dark-400 dark:bg-dark-850'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : trend === 'down' ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              ) : null}
              {trendValue}
            </span>
          )}
          <span className="text-slate-400 dark:text-dark-500 font-medium">{description}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
