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

  // Labels: Combine Name and Grade in a clean format
  const fullLabels = chartLabels.map((label, index) => {
    const keys = ['power', 'speed', 'range', 'durability', 'precision', 'potential'];
    const grade = stats[keys[index]] || '?';
    return `${label} ${grade}`;
  });

  const dataValues = [
    gradeToNumber(stats.power),
    gradeToNumber(stats.speed),
    gradeToNumber(stats.range),
    gradeToNumber(stats.durability),
    gradeToNumber(stats.precision),
    gradeToNumber(stats.potential),
  ];

  const data = {
    labels: fullLabels,
    datasets: [
      {
        label: 'Stats',
        data: dataValues,
        backgroundColor: 'rgba(220, 20, 60, 0.6)', // Crimson Red
        borderColor: '#ff0000',
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#000',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(0,0,0,0.5)',
          lineWidth: 1,
        },
        grid: {
          color: 'rgba(0,0,0,0.3)',
          circular: true,
          lineWidth: 1,
        },
        pointLabels: {
          color: '#000',
          font: {
            size: 13,
            family: '"Noto Sans SC", sans-serif',
            weight: 'bold' // Bold for readability
          },
          backdropColor: 'rgba(255, 255, 255, 0.9)', // White bg for text readability
          backdropPadding: 4,
          padding: 10
        },
        ticks: {
          display: false,
          maxTicksLimit: 6,
        },
        suggestedMin: 0,
        suggestedMax: 5,
      },
    },
    plugins: {
      legend: { display: false },
    },
    layout: {
      padding: 5
    }
  };

  return <Radar data={data} options={options} />;
};

export default StatRadar;
