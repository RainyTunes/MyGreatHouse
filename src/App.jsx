import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PriceChart from './components/PriceChart';
import StatsPanel from './components/StatsPanel';
import {
  fetchCityData,
  setSelectedType,
  selectChartData,
  selectStats,
  selectSelectedType,
  selectCityName,
  selectLoading
} from './store/dataSlice';

function App() {
  const dispatch = useDispatch();
  const chartData = useSelector(selectChartData);
  const stats = useSelector(selectStats);
  const selectedType = useSelector(selectSelectedType);
  const cityName = useSelector(selectCityName);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatch(fetchCityData('广州'));
  }, [dispatch]);

  const handleTypeChange = (type) => {
    dispatch(setSelectedType(type));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {cityName} 房价指数走势
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            基于国家统计局70城房价数据 · 2022年5月 - 2025年10月
          </p>
        </div>

        {/* Type Toggle */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          background: '#f3f4f6',
          padding: '6px',
          borderRadius: '12px',
          width: 'fit-content'
        }}>
          <button
            onClick={() => handleTypeChange('newHouse')}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: selectedType === 'newHouse' ? '#3b82f6' : 'transparent',
              color: selectedType === 'newHouse' ? 'white' : '#6b7280'
            }}
          >
            新建商品住宅
          </button>
          <button
            onClick={() => handleTypeChange('secondHand')}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: selectedType === 'secondHand' ? '#3b82f6' : 'transparent',
              color: selectedType === 'secondHand' ? 'white' : '#6b7280'
            }}
          >
            二手住宅
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>加载中...</div>
            <div style={{ fontSize: '14px' }}>正在获取数据</div>
          </div>
        ) : (
          <>
            {/* Stats Panel */}
            <StatsPanel stats={stats} type={selectedType} />

            {/* Chart */}
            <div style={{
              background: '#fafafa',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                margin: '0 0 20px 0',
                color: '#111827'
              }}>
                同比指数走势图
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#9ca3af',
                  marginLeft: '12px'
                }}>
                  (上年同月=100)
                </span>
              </h2>
              <PriceChart data={chartData} type={selectedType} />
            </div>

            {/* Footer Note */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#fffbeb',
              border: '1px solid #fef08a',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#78716c',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>数据说明：</strong>
              </div>
              <div style={{ marginBottom: '4px' }}>
                • <strong>同比指数</strong>：100为基准线，&gt;100表示同比上涨，&lt;100表示同比下跌
              </div>
              <div>
                • <strong>累计涨跌幅</strong>：通过每月同比指数累乘计算得出，反映整个时间段的真实价格变化
                <br />
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '12px' }}>
                  例：若第1月98%，第2月97%，则累计 = 100 × (98/100) × (97/100) = 95.06，跌幅4.94%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
