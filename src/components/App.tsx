// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

import { useEffect, useState } from 'react';
import './App.css';
import type { Asteroid, ApiResponse } from '../types/types';
import { CustomChart } from './CustomChart';

function App() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Добавляем состояния для управления
  const [showOnlyHazardous, setShowOnlyHazardous] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'speed'>('name');
  
  useEffect(() => {
    const fetchData = async () => {
      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=2026-04-01&end_date=2026-04-07&api_key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data: ApiResponse = await response.json();
        
        // Превращаем объект с датами в плоский массив астероидов
        const allAsteroids = Object.values(data.near_earth_objects).flat();
        setAsteroids(allAsteroids);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Загрузка данных из космоса...</div>;


  // 2. Вычисляем список, который нужно показать
  const filteredAsteroids = asteroids
    .filter(a => showOnlyHazardous ? a.is_potentially_hazardous_asteroid : true)
    .sort((a, b) => {
      if (sortBy === 'size') {
        return b.estimated_diameter.kilometers.estimated_diameter_max - a.estimated_diameter.kilometers.estimated_diameter_max;
      }
      if (sortBy === 'speed') {
        return Number(b.close_approach_data[0].relative_velocity.kilometers_per_hour) - 
              Number(a.close_approach_data[0].relative_velocity.kilometers_per_hour);
      }
      return a.name.localeCompare(b.name);
    });
  return (
    <div>
      {/* 1. Панель управления */}
      <div className="controls" style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <label>
          <input 
            type="checkbox" 
            checked={showOnlyHazardous} 
            onChange={(e) => setShowOnlyHazardous(e.target.checked)} 
          />
          ⚠️ Только опасные
        </label>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="name">Сортировать по имени</option>
          <option value="size">По размеру (max)</option>
          <option value="speed">По скорости</option>
        </select>
      </div>
      
      <p>Найдено объектов: {filteredAsteroids.length}</p>

      {/* Вставляем наш кастомный график */}
      <section style={{ margin: '40px 0' }}>
        <h2>Визуализация: Блеск vs Дистанция</h2>
        <CustomChart data={filteredAsteroids} />
      </section>

      {/* 3. Список карточек (теперь тоже использует filteredAsteroids) */}
      <div className="asteroid-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {filteredAsteroids.map(asteroid => (
          <div key={asteroid.id} className={`asteroid-card ${asteroid.is_potentially_hazardous_asteroid ? 'danger' : ''}`} 
              style={{ border: '1px solid #444', padding: '15px', borderRadius: '10px', textAlign: 'left' }}>
            <h3>{asteroid.name.replace(/[()]/g, '')}</h3>
            <p>📏 Диаметр: {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} км</p>
            <p>🚀 Скорость: {Math.round(Number(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour))} км/ч</p>
            {asteroid.is_potentially_hazardous_asteroid && <b style={{ color: '#ff4d4d' }}>⚠️ ОПАСЕН</b>}
          </div>
        ))}
      </div>

      <div className="asteroid-grid">
        {asteroids.map(asteroid => (
          <div key={asteroid.id} className={`asteroid-card ${asteroid.is_potentially_hazardous_asteroid ? 'danger' : ''}`}>
            <h3>{asteroid.name.replace(/[()]/g, '')}</h3>
            <div className="stats">
              <p>📏 Диаметр: {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} км</p>
              <p>🚀 Скорость: {Math.round(Number(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour))} км/ч</p>
              <p>🛣 Дистанция до Земли: {Number(asteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()} км</p>
              <p key={asteroid.id}>{asteroid.name} — {asteroid.is_potentially_hazardous_asteroid ? '⚠️ Опасен' : '✅ Безопасен'}</p>
            </div>
            {asteroid.is_potentially_hazardous_asteroid && <span className="badge">⚠️ Потенциально опасен</span>}
          </div>
        ))}
      </div>

      <div className="App">
        <h1>Asteroid Radar</h1>
        <p>Найдено объектов за неделю: {asteroids.length}</p>
        <ul>
          {asteroids.map(asteroid => (
            <li key={asteroid.id}>
              {asteroid.name} — {asteroid.is_potentially_hazardous_asteroid ? '⚠️ Опасен' : '✅ Безопасен'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
