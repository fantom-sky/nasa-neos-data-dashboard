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
  // Получаем сегодняшнюю дату в формате ГГГГ-ММ-ДД
  const getToday = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [displayRange, setDisplayRange] = useState({ start: '', end: '' });
  // Создаем функцию для расчета максимально допустимой даты
  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 10);
    return max.toISOString().split('T')[0];
  };
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  // Новый флаг: начали ли мы поиск
  const [hasStarted, setHasStarted] = useState(false);

  // 1. Добавляем состояния для управления
  const [showOnlyHazardous, setShowOnlyHazardous] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'speed'>('name');
  
  // const apiKey = import.meta.env.VITE_NASA_API_KEY;

  useEffect(() => {
    // Если пользователь еще не нажал кнопку — ничего не скачиваем
    if (!hasStarted) return;
    const fetchData = async () => {
      setLoading(true);
      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      // Рассчитываем конечную дату (выбранная - 6 дней = всего 7 дней)
      const start = new Date(selectedDate);
      const end = new Date(selectedDate);
      // end.setDate(start.getDate() + 6);
      start.setDate(start.getDate() - 6);

      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];

      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data: ApiResponse = await response.json();
        
        // Превращаем объект с датами в плоский массив астероидов
        const allAsteroids = Object.values(data.near_earth_objects).flat();
        setAsteroids(allAsteroids);
        // СОХРАНЯЕМ ДАТЫ ДЛЯ ЭКРАНА
        setDisplayRange({ start: startDateStr, end: endDateStr });
      } catch (error) {
        console.error("Помилка під час завантаження даних:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasStarted, selectedDate]); // Эффект сработает при изменении даты, Массив зависимостей: следим за обоими

  // if (loading) return <div>Загрузка данных из космоса...</div>;
  
  const handleStartSearch = () => {
    setHasStarted(true);
  };

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
  
  // 3. Считаем количество опасных объектов
  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;

  // Можно также посчитать процент для наглядности
  const hazardousPercentage = asteroids.length > 0 
    ? ((hazardousCount / asteroids.length) * 100).toFixed(1) 
    : 0;
  
  return (
    <div className="App">
      <h1>Asteroid Radar 🛰️</h1>
      {/* ЭКРАН 1: Приветствие и выбор даты (виден всегда или пока нет данных) */}
      {!hasStarted ? (
        <div className="welcome-screen" style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '20px auto', width: '50%', textAlign: 'center', color: '#0930ca' }}>Ласкаво просимо до центру моніторингу навколоземних астероїдів!</h2>
          <p style={{ fontSize: '18px', color: '#1a1a1a', marginTop: '5px' }}>
            Дізнайтеся про астероїди, які максимально наближаються до Землі в обраний вами діапазон дат!
          </p>
          <div className="date-picker-container" style={{ margin: '20px 0', padding: '15px', background: '#1a1a1a', borderRadius: '8px' }}>
            <label htmlFor="start-date" style={{ marginRight: '10px', color: '#e7e7e7' }}>
              Оберіть дату початку спостережень, щоб отримати дані від NASA:
            </label>
            <input
              type="date"
              id="start-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              // Добавляем ограничение:
              max={getMaxDate()}
              style={{ padding: '5px', borderRadius: '4px', border: '1px solid #555', background: '#333', color: '#fff' }}
            />
            <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
              * Буде показано дані за 7 днів, закінчуючи цією датою
            </p>
          </div>
          <button onClick={handleStartSearch}>Почати сканування</button>
        </div>
      ) : (
        /* ЭКРАН 2: Основной интерфейс (появляется после нажатия кнопки) */
        <main>
          <button onClick={() => setHasStarted(false)}>← Обрати іншу дату</button>
          
          {loading ? (
            <p>Пошук астероїдів...</p>
          ) : (
            <>              
              
              <div className="info-panel" style={{ 
                margin: '20px 0', 
                padding: '15px', 
                borderLeft: '4px solid #4db8ff', 
                background: 'rgba(77, 184, 255, 0.1)' 
              }}>
                <p>📊 <strong>Результати сканування:</strong></p>
                <p>Період: <span>{displayRange.start}</span> — <span>{displayRange.end}</span></p>
                <p>...</p>
                <p><strong>Знайдено об'єктів:</strong></p>
                <p>- всього: <strong>{asteroids.length}</strong></p>
                <p style={{ color: hazardousCount > 0 ? '#ff4d4d' : '#4dff88' }}>
                  - потенційно небезпечних: <strong>{hazardousCount}</strong> ({hazardousPercentage}%) ⚠️
                </p>
              </div>
              {/* 3. Панель управления */}
              <div className="controls" style={{ marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={showOnlyHazardous}
                    onChange={(e) => setShowOnlyHazardous(e.target.checked)}
                  />
                  ⚠️ Тільки небезпечні
                </label>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                  <option value="name">Сортувати за ім'ям</option>
                  <option value="size">...за розміром (від max до min)</option>
                  <option value="speed">...за швидкістю (від max до min)</option>
                </select>
              </div>
              <p>Кількість об'єктів, що відображаються: {filteredAsteroids.length}</p>
              {/* Вставляем наш кастомный график */}
              <section style={{ margin: '40px 0' }}>
                <h2>Візуалізація: Блиск (зор.вел.) vs Відстань до Землі (млн. км)</h2>
                <CustomChart data={filteredAsteroids} />
              </section>
              {/* 3. Список карточек (теперь тоже использует filteredAsteroids) */}
              <div className="asteroid-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {filteredAsteroids.map(asteroid => (
                  <div key={asteroid.id} className={`asteroid-card ${asteroid.is_potentially_hazardous_asteroid ? 'danger' : ''}`}
                    style={{ border: '1px solid #444', padding: '15px', borderRadius: '10px', textAlign: 'left' }}>
                    <h3>{asteroid.name.replace(/[()]/g, '')}</h3>
                    <p>📏 Діаметр: {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} км</p>
                    <p>🚀 Швидкість: {Math.round(Number(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour))} км/ч</p>
                    {asteroid.is_potentially_hazardous_asteroid && <b style={{ color: '#ff4d4d' }}>⚠️ НЕБЕЗПЕЧНИЙ</b>}
                  </div>
                ))}
              </div>
              <div className="asteroid-grid">
                {asteroids.map(asteroid => (
                  <div key={asteroid.id} className={`asteroid-card ${asteroid.is_potentially_hazardous_asteroid ? 'danger' : ''}`}>
                    <h3>{asteroid.name.replace(/[()]/g, '')}</h3>
                    <div className="stats">
                      <p>📏 Діаметр: {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} км</p>
                      <p>🚀 Швидкість: {Math.round(Number(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour))} км/ч</p>
                      <p>🛣 Відстань до Землі: {Number(asteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()} км</p>
                      <p key={asteroid.id}>{asteroid.name} — {asteroid.is_potentially_hazardous_asteroid ? '⚠️ Небезпечний' : '✅ Безпечний'}</p>
                    </div>
                    {asteroid.is_potentially_hazardous_asteroid && <span className="badge">⚠️ Потенційно небезпечний</span>}
                  </div>
                ))}
              </div>
              {/* <div>
                <h2>Asteroid Radar</h2>
                <p>Найдено объектов за неделю: {asteroids.length}</p>
                <ul>
                  {asteroids.map(asteroid => (
                    <li key={asteroid.id}>
                      {asteroid.name} — {asteroid.is_potentially_hazardous_asteroid ? '⚠️ Опасен' : '✅ Безопасен'}
                    </li>
                  ))}
                </ul>
              </div> */}
            </>
          )}
        </main>
      )}
    </div>)
}
export default App
