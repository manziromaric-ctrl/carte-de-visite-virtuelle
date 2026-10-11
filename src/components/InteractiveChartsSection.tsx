import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Clock, 
  Globe, 
  Zap, 
  Users, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  ChevronRight,
  Target,
  Flame
} from 'lucide-react';
import { 
  DailyStatistic, 
  HourlyStatistic, 
  ActionStatistic, 
  CountryStatistic, 
  FunnelStep 
} from '../types';

interface InteractiveChartsSectionProps {
  dailyStats: DailyStatistic[];
  thirtyDayStats: DailyStatistic[];
  hourlyStats: HourlyStatistic[];
  actionDistribution: ActionStatistic[];
  countriesList: CountryStatistic[];
  funnelStats: FunnelStep[];
  deviceCounts: Record<'mobile' | 'desktop' | 'tablet', number>;
  totalInteractions: number;
  uniqueUsers: number;
  peakHour: number;
}

export function InteractiveChartsSection({
  dailyStats,
  thirtyDayStats,
  hourlyStats,
  actionDistribution,
  countriesList,
  funnelStats,
  deviceCounts,
  totalInteractions,
  uniqueUsers,
  peakHour,
}: InteractiveChartsSectionProps) {
  const [timeRange, setTimeRange] = useState<'7days' | 'hourly' | '30days'>('7days');
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    secondaryValue?: number;
  } | null>(null);

  const [hoveredActionIndex, setHoveredActionIndex] = useState<number | null>(null);

  // Active dataset for the main timeline chart
  const currentTimelineData = useMemo(() => {
    if (timeRange === 'hourly') {
      return hourlyStats.map((h) => ({
        label: h.label,
        subLabel: `${h.hour}h00`,
        primary: h.totalInteractions,
        secondary: h.uniqueUsers,
      }));
    }
    if (timeRange === '30days') {
      return thirtyDayStats.map((d) => ({
        label: d.displayDate,
        subLabel: d.date,
        primary: d.totalInteractions,
        secondary: d.uniqueUsers,
      }));
    }
    // 7 days default
    return dailyStats.map((d) => ({
      label: d.displayDate,
      subLabel: d.date,
      primary: d.totalInteractions,
      secondary: d.uniqueUsers,
    }));
  }, [timeRange, hourlyStats, thirtyDayStats, dailyStats]);

  // Compute scale maximum for timeline SVG
  const maxPrimary = useMemo(() => {
    const maxVal = Math.max(...currentTimelineData.map((d) => d.primary), 1);
    return Math.ceil(maxVal * 1.15); // headroom
  }, [currentTimelineData]);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 240;
  const paddingX = 40;
  const paddingBottom = 40;
  const paddingTop = 25;
  const effectiveWidth = chartWidth - paddingX * 2;
  const effectiveHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate coordinates for timeline SVG
  const chartPoints = useMemo(() => {
    if (currentTimelineData.length === 0) return [];
    const stepX = currentTimelineData.length > 1 
      ? effectiveWidth / (currentTimelineData.length - 1) 
      : effectiveWidth / 2;

    return currentTimelineData.map((item, index) => {
      const x = paddingX + index * stepX;
      const yPrimary = paddingTop + effectiveHeight - (item.primary / maxPrimary) * effectiveHeight;
      const ySecondary = paddingTop + effectiveHeight - (item.secondary / maxPrimary) * effectiveHeight;
      return {
        x,
        yPrimary,
        ySecondary,
        ...item,
      };
    });
  }, [currentTimelineData, maxPrimary, effectiveWidth, effectiveHeight]);

  // SVG Area Path generator
  const areaPath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    let path = `M ${chartPoints[0].x} ${chartPoints[0].yPrimary}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1];
      const curr = chartPoints[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.yPrimary;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.yPrimary;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.yPrimary}`;
    }
    const lastX = chartPoints[chartPoints.length - 1].x;
    const firstX = chartPoints[0].x;
    const bottomY = paddingTop + effectiveHeight;
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    return path;
  }, [chartPoints, effectiveHeight]);

  // SVG Line Path generator
  const linePath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    let path = `M ${chartPoints[0].x} ${chartPoints[0].yPrimary}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1];
      const curr = chartPoints[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.yPrimary;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.yPrimary;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.yPrimary}`;
    }
    return path;
  }, [chartPoints]);

  // Secondary Line Path (Visiteurs Uniques)
  const secondaryLinePath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    let path = `M ${chartPoints[0].x} ${chartPoints[0].ySecondary}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1];
      const curr = chartPoints[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.ySecondary;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.ySecondary;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.ySecondary}`;
    }
    return path;
  }, [chartPoints]);

  // Donut chart calculations
  const donutTotal = useMemo(() => {
    return actionDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
  }, [actionDistribution]);

  // Generate SVG arcs for Donut Chart
  const donutSegments = useMemo(() => {
    let accumulatedAngle = 0;
    const radius = 68;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    return actionDistribution.map((item, idx) => {
      const fraction = item.count / donutTotal;
      const strokeDasharray = `${fraction * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += fraction;

      return {
        ...item,
        index: idx,
        strokeDasharray,
        strokeDashoffset,
        fraction,
      };
    });
  }, [actionDistribution, donutTotal]);

  const activeDonutItem = hoveredActionIndex !== null 
    ? actionDistribution[hoveredActionIndex] 
    : null;

  // Device calculations
  const totalDevices = (deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet) || 1;
  const mobilePct = Math.round((deviceCounts.mobile / totalDevices) * 100);
  const desktopPct = Math.round((deviceCounts.desktop / totalDevices) * 100);
  const tabletPct = Math.round((deviceCounts.tablet / totalDevices) * 100);

  return (
    <div className="space-y-6">
      
      {/* 1. MAIN INTERACTIVE TIMELINE / AREA CHART */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow behind chart */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-emerald-500/10 blur-[90px] pointer-events-none rounded-full"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Courbe d'Évolution des Interactions
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Suivi dynamique du volume d'engagement et des visiteurs uniques
            </p>
          </div>

          {/* Time range selector pills */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTimeRange('hourly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === 'hourly'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24 Heures (Heure par Heure)
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === '7days'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Jours
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === '30days'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Jours
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50"></span>
            <span className="font-semibold text-slate-200">Total Interactions (actions directes)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
            <span className="font-semibold text-slate-400">Visiteurs Uniques distincts</span>
          </div>
          {timeRange === 'hourly' && (
            <div className="ml-auto text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Heure de pointe : <strong>{peakHour}h00</strong></span>
            </div>
          )}
        </div>

        {/* Responsive SVG Container */}
        <div className="relative w-full aspect-[16/7] min-h-[200px] sm:min-h-[250px] select-none">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Primary Emerald Gradient for Area */}
              <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#059669" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
              </linearGradient>

              {/* Glowing Line Gradient */}
              <linearGradient id="emeraldLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>

              {/* Cyan Line Gradient */}
              <linearGradient id="cyanLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const yVal = paddingTop + effectiveHeight * (1 - pct);
              const countVal = Math.round(maxPrimary * pct);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={chartWidth - paddingX}
                    y2={yVal}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray={i === 0 ? 'none' : '4 4'}
                  />
                  <text
                    x={paddingX - 10}
                    y={yVal + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {countVal}
                  </text>
                </g>
              );
            })}

            {/* Area Path */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#emeraldAreaGrad)"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Secondary Cyan Line (Unique Users) */}
            {secondaryLinePath && (
              <path
                d={secondaryLinePath}
                fill="none"
                stroke="url(#cyanLineGrad)"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Primary Emerald Line (Total Interactions) */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#emeraldLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glowFilter)"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Interactive Data Points and X-Axis Labels */}
            {chartPoints.map((pt, idx) => {
              const isHovered = hoveredPoint?.label === pt.label;
              const shouldShowLabel = 
                timeRange === '7days' || 
                (timeRange === 'hourly' && pt.hour % 3 === 0) ||
                (timeRange === '30days' && idx % 4 === 0) ||
                idx === chartPoints.length - 1;

              return (
                <g key={idx}>
                  {/* Vertical hover guide bar */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={paddingTop + effectiveHeight}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />
                  )}

                  {/* Primary Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.yPrimary}
                    r={isHovered ? 6 : 4}
                    fill="#10b981"
                    stroke="#020617"
                    strokeWidth="2.5"
                    className="transition-all duration-150 cursor-pointer"
                  />

                  {/* Invisible wide hover target */}
                  <rect
                    x={pt.x - 14}
                    y={paddingTop}
                    width={28}
                    height={effectiveHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredPoint({
                        x: pt.x,
                        y: pt.yPrimary,
                        label: pt.label,
                        value: pt.primary,
                        secondaryValue: pt.secondary,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* X-axis label */}
                  {shouldShowLabel && (
                    <text
                      x={pt.x}
                      y={chartHeight - 12}
                      fill={isHovered ? '#34d399' : '#64748b'}
                      fontSize="10"
                      fontWeight={isHovered ? '700' : '500'}
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900/95 text-white p-2.5 rounded-2xl border border-emerald-500/40 shadow-2xl backdrop-blur-md transition-all text-xs"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${Math.max((hoveredPoint.y / chartHeight) * 100 - 10, 15)}%`,
              }}
            >
              <div className="font-black text-emerald-400 text-xs mb-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>{hoveredPoint.label}</span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Interactions :</span>
                  <span className="font-extrabold text-white">{hoveredPoint.value}</span>
                </div>
                {hoveredPoint.secondaryValue !== undefined && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-cyan-400">Visiteurs uniques :</span>
                    <span className="font-extrabold text-white">{hoveredPoint.secondaryValue}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick summary below timeline */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Données synchronisées en direct avec Firestore</span>
          </div>
          <div className="text-slate-300 font-medium">
            Moyenne : <strong className="text-emerald-400">{(totalInteractions / Math.max(dailyStats.length, 1)).toFixed(1)}</strong> interactions / jour
          </div>
        </div>
      </div>

      {/* 2. DUAL ROW: DONUT CHART (ACTIONS) & HORIZONTAL BAR CHART (PAYS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 2A. DONUT CHART (REPARTITION PAR CANAUX ET ACTIONS) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Répartition des Canaux
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Proportion d'actions par type d'interaction
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {actionDistribution.length} types d'actions
              </span>
            </div>

            {/* Circular Donut Graphic */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                  {/* Background track */}
                  <circle
                    cx="90"
                    cy="90"
                    r="68"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="22"
                  />

                  {/* Colored Arc Segments */}
                  {donutSegments.map((seg) => {
                    const isHovered = hoveredActionIndex === seg.index;
                    return (
                      <circle
                        key={seg.actionType}
                        cx="90"
                        cy="90"
                        r="68"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isHovered ? 26 : 22}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredActionIndex(seg.index)}
                        onMouseLeave={() => setHoveredActionIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  {activeDonutItem ? (
                    <>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase truncate max-w-[100px]">
                        {activeDonutItem.label}
                      </span>
                      <span className="text-xl font-black text-white" style={{ color: activeDonutItem.color }}>
                        {activeDonutItem.percentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {activeDonutItem.count} clics
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Total
                      </span>
                      <span className="text-2xl font-black text-white">
                        {totalInteractions}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        100%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Interactive Color Legend */}
              <div className="flex-1 space-y-1.5 w-full max-h-56 overflow-y-auto pr-1">
                {actionDistribution.map((action, idx) => {
                  const isHovered = hoveredActionIndex === idx;
                  return (
                    <div
                      key={action.actionType}
                      onMouseEnter={() => setHoveredActionIndex(idx)}
                      onMouseLeave={() => setHoveredActionIndex(null)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-slate-800/90 border-slate-700 shadow-md scale-[1.02]'
                          : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: action.color }}
                        ></span>
                        <span className="font-semibold text-slate-200 truncate text-[11px]">
                          {action.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-white text-[11px]">{action.count}</span>
                        <span
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                          style={{
                            backgroundColor: `${action.color}20`,
                            color: action.color,
                          }}
                        >
                          {action.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/80">
            💡 Survolez un segment du graphique circulaire pour voir les détails.
          </div>
        </div>

        {/* 2B. HORIZONTAL BAR CHART: PAYS D'ORIGINE */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Graphique Géographique
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Origine géographique des visiteurs détectés
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {countriesList.length} pays
              </span>
            </div>

            {/* Countries Horizontal Gauge Bars */}
            <div className="space-y-3.5 my-2">
              {countriesList.slice(0, 5).map((c, i) => {
                const maxCountryCount = countriesList[0]?.count || 1;
                const relativeWidth = Math.max(Math.round((c.count / maxCountryCount) * 100), 12);

                return (
                  <div key={c.countryCode} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.flagEmoji}</span>
                        <span className="font-bold text-white">{c.country}</span>
                        {i === 0 && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            N°1
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400 text-[11px]">{c.uniqueUsers} visiteurs</span>
                        <span className="font-extrabold text-white text-xs">{c.count} actions</span>
                        <span className="text-emerald-400 font-bold text-xs">({c.percentage}%)</span>
                      </div>
                    </div>

                    {/* Gradient Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          i === 0
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-sm shadow-emerald-500/30'
                            : i === 1
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                            : 'bg-gradient-to-r from-slate-600 to-slate-400'
                        }`}
                        style={{ width: `${relativeWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span>Détection instantanée par géolocalisation IP & fuseau horaire</span>
            <span className="text-blue-400 font-semibold">{summaryPercentage(countriesList)}% international</span>
          </div>
        </div>

      </div>

      {/* 3. CONVERSION FUNNEL & DEVICE COMPARISON ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3A. CONVERSION FUNNEL (ENTONNOIR DE CONVERSION - 2 COLS) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Entonnoir de Conversion & Efficacité Commerciale
                </h3>
                <p className="text-[11px] text-slate-400">
                  Du premier scan de la carte jusqu'au contact direct (WhatsApp, Appel, vCard)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              ROI Carte Digitale
            </span>
          </div>

          {/* Funnel Steps */}
          <div className="space-y-3 pt-2">
            {funnelStats.map((step, idx) => {
              return (
                <div
                  key={step.name}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1.5 relative z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: step.color }}
                      ></span>
                      <span className="font-bold text-xs sm:text-sm text-white">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{step.count}</span>
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-black"
                        style={{
                          backgroundColor: `${step.color}20`,
                          color: step.color,
                        }}
                      >
                        {step.percentage}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2 relative z-10">
                    {step.desc}
                  </p>

                  {/* Funnel Width Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(step.percentage, 8)}%`,
                        backgroundColor: step.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3B. DEVICE BREAKDOWN GRAPHIC (1 COL) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Terminaux Utilisés
                </h3>
                <p className="text-[11px] text-slate-400">
                  Répartition Mobile vs Ordinateur
                </p>
              </div>
            </div>

            {/* Segmented Device Bar */}
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 my-4">
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all"
                style={{ width: `${mobilePct}%` }}
                title={`Mobile: ${mobilePct}%`}
              ></div>
              <div
                className="h-full bg-teal-400 transition-all"
                style={{ width: `${desktopPct}%` }}
                title={`Ordinateur: ${desktopPct}%`}
              ></div>
              <div
                className="h-full bg-blue-500 rounded-r-full transition-all"
                style={{ width: `${tabletPct}%` }}
                title={`Tablette: ${tabletPct}%`}
              ></div>
            </div>

            {/* Device breakdown items */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Smartphone Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-300">{deviceCounts.mobile}</span>
                  <span className="text-xs font-extrabold text-emerald-400">{mobilePct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-semibold text-white">Ordinateur / PC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-300">{deviceCounts.desktop}</span>
                  <span className="text-xs font-extrabold text-teal-400">{desktopPct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
                <div className="flex items-center gap-2.5">
                  <Tablet className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white">Tablette iPad/Android</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-300">{deviceCounts.tablet}</span>
                  <span className="text-xs font-extrabold text-blue-400">{tabletPct}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/80 mt-4">
            🚀 Format 100% optimisé pour un rendu instantané sur mobile sans téléchargement d'application.
          </div>
        </div>

      </div>

    </div>
  );
}

// Helper to compute percentage outside of DRC
function summaryPercentage(list: CountryStatistic[]) {
  if (list.length <= 1) return 0;
  const international = list.filter((c) => c.countryCode !== 'CD');
  const sum = international.reduce((acc, c) => acc + c.percentage, 0);
  return sum;
}
