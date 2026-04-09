import React from 'react';
import type { Asteroid } from '../types/types';

interface AsteroidTableProps {
  data: Asteroid[]; // Укажите ваш тип Asteroid, если он есть
}

export const AsteroidTable: React.FC<AsteroidTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="table-container" style={{ marginTop: '30px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #4db8ff', color: '#4db8ff' }}>
            <th style={{ padding: '10px' }}>Рівень загрози для Землі</th>
            <th style={{ padding: '10px' }}>Ім'я астероїда</th>
            <th style={{ padding: '10px' }}>Блиск (зор.вел.)</th>
            <th style={{ padding: '10px' }}>Діаметр (км)</th>
            <th style={{ padding: '10px' }}>Швидкість (км/ч)</th>
            <th style={{ padding: '10px' }}>Відстань до Землі (км)</th>
            <th style={{ padding: '10px' }}>Дата зближення</th>
          </tr>
        </thead>
        <tbody>
          {data.map((asteroid) => (
            <tr key={asteroid.id} style={{ borderBottom: '1px solid #333', color: asteroid.is_potentially_hazardous_asteroid ? '#ff4d4d' : '#369f59' }}>
              <td>{asteroid.is_potentially_hazardous_asteroid ? '⚠️ НЕБЕЗПЕЧНИЙ' : '✅ БЕЗПЕЧНИЙ' }</td>
              <td style={{ padding: '10px' }}>{asteroid.name}</td>
              <td style={{ padding: '10px' }}>{asteroid.absolute_magnitude_h}</td>
              <td style={{ padding: '10px' }}>
                {Math.round(asteroid.estimated_diameter.kilometers.estimated_diameter_max*100)/100}
              </td>
              <td style={{ padding: '10px' }}>
                {Math.round(Number(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour)).toLocaleString()}
              </td>
              <td style={{ padding: '10px' }}>
                {Math.round(Number(asteroid.close_approach_data[0].miss_distance.kilometers)).toLocaleString()}
              </td>
              <td style={{ padding: '10px' }}>
                {asteroid.close_approach_data[0].close_approach_date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};