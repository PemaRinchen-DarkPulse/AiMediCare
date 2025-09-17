import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush
} from 'recharts';
import { Badge, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowTrendUp, 
  faArrowTrendDown, 
  faMinus, 
  faExclamationTriangle,
  faRobot,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const EnhancedVitalsChart = ({ 
  vitalType, 
  data, 
  unit, 
  timeRange, 
  aiTrendAnalysis = null,
  showAiInsights = true,
  normalRanges = null 
}) => {
  // Process and format data for Recharts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item, index) => {
      const date = new Date(item.date);
      return {
        ...item,
        dateFormatted: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        }),
        index,
        // Handle blood pressure specially
        systolic: item.systolic || null,
        diastolic: item.diastolic || null,
        value: item.value || (item.systolic ? `${item.systolic}/${item.diastolic}` : null)
      };
    }).reverse(); // Reverse to show oldest to newest
  }, [data]);

  // Calculate trend and statistics
  const trendStats = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const values = chartData.map(d => d.value || d.systolic || 0).filter(v => v > 0);
    if (values.length < 2) return null;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const trendDirection = secondAvg > firstAvg + 2 ? 'up' : 
                          secondAvg < firstAvg - 2 ? 'down' : 'stable';
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
    
    return {
      direction: trendDirection,
      percentChange: Math.abs(percentChange),
      recent: values[values.length - 1],
      average: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1),
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [chartData]);

  // Get color configuration for different vital types
  const getVitalConfig = (type) => {
    const configs = {
      'blood-pressure': {
        color: '#e74c3c',
        gradient: ['#e74c3c', '#c0392b'],
        strokeWidth: 3,
        normalRange: { min: 80, max: 120, label: 'Normal BP Range' }
      },
      'blood-sugar': {
        color: '#f39c12',
        gradient: ['#f39c12', '#e67e22'],
        strokeWidth: 3,
        normalRange: { min: 70, max: 140, label: 'Normal Glucose Range' }
      },
      'heart-rate': {
        color: '#3498db',
        gradient: ['#3498db', '#2980b9'],
        strokeWidth: 3,
        normalRange: { min: 60, max: 100, label: 'Normal HR Range' }
      },
      'weight': {
        color: '#9b59b6',
        gradient: ['#9b59b6', '#8e44ad'],
        strokeWidth: 3
      },
      'cholesterol': {
        color: '#1abc9c',
        gradient: ['#1abc9c', '#16a085'],
        strokeWidth: 3,
        normalRange: { min: 0, max: 200, label: 'Optimal Cholesterol' }
      },
      'other': {
        color: '#95a5a6',
        gradient: ['#95a5a6', '#7f8c8d'],
        strokeWidth: 2
      }
    };
    
    return configs[type] || configs['other'];
  };

  const config = getVitalConfig(vitalType);
  const effectiveNormalRanges = normalRanges || config.normalRange;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1 font-weight-bold">{label}</p>
          {vitalType === 'blood-pressure' ? (
            <>
              <p className="mb-1 text-danger">
                Systolic: <strong>{data.systolic} mmHg</strong>
              </p>
              <p className="mb-0 text-info">
                Diastolic: <strong>{data.diastolic} mmHg</strong>
              </p>
            </>
          ) : (
            <p className="mb-0" style={{ color: config.color }}>
              {vitalType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: 
              <strong> {payload[0].value} {unit}</strong>
            </p>
          )}
          {data.notes && (
            <p className="mb-0 text-muted small mt-1">
              <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
              {data.notes}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // AI Trend Analysis Component
  const AITrendInsights = () => {
    if (!showAiInsights || !aiTrendAnalysis) return null;

    const getTrendIcon = (trend) => {
      switch (trend) {
        case 'improving': return faArrowTrendUp;
        case 'declining': return faArrowTrendDown;
        case 'concerning': return faExclamationTriangle;
        default: return faMinus;
      }
    };

    const getTrendColor = (trend) => {
      switch (trend) {
        case 'improving': return 'success';
        case 'declining': return 'warning';
        case 'concerning': return 'danger';
        default: return 'info';
      }
    };

    return (
      <div className="ai-insights-panel mt-3 p-3 bg-light rounded">
        <div className="d-flex align-items-center mb-2">
          <FontAwesomeIcon icon={faRobot} className="text-primary me-2" />
          <strong>AI Analysis</strong>
          <Badge color="secondary" className="ms-2 small">
            {Math.round(aiTrendAnalysis.confidence * 100)}% confidence
          </Badge>
        </div>
        
        <div className="d-flex align-items-center mb-2">
          <FontAwesomeIcon 
            icon={getTrendIcon(aiTrendAnalysis.trend)} 
            className={`text-${getTrendColor(aiTrendAnalysis.trend)} me-2`}
          />
          <Badge color={getTrendColor(aiTrendAnalysis.trend)} className="me-2">
            {aiTrendAnalysis.trend}
          </Badge>
          <span className="small text-muted">trend detected</span>
        </div>

        <p className="mb-2 small">{aiTrendAnalysis.summary}</p>
        
        {aiTrendAnalysis.recommendations && aiTrendAnalysis.recommendations.length > 0 && (
          <div className="recommendations">
            <strong className="small">Recommendations:</strong>
            <ul className="mb-0 mt-1 small">
              {aiTrendAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Statistics Panel
  const StatsPanel = () => {
    if (!trendStats) return null;

    return (
      <div className="stats-panel mt-3">
        <div className="row text-center">
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value text-primary">{trendStats.recent}</div>
              <div className="stat-label small text-muted">Latest</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value text-info">{trendStats.average}</div>
              <div className="stat-label small text-muted">Average</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value text-success">{trendStats.min}</div>
              <div className="stat-label small text-muted">Min</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value text-warning">{trendStats.max}</div>
              <div className="stat-label small text-muted">Max</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Alert color="info" className="text-center">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        No data available for {vitalType.replace('-', ' ')} in the selected time range.
      </Alert>
    );
  }

  return (
    <div className="enhanced-vitals-chart">
      <div className="chart-header d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          {vitalType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          <small className="text-muted ms-2">({timeRange})</small>
        </h5>
        {trendStats && (
          <div className="trend-indicator d-flex align-items-center">
            <FontAwesomeIcon 
              icon={
                trendStats.direction === 'up' ? faArrowTrendUp :
                trendStats.direction === 'down' ? faArrowTrendDown : faMinus
              }
              className={`me-1 ${
                trendStats.direction === 'up' ? 'text-success' :
                trendStats.direction === 'down' ? 'text-danger' : 'text-info'
              }`}
            />
            <span className="small">
              {trendStats.direction === 'stable' ? 'Stable' : `${trendStats.percentChange}%`}
            </span>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer>
          {vitalType === 'blood-pressure' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Normal range reference areas */}
              {effectiveNormalRanges && (
                <ReferenceArea
                  y1={effectiveNormalRanges.min}
                  y2={effectiveNormalRanges.max}
                  fill={config.color}
                  fillOpacity={0.1}
                  label={{ value: effectiveNormalRanges.label, position: 'topLeft' }}
                />
              )}
              
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#e74c3c"
                strokeWidth={3}
                dot={{ r: 4, fill: '#e74c3c' }}
                activeDot={{ r: 6, fill: '#c0392b' }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#3498db"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3498db' }}
                activeDot={{ r: 6, fill: '#2980b9' }}
                name="Diastolic"
              />
              
              {chartData.length > 10 && (
                <Brush 
                  dataKey="dateFormatted" 
                  height={30} 
                  stroke={config.color}
                />
              )}
            </LineChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${vitalType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Normal range reference area */}
              {effectiveNormalRanges && (
                <ReferenceArea
                  y1={effectiveNormalRanges.min}
                  y2={effectiveNormalRanges.max}
                  fill={config.color}
                  fillOpacity={0.1}
                  label={{ value: effectiveNormalRanges.label, position: 'topLeft' }}
                />
              )}
              
              <Area
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={config.strokeWidth}
                fill={`url(#gradient-${vitalType})`}
                dot={{ r: 4, fill: config.color }}
                activeDot={{ r: 6, fill: config.gradient[1] }}
              />
              
              {chartData.length > 10 && (
                <Brush 
                  dataKey="dateFormatted" 
                  height={30} 
                  stroke={config.color}
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <StatsPanel />
      <AITrendInsights />
    </div>
  );
};

EnhancedVitalsChart.propTypes = {
  vitalType: PropTypes.oneOf([
    'blood-pressure', 
    'blood-sugar', 
    'heart-rate', 
    'weight', 
    'cholesterol', 
    'other'
  ]).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      value: PropTypes.number,
      systolic: PropTypes.number,
      diastolic: PropTypes.number,
      notes: PropTypes.string
    })
  ).isRequired,
  unit: PropTypes.string.isRequired,
  timeRange: PropTypes.string.isRequired,
  aiTrendAnalysis: PropTypes.shape({
    trend: PropTypes.oneOf(['improving', 'stable', 'declining', 'concerning']),
    confidence: PropTypes.number,
    summary: PropTypes.string,
    recommendations: PropTypes.arrayOf(PropTypes.string)
  }),
  showAiInsights: PropTypes.bool,
  normalRanges: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
    label: PropTypes.string
  })
};

export default EnhancedVitalsChart;