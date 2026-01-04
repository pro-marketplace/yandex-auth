# Yandex Auth Extension

SSO авторизация через Яндекс. **1 функция** с роутингом по action.

> ⚠️ **Авторизация через Яндекс не работает в редакторе!**
>
> Яндекс блокирует работу в iframe. Для проверки авторизации откройте сайт **в отдельной вкладке браузера**.

---

# [AUTH] Общее для виджетов авторизации

## Логика привязки аккаунтов

Функция автоматически связывает аккаунты по email:

1. **Поиск по provider_id** (google_id/vk_id/yandex_id) → если найден, логиним
2. **Поиск по email** → если найден, привязываем провайдера к существующему аккаунту
3. **Новый пользователь** → создаём запись

Это позволяет пользователю войти через любой провайдер, если email совпадает.

## Требования к базе данных

Функция работает с полями таблицы `users`:

| Поле | Тип | Требования |
|------|-----|------------|
| `yandex_id` | VARCHAR(50) | Может быть NULL |
| `email` | VARCHAR(255) | Может быть NULL |
| `name` | VARCHAR(255) | Может быть NULL |
| `avatar_url` | TEXT | Может быть NULL |
| `email_verified` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `last_login_at` | TIMESTAMP | Может быть NULL |

**⚠️ Если столбец имеет `NOT NULL` без `DEFAULT` — функция упадёт при вставке!**

## Добавление секретов

**ОБЯЗАТЕЛЬНО вызови тулу `put_secret` для КАЖДОГО секрета!**

```python
put_secret("PROVIDER_CLIENT_ID", "<от пользователя>")
put_secret("PROVIDER_CLIENT_SECRET", "<от пользователя>")
put_secret("PROVIDER_REDIRECT_URI", "https://{домен}/auth/{provider}/callback")
put_secret("JWT_SECRET", "<сгенерируй сам>")
```

- Вызывай `put_secret` для КАЖДОГО секрета отдельно
- **JWT_SECRET генерируй сам** (64 hex символа), не спрашивай у пользователя
- Покажи пользователю в чате каждый вызов тулы

## После установки скажи пользователю

> ✅ Авторизация настроена!
>
> **Важно:**
> - Проверяйте авторизацию **в отдельной вкладке**, не в редакторе
> - Если email уже использовался — аккаунт автоматически привяжется

## API (общий для всех провайдеров)

```
GET  ?action=auth-url  — получить URL для авторизации
POST ?action=callback  — обмен code на токены (body: { code })
POST ?action=refresh   — обновление токена (body: { refresh_token })
POST ?action=logout    — выход (body: { refresh_token })
```

## Безопасность

- JWT access tokens (15 мин)
- Refresh tokens хешируются (SHA256) перед сохранением
- Автоочистка протухших токенов при каждом запросе
- CSRF protection через state параметр
- Параметризованные SQL-запросы
- Валидация JWT_SECRET (минимум 32 символа)
- CORS ограничение через `ALLOWED_ORIGINS`
- Скрытие внутренних ошибок от клиента

---

# [YANDEX] Специфичное для Yandex Auth

## Чеклист интеграции

### Шаг 1: Подготовка базы данных

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
CREATE INDEX IF NOT EXISTS idx_users_yandex_id ON users(yandex_id);
```

### Шаг 2: Сопровождение пользователя в Яндекс OAuth

**Скажи пользователю:**

> Для авторизации через Яндекс нужно создать приложение в Яндекс OAuth. Я помогу пошагово:
>
> 1. Перейдите на [oauth.yandex.ru](https://oauth.yandex.ru/)
> 2. Нажмите **"Зарегистрировать новое приложение"**
> 3. Заполните:
>    - **Название приложения**: название вашего сайта
>    - **Описание**: краткое описание
> 4. В разделе **"Платформы"** выберите **"Веб-сервисы"**
> 5. Добавьте **Callback URL**: `https://{ваш-домен}/auth/yandex/callback`
> 6. В разделе **"Доступы"** отметьте:
>    - ✅ Доступ к логину, имени и фамилии, полу
>    - ✅ Доступ к адресу электронной почты
>    - ✅ Доступ к портрету пользователя
> 7. Нажмите **"Создать приложение"**
> 8. Скопируйте **ID** и **Пароль** приложения
>
> Пришлите мне **ID приложения** и **Пароль** когда будут готовы!

### Шаг 3: Добавление секретов

Когда пользователь пришлёт ID и Пароль приложения:

```python
put_secret("YANDEX_CLIENT_ID", "<ID приложения от пользователя>")
put_secret("YANDEX_CLIENT_SECRET", "<Пароль приложения от пользователя>")
put_secret("YANDEX_REDIRECT_URI", "https://{домен-пользователя}/auth/yandex/callback")
put_secret("JWT_SECRET", "<сгенерируй: 64 hex символа>")
```

### Шаг 4: Создание страниц

1. **Страница с кнопкой входа** — добавь `YandexLoginButton`
2. **Страница callback** `/auth/yandex/callback` — обработка редиректа
3. **Страница профиля** — показать данные пользователя после входа

---

## Создание приложения в Яндекс OAuth (детально)

### Шаг 1: Регистрация приложения

1. Перейди на [oauth.yandex.ru](https://oauth.yandex.ru/)
2. Авторизуйся с Яндекс аккаунтом
3. Нажми **"Зарегистрировать новое приложение"**

### Шаг 2: Заполнение данных

1. **Название приложения**: название твоего сайта
2. **Иконка**: загрузи логотип (опционально)
3. **Описание**: краткое описание сервиса

### Шаг 3: Платформы

1. Выбери **"Веб-сервисы"**
2. В поле **"Callback URL"** добавь:
   - `https://your-domain.com/auth/yandex/callback`

### Шаг 4: Доступы (права)

Отметь следующие доступы:
- ✅ **Доступ к логину, имени и фамилии, полу** (`login:info`)
- ✅ **Доступ к адресу электронной почты** (`login:email`)
- ✅ **Доступ к портрету пользователя** (`login:avatar`)

### Шаг 5: Получение ключей

После создания приложения:
1. Скопируй **ID** (ClientID)
2. Скопируй **Пароль** (Client Secret)

---

## Frontend компоненты

| Файл | Описание |
|------|----------|
| `useYandexAuth.ts` | Хук авторизации |
| `YandexLoginButton.tsx` | Кнопка "Войти через Яндекс" |
| `UserProfile.tsx` | Профиль пользователя |

### Пример использования

```tsx
const AUTH_URL = "https://functions.poehali.dev/xxx-yandex-auth";

const auth = useYandexAuth({
  apiUrls: {
    authUrl: `${AUTH_URL}?action=auth-url`,
    callback: `${AUTH_URL}?action=callback`,
    refresh: `${AUTH_URL}?action=refresh`,
    logout: `${AUTH_URL}?action=logout`,
  },
});

// Кнопка входа
<YandexLoginButton onClick={auth.login} isLoading={auth.isLoading} />

// После авторизации
if (auth.isAuthenticated && auth.user) {
  return <UserProfile user={auth.user} onLogout={auth.logout} />;
}
```

### Страница callback

```tsx
// app/auth/yandex/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useYandexAuth } from "@/hooks/useYandexAuth";

const AUTH_URL = "https://functions.poehali.dev/xxx-yandex-auth";

export default function YandexCallbackPage() {
  const router = useRouter();
  const auth = useYandexAuth({
    apiUrls: {
      authUrl: `${AUTH_URL}?action=auth-url`,
      callback: `${AUTH_URL}?action=callback`,
      refresh: `${AUTH_URL}?action=refresh`,
      logout: `${AUTH_URL}?action=logout`,
    },
  });

  useEffect(() => {
    auth.handleCallback().then((success) => {
      if (success) {
        router.push("/profile");
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Авторизация...</p>
    </div>
  );
}
```

---

## Поток авторизации

```
1. Пользователь нажимает "Войти через Яндекс"
2. Frontend → GET ?action=auth-url → получает auth_url + state
3. Frontend сохраняет state в sessionStorage
4. Редирект на Яндекс для авторизации
5. Яндекс → редирект на callback с ?code=...&state=...
6. Frontend → POST ?action=callback { code }
7. Backend обменивает code на токены через Yandex OAuth API
8. Backend проверяет yandex_id → email → создаёт/привязывает пользователя
9. Редирект на страницу профиля
```
