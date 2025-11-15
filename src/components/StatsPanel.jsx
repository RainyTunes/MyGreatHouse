const StatsPanel = ({ stats, type }) => {
  const typeLabel = type === 'newHouse' ? '新房' : '二手房';
  const changePercent = ((parseFloat(stats.totalChange) / parseFloat(stats.startValue)) * 100).toFixed(1);
  const isPositive = parseFloat(stats.totalChange) >= 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Total Change */}
      <div style={{
        background: isPositive ? '#fef2f2' : '#f0fdf4',
        border: `2px solid ${isPositive ? '#fecaca' : '#bbf7d0'}`,
        borderRadius: '12px',
        padding: '16px',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
          整体变化
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: isPositive ? '#dc2626' : '#16a34a',
          lineHeight: '1.2'
        }}>
          {isPositive ? '+' : ''}{stats.totalChange}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
          {isPositive ? '+' : ''}{changePercent}%
        </div>
      </div>

      {/* Period Range */}
      <div style={{
        background: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
          时间范围
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', lineHeight: '1.4' }}>
          {stats.startPeriod}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>至</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', lineHeight: '1.4' }}>
          {stats.endPeriod}
        </div>
      </div>

      {/* Start Value */}
      <div style={{
        background: '#eff6ff',
        border: '2px solid #dbeafe',
        borderRadius: '12px',
        padding: '16px',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
          起始值
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb', lineHeight: '1.2' }}>
          {stats.startValue}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
          {stats.startPeriod}
        </div>
      </div>

      {/* End Value */}
      <div style={{
        background: '#eff6ff',
        border: '2px solid #dbeafe',
        borderRadius: '12px',
        padding: '16px',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
          当前值
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb', lineHeight: '1.2' }}>
          {stats.endValue}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
          {stats.endPeriod}
        </div>
      </div>

      {/* Min/Max/Avg */}
      <div style={{
        background: '#fefce8',
        border: '2px solid #fef08a',
        borderRadius: '12px',
        padding: '16px',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>
          统计区间
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#111827' }}>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '10px' }}>最低</div>
            <div style={{ fontWeight: '600', fontSize: '16px', color: '#ea580c' }}>{stats.minYoy}</div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '10px' }}>平均</div>
            <div style={{ fontWeight: '600', fontSize: '16px', color: '#64748b' }}>{stats.avgYoy}</div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '10px' }}>最高</div>
            <div style={{ fontWeight: '600', fontSize: '16px', color: '#16a34a' }}>{stats.maxYoy}</div>
          </div>
        </div>
      </div>

      {/* Data Points */}
      <div style={{
        background: '#faf5ff',
        border: '2px solid #e9d5ff',
        borderRadius: '12px',
        padding: '16px',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
          数据点数
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#9333ea', lineHeight: '1.2' }}>
          {stats.dataPoints}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
          个月
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
