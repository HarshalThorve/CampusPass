
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, description, trend, trendValue, color = 'primary' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400',
          border: 'hover:border-emerald-500'
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 text-rose-400',
          border: 'hover:border-rose-500'
        };
      case 'amber':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400',
          border: 'hover:border-emerald-500'
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-500/10 text-blue-400',
          border: 'hover:border-blue-500'
        };
      default:
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400',
          border: 'hover:border-emerald-500'
        };
    }
  };

  const styles = getColorClasses();

  return (
    <div className={`bg-[#111111] border border-[#1F2E29] p-6 rounded-xl transition-all duration-300 ${styles.border}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[rgba(248,249,250,0.5)] text-xs tracking-widest uppercase font-mono">{title}</p>
          <h4 className="text-[#F8F9FA] text-3xl font-bold mt-2 font-display">
            {value}
          </h4>
        </div>
        <div className={`p-3 rounded-lg bg-[rgba(255,255,255,0.06)] ${styles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(description || trendValue) && (
        <div className="mt-4 flex items-center text-xs">
          {trend && (
            <span
              className={`flex items-center font-mono font-semibold mr-1.5 px-1.5 py-0.5 rounded ${
                trend === 'up'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : trend === 'down'
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-[rgba(248,249,250,0.4)] bg-[rgba(255,255,255,0.06)]'
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
          <span className="text-[rgba(248,249,250,0.4)] text-xs font-mono">{description}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
