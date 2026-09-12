import React, { useState } from 'react';
import { useGold } from '../context/GoldContext';
import { formatRupiah } from '../utils/formatters';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

export const GoldPriceChart: React.FC = () => {
  const { hargaDasar, riwayatHarga, perubahanPersen } = useGold();
  const [activeRange, setActiveRange] = useState<'24J' | '7H' | '30H'>('7H');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; harga: number; waktu: string } | null>(null);

  // Generate data based on range
  const data = React.useMemo(() => {
    if (activeRange === '24J') {
      return [
        { label: '08:00', harga: hargaDasar - 2800, waktu: '08:00' },
        { label: '10:00', harga: hargaDasar - 1500, waktu: '10:00' },
        { label: '12:00', harga: hargaDasar - 2200, waktu: '12:00' },
        { label: '14:00', harga: hargaDasar - 500, waktu: '14:00' },
        { label: '16:00', harga: hargaDasar + 1200, waktu: '16:00' },
        { label: '18:00', harga: hargaDasar - 300, waktu: '18:00' },
        { label: 'Sekarang', harga: hargaDasar, waktu: 'Sekarang' }
      ];
    }
    if (activeRange === '30H') {
      return [
        { label: 'W-4', harga: 1062000, waktu: '15 Agu' },
        { label: 'W-3', harga: 1069000, waktu: '22 Agu' },
        { label: 'W-2', harga: 1074000, waktu: '29 Agu' },
        { label: 'W-1', harga: 1081000, waktu: '05 Sep' },
        { label: 'Hari Ini', harga: hargaDasar, waktu: '12 Sep' }
      ];
    }
    return riwayatHarga;
  }, [activeRange, riwayatHarga, hargaDasar]);

  const prices = data.map((d) => d.harga);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  const priceRange = maxPrice - minPrice || 1;

  // SVG dimensions
  const svgWidth = 360;
  const svgHeight = 160;
  const paddingX = 20;
  const paddingY = 20;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Calculate points for polyline / path
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.harga - minPrice) / priceRange) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${svgHeight} L ${points[0].x.toFixed(1)} ${svgHeight} Z`;

  const isPositive = perubahanPersen >= 0;

  return (
    <div className="bg-[#13161f] border border-[#232733] rounded-2xl p-4 shadow-xl">
      {/* Header with price and range pills */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-[#ffd700]" />
            Grafik Tren Harga Emas
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {formatRupiah(hoveredPoint ? hoveredPoint.harga : hargaDasar)}
              <span className="text-xs font-medium text-slate-400">/gr</span>
            </span>
            <div
              className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPositive ? '+' : ''}{perubahanPersen.toFixed(2)}%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {hoveredPoint ? `Waktu: ${hoveredPoint.waktu}` : 'Terakhir diperbarui: Real-time'}
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex bg-[#1a1e2a] p-1 rounded-xl border border-[#2d3344]">
          {(['24J', '7H', '30H'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeRange === range
                  ? 'bg-[#ffd700] text-black shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden rounded-xl bg-[#0e1118]/60 p-1 border border-[#1e2330]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ffd700" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY + chartHeight * 0.25}
            x2={svgWidth - paddingX}
            y2={paddingY + chartHeight * 0.25}
            stroke="#252b3b"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartHeight * 0.75}
            x2={svgWidth - paddingX}
            y2={paddingY + chartHeight * 0.75}
            stroke="#252b3b"
            strokeDasharray="3 3"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#goldGradient)" />

          {/* Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffd700"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Interactive Data Dots */}
          {points.map((p, index) => {
            const isHovered = hoveredPoint?.label === p.data.label;
            const isLast = index === points.length - 1;
            return (
              <g
                key={index}
                onMouseEnter={() => setHoveredPoint(p.data)}
                className="transition-transform duration-100"
              >
                {/* Hit target area */}
                <circle cx={p.x} cy={p.y} r="14" fill="transparent" />

                {/* Visible dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : isLast ? 4.5 : 3.5}
                  fill={isHovered ? '#ffffff' : '#ffd700'}
                  stroke="#0e1118"
                  strokeWidth="2"
                  className={isLast ? 'animate-pulse' : ''}
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis labels */}
        <div className="flex justify-between px-2 text-[10px] text-slate-400 font-medium mt-1">
          {data.map((d, i) => (
            <span key={i} className="truncate max-w-[50px] text-center">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
