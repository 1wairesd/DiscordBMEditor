# DiscordBMEditor

Веб-редактор для команд DiscordBMV (аналог LuckPermsWeb)

## Возможности
- Загрузка команд из bytebin по ссылке
- Визуальное редактирование команд (name, description, context, options, actions и т.д.)
- Сохранение изменений обратно на bytebin
- Генерация команды для применения изменений в DiscordBMV
- Современный UI/UX, поддержка мобильных устройств

## Как запустить локально

```bash
npm install
npm run dev
```

## Деплой
- Готов к деплою на Render (статический хостинг)

## Архитектура
- Vue 3 + Vite
- Axios для HTTP-запросов
- SCSS/modern CSS

---

**Открыть редактор:**
```
https://your-discordbm-editor.onrender.com/#<код>
```

**Применить изменения:**
```
/discordbmv applyedits <код>
``` 