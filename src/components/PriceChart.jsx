import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const PriceChart = ({ data, type }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        暂无数据
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.96)',
          padding: '12px 16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>
            {data.period}
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: data.yoy >= 100 ? '#ef4444' : '#10b981' }}>
            同比: {data.yoy.toFixed(1)}
            {data.yoy >= 100 ? ' ↑' : ' ↓'}
          </p>
          {data.mom && (
            <p style={{ margin: '4px 0', fontSize: '13px', color: data.mom >= 100 ? '#ef4444' : '#10b981' }}>
              环比: {data.mom.toFixed(1)}
              {data.mom >= 100 ? ' ↑' : ' ↓'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Find min and max for Y-axis domain
  const yoyValues = data.map(d => d.yoy);
  const minYoy = Math.min(...yoyValues);
  const maxYoy = Math.max(...yoyValues);
  const padding = (maxYoy - minYoy) * 0.1 || 5;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="period"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          interval={Math.floor(data.length / 12) || 0}
        />
        <YAxis
          domain={[Math.floor(minYoy - padding), Math.ceil(maxYoy + padding)]}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          label={{ value: '指数 (上年同月=100)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="5 5" label={{ value: '基准线 (100)', position: 'right', fill: '#9ca3af', fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="yoy"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
