// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

import { useEffect, useState } from 'react';
import './App.css';
import type { Asteroid, ApiResponse } from '../types/types';
import { CustomChart } from './CustomChart';
import { AsteroidTable } from './AsteroidTable';


function App() {
  // Получаем сегодняшнюю дату в формате ГГГГ-ММ-ДД для UTC
  // const getToday = () => new Date().toISOString().split('T')[0];
  // Получаем сегодняшнюю дату в формате ГГГГ-ММ-ДД для локального времени
  const getToday = () => new Date().toLocaleDateString('sv-SE');
  // Более сложный вариант получения даты по локальному времени
  // const getToday = () => {
  //   const date = new Date();    
  //   // Вытаскиваем компоненты даты локально
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JS идут от 0 до 11
  //   const day = String(date.getDate()).padStart(2, '0');
    
  //   return `${year}-${month}-${day}`;
  // };

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [displayRange, setDisplayRange] = useState({ start: '', end: '' });
  // Создаем функцию для расчета максимально допустимой даты
  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 10);
    return max.toLocaleDateString('sv-SE');
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

      // const startDateStr = start.toISOString().split('T')[0];
      // const endDateStr = end.toISOString().split('T')[0];
      const startDateStr = start.toLocaleDateString('sv-SE');
      const endDateStr = end.toLocaleDateString('sv-SE');

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

  // 2. Вычисляем список, который нужно показать после сортировки
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
          <p style={{ fontSize: '18px', marginTop: '5px' }}>
            Дізнайтеся про астероїди, які максимально наближаються до Землі в обраний вами діапазон дат!
          </p>
          <div className="date-picker-container" style={{ display: 'flex', flexDirection: 'column', gap: '5px', margin: '20px auto', padding: '15px', background: '#1a1a1a', borderRadius: '8px' }}>
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
              style={{ padding: '5px', borderRadius: '4px', border: '1px solid #555', background: '#333', color: '#fff', margin: '20px auto' }}
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
                <p style={{ color: hazardousCount > 0 ? '#ff4d4d' : '#369f59' }}>
                  - потенційно небезпечних: <strong>{hazardousCount}</strong> ({hazardousPercentage}%) ⚠️
                </p>
              </div>
              {/* 3. Панель управления */}
              <div className="controls" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                <label style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={showOnlyHazardous}
                    onChange={(e) => setShowOnlyHazardous(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  ⚠️ Тільки небезпечні
                </label>
                <p>Сортувати за:</p>

                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ margin: '0 auto' }}
                >
                  <option value="name">...ім'ям</option>
                  <option value="size">...розміром (від max до min)</option>
                  <option value="speed">...швидкістю (від max до min)</option>
                </select>
              </div>
              <p>Кількість об'єктів, що відображаються: {filteredAsteroids.length}</p>
              {/* Вставляем наш кастомный график */}
              <section style={{ margin: '40px 0' }}>
                <h2>Візуалізація: Блиск (зор.вел.) vs Відстань до Землі (млн. км)</h2>
                <CustomChart data={filteredAsteroids} />
              </section>
              {/* Таблица с отсортированными данными */}
              <section>
                <h3>Більш детальні дані</h3>
                <AsteroidTable data={filteredAsteroids} />
              </section>
              {/* 4. Список карточек (теперь тоже использует filteredAsteroids) */}
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
              
              <div className="asteroid-grid" style={{ margin: '30px auto', padding: '30px', backgroundColor: '#bfdecd' }}>
                <h3>Інший варіант виведення даних</h3>
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
