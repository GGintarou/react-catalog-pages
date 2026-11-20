import { useEffect, useState, useMemo } from 'react'; // Добавили useMemo

export default function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  
  // Новое состояние для строки поиска
  const [query, setQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    fetch(import.meta.env.BASE_URL + 'product.json',{signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(data => {
        setProducts(data);
        setStatus('success');
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setError(error.message);
        setStatus('error');
      });

    return () => controller.abort();
  }, [attempt]);

  // ВАЖНО: Хук useMemo должен вызываться ДО любых return!
  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products; // Если поиск пустой, показываем всё
    return products.filter(product =>
      product.name.toLowerCase().includes(needle)
    );
  }, [products, query]);

  // Теперь условные return идут после хуков
  if (status === 'loading') return <p>Загрузка...</p>;

  if (status === 'error') {
    return (
      <div>
        <p role="alert">Ошибка: {error}</p>
        <button onClick={() => {
          setStatus('loading');
          setAttempt(n => n + 1);
        }}>Повторить</button>
      </div>
    );
  }

  return (
    <main>
      <h1>Каталог</h1>
      
      {/* Поле для поиска */}
      <input 
        type="text" 
        placeholder="Поиск товара..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: '20px', padding: '5px' }}
      />

      {visibleProducts.length === 0 ? (
        <p>Товаров не найдено</p>
      ) : (
        <ul>
          {visibleProducts.map(product => (
            <li key={product.id}>{product.name}: {product.qty} шт.</li>
          ))}
        </ul>
      )}
    </main>
  );
}

