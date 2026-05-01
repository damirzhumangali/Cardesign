# 🔧 Troubleshooting: Vite HMR + Browser Cache

## Диагностика

Проведя анализ проекта, я **не обнаружил** явного Service Worker кода:
- Нет `registerServiceWorker()` в src/
- Нет sw.js в public/
- Нет PWA плагинов в package.json

Однако есть **другие причины**, почему браузер может показывать старую версию:

### 1. Vite HMR не работает (нет [vite] hmr update)

**Причина**: Настройка `usePolling: true` в `vite.config.js` может конфликтовать с macOS:

```js
server: {
  watch: {
    usePolling: true,  // Может не работать на macOS
    interval: 100,
  },
},
```

**Решение**:
```js
server: {
  fs: {
    allow: ['..'], // Разрешить доступ к parent директории
  },
},
```

Или попробуй добавить в package.json скрипт:
```json
"dev": "vite --host"
```

### 2. Browser Cache (самая вероятная причина)

Даже без явного Service Worker, браузер кеширует:

**Решения:**

1. **Очистить кеш в Chrome:**
   - Открой DevTools (F12)
   - Правый клик по кнопке "Refresh"
   - Выбери "Empty Cache and Hard Reload"

2. **Отключить кеширование в DevTools:**
   - DevTools → Network tab
   - Поставь галочку "Disable cache"
   - **Важно**: эта настройка работает только когда DevTools открыт

3. **Service Worker в браузере:**
   - Открой `chrome://service-internals/`
   - Нажми "Stop Workers" и "Clear storage"

4. **Использовать инкогнито режим:**
   - Открой новое окно в инкогнито
   - Инкогнито не использует кеш и Service Worker

### 3. Проверка реальной работы Vite

Выполни в терминале:
```bash
curl http://localhost:5173/src/components/Scene.jsx | grep "carScale"
```

Если команда возвращает **старое** значение - проблема в Vite.
Если возвращает **новое** - проблема в браузере.

---

## Рекомендуемые действия

### Шаг 1: Проверь что Vite видит изменения

```bash
cd /Users/damirfile/Desktop/cardesign
echo "=== Текущее значение ===" 
grep -n "carScale = " src/components/Scene.jsx
```

### Шаг 2: Используй curl (обход кеша)

```bash
curl -H "Cache-Control: no-cache" http://localhost:5173/src/main.jsx
```

### Шаг 3: Перезапусти Vite сервер

```bash
# Останови текущий сервер (Ctrl+C)
# Запусти заново:
cd /Users/damirfile/Desktop/cardesign && npm run dev
```

### Шаг 4: Проверь работу HMR

После сохранения файла, в терминале должно появиться:
```
[vite] hmr update /src/components/Scene.jsx
```

Если этого нет - проблема в Vite filesystem watcher.

---

## Быстрое решение

Используй этот скрипт для запуска с принудительным polling:

```bash
cd /Users/damirfile/Desktop/cardesign && npx vite --host --poll=1000
```

Или добавь в vite.config.js:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Принудительно использовать все интерфейсы
    fs: {
      allow: ['..'],   // Разрешить доступ выше root
    },
  },
  // ... остальное
});
```

---

## Вывод

Скорее всего проблема **комбинированная**:

1. **Vite HMR работает**, но не отображает `[vite] hmr update` из-за конфликтаpolling на macOS
2. **Браузер кеширует** старую версию даже после hard reload

**Решение**: Используй curl для проверки + открой сайт в инкогнито режиме.
