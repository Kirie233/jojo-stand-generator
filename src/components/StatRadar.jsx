import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const gradeToNumber = (grade) => {
  const map = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, '∞': 6, '?': 0 };
  return map[grade?.toUpperCase()] || 1;
};

const StatRadar = ({ stats, labels: customLabels }) => {
  const defaultLabels = ['Power', 'Speed', 'Range', 'Durability', 'Precision', 'Potential'];

  // Use custom labels (Chinese) if provided, otherwise default
  const chartLabels = customLabels ? [
    customLabels.power,
    customLabels.speed,
    customLabels.range,
    customLabels.durability,
    customLabels.precision,
    customLabels.potential
  ] : defaultLabels;

  const dataValues = [
    gradeToNumber(stats.power),
    gradeToNumber(stats.speed),
    gradeToNumber(stats.range),
    gradeToNumber(stats.durability),
    gradeToNumber(stats.precision),
    gradeToNumber(stats.potential),
  ];

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Stand Stats',
        data: dataValues,
        backgroundColor: 'rgba(189, 0, 255, 0.4)', // Primary color opacity
        borderColor: '#bd00ff', // Primary color
        borderWidth: 2,
        pointBackgroundColor: '#ffd700', // Accent color
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#bd00ff',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        pointLabels: {
          color: '#ffd700', // Gold labels
          font: {
            size: 14,
            family: 'Anton', // Custom font
          }
        },
        ticks: {
          display: false, // Hide numbers
          maxTicksLimit: 6,
        },
        suggestedMin: 0,
        suggestedMax: 5,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Radar data={data} options={options} />;
};

export default StatRadar;
