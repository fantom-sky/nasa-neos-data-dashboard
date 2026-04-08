import React, { useState } from 'react';
import type { Asteroid } from '../types/types';

interface Props {
  data: Asteroid[];
}

export const CustomChart: React.FC<Props> = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState<Asteroid | null>(null);

    // ПРОВЕРКА: Если данных нет, возвращаем заглушку и выходим из функции
  if (!data || data.length === 0) {
    return (
      <div style={{ color: '#888', textAlign: 'center', padding: '100px', background: '#111' }}>
        Данные для построения графика отсутствуют
      </div>
    );
  }
  // Настройки холста
  const width = 800;
  const height = 400;
  const padding = 50;

  // 1. Подготовка данных (извлекаем x и y)
  const plotData = data.map(a => ({
    x: Number(a.close_approach_data[0].miss_distance.kilometers),
    y: a.absolute_magnitude_h,
    original: a
  }));

  // 2. Поиск экстремумов для масштабирования
  const xValues = plotData.map(d => d.x);
  const yValues = plotData.map(d => d.y);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  // 3. Функции преобразования в пиксели
  const getX = (val: number) => padding + ((val - minX) / (maxX - minX)) * (width - padding * 2);
  const getY = (val: number) => height - padding - ((val - minY) / (maxY - minY)) * (height - padding * 2);

    
    
  // Функция для создания массива значений для шкалы
    const generateTicks = (min: number, max: number, count: number) => {
    const ticks = [];
    const step = (max - min) / (count - 1);
    for (let i = 0; i < count; i++) {
        ticks.push(min + step * i);
    }
    return ticks;
    };

    const xTicks = generateTicks(minX, maxX, 6);
    const yTicks = generateTicks(minY, maxY, 6);  
  return (
    <div style={{ position: 'relative', background: '#111', padding: '20px', borderRadius: '8px' }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Оси */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#555" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#555" />

        {/* Разметка оси X (Дистанция) */}
        {xTicks.map((val, i) => {
            const x = getX(val);
            return (
            <g key={`x-${i}`}>
                {/* Маленькая вертикальная черточка */}
                {/* <line x1={x} y1={height - padding} x2={x} y2={height - padding + 5} stroke="#555" /> */}
                <line x1={x} y1={height - padding} x2={x} y2={padding} stroke="#222" />
                {/* Числовое значение */}
                <text 
                x={x} 
                y={height - padding + 20} 
                fill="#888" 
                fontSize="10" 
                textAnchor="middle"
                >
                {/* Форматируем: если число большое, переводим в млн км или просто сокращаем */}
                {(val / 1000000).toFixed(1)}M
                </text>
            </g>
            );
        })}

        {/* Разметка оси Y (Блеск) */}
        {yTicks.map((val, i) => {
            const y = getY(val);
            return (
            <g key={`y-${i}`}>
                {/* Маленькая горизонтальная черточка */}
                {/* <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="#555" /> */}
                <line x1={width - padding} y1={y} x2={padding} y2={y} stroke="#222" />

                {/* Числовое значение */}
                <text 
                x={padding - 10} 
                y={y + 3} 
                fill="#888" 
                fontSize="10" 
                textAnchor="end"
                >
                {val.toFixed(1)}
                </text>
            </g>
            );
        })}
              
        {/* Точки (Астероиды) */}
        {plotData.map((d, i) => (
          <circle
            key={i}
            cx={getX(d.x)}
            cy={getY(d.y)}
            r={hoveredNode?.id === d.original.id ? 8 : 4}
            fill={d.original.is_potentially_hazardous_asteroid ? '#ff4d4d' : '#4db8ff'}
            onMouseEnter={() => setHoveredNode(d.original)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ transition: 'all 0.2s', cursor: 'pointer' }}
          />
        ))}

        {/* Подписи осей */}
        <text x={width / 2} y={height - 10} fill="#888" textAnchor="middle">Дистанция (км)</text>
        <text x={10} y={height / 2} fill="#888" transform={`rotate(-90, 10, ${height / 2})`} textAnchor="middle">Блеск (H)</text>
      </svg>

      {/* Тултип (всплывающее окно) */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#000',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none'
        }}>
          <strong>{hoveredNode.name}</strong><br/>
          Дата: {hoveredNode.close_approach_data[0].close_approach_date}<br/>
          Блеск: {hoveredNode.absolute_magnitude_h}
        </div>
      )}
    </div>
  );
};