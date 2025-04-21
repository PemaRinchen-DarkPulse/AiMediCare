import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const VitalsChart = ({ vitalType, data, unit, timeRange }) => {
  // Format dates to readable format
  const labels = data.map(item => new Date(item.date).toLocaleDateString());
  
  // Extract values
  const values = data.map(item => item.value);
  
  // Default color schemes for different vital types
  const getColorConfig = (type) => {
    switch (type) {
      case 'blood-pressure':
        return { borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.1)' };
      case 'heart-rate':
        return { borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.1)' };
      case 'oxygen-saturation':
        return { borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.1)' };
      case 'temperature':
        return { borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.1)' };
      default:
        return { borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.1)' };
    }
  };
  
  const colorConfig = getColorConfig(vitalType);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: `${vitalType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} (${unit})`,
        data: values,
        borderColor: colorConfig.borderColor,
        backgroundColor: colorConfig.backgroundColor,
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${timeRange} History`,
      },
    },
  };
  
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

VitalsChart.propTypes = {
  vitalType: PropTypes.oneOf(['blood-pressure', 'heart-rate', 'oxygen-saturation', 'temperature', 'other']).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  unit: PropTypes.string.isRequired,
  timeRange: PropTypes.string.isRequired
};

export default VitalsChart;