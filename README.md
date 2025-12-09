Pulix - AI Image & Hashtag Generation Service

ENGLISH VERSION

Pulix is a modern web service that allows users to generate high‑quality
AI images from text prompts. It provides secure authentication, flexible
request customization, and seamless integration with DeAPI for fast,
reliable image generation.

⚠️ Project Status This project is under active development. The current
version serves as a stable foundation showcasing core features.

🚀 Future Roadmap [ ] Contact Page — Implement contact.html with backend
feedback handling.
[ ] Hashtag Generation — Automatically suggest hashtags based on
prompts.
[ ] Enhanced Image Generation — Support multiple AI models, LoRA, and
improved status tracking.
[ ] Profiles & Galleries — Allow users to view their generation history.

✨ Key Features • User Authentication — Secure registration/login with
JWT.
• AI Image Generation — Generate images through DeAPI using text
prompts.
• Advanced Customization — Choose style, aspect ratio, and negative
prompt.
• Protected Routes — Access to generation features only for
authenticated users.

🛠️ Tech Stack Backend: FastAPI
Database: MongoDB (Motor async driver)
Auth: JWT (PyJWT), Passlib for password hashing
HTTP Client: HTTPX
Server: Uvicorn
Frontend: HTML, CSS, JavaScript
Third‑Party: DeAPI for AI image generation

⚙️ Installation & Setup Prerequisites:
• Python 3.8+
• MongoDB
• DeAPI access token

1.  Clone the repository: git clone cd

2.  Create and activate virtual environment: python -m venv venv source
    venv/bin/activate # Windows: # venv

3.  Install dependencies: pip install -r requirements.txt

4.  Create .env file with: MONGO_URL=“mongodb://localhost:27017/”
    JWT_SECRET=“your_super_secret_jwt_key”
    DEAPI_TOKEN=“your_deapi_access_token”

5.  Run server: uvicorn main:app –reload

API available at http://127.0.0.1:8000
Swagger Docs at http://127.0.0.1:8000/docs

🌐 API Endpoints POST /auth/register — Register a new user
POST /auth/login — Authenticate and receive JWT token
GET /auth/me — Get current user data
DELETE /auth/delete — Delete current user
POST /generation/generate-image — Generate an image

RUSSIAN VERSION

Pulix — это современный веб‑сервис, позволяющий пользователям
генерировать качественные изображения с помощью ИИ на основе текстовых
промптов. Он предоставляет безопасную аутентификацию, гибкую настройку
запросов и плавную интеграцию с DeAPI для быстрой и стабильной
генерации.

⚠️ Статус проекта Проект активно развивается. Текущая версия — надёжная
база для дальнейшего расширения функционала.

🚀 Дорожная карта [ ] Страница контактов — Создание contact.html и
логики обратной связи.
[ ] Генерация хэштегов — Автоматические рекомендации хэштегов по
промпту.
[ ] Улучшенная генерация — Поддержка нескольких AI‑моделей, LoRA,
улучшенная обработка статусов.
[ ] Профили и галереи — История генераций для пользователей.

✨ Основные возможности • Аутентификация — Безопасная регистрация и вход
с JWT.
• Генерация изображений — Создание изображений через DeAPI.
• Расширенная кастомизация — Выбор стиля, соотношения сторон и
негативного промпта.
• Защищённые маршруты — Доступ к генерации только у авторизованных
пользователей.

🛠️ Технологический стек Бэкенд: FastAPI
База данных: MongoDB (Motor async)
Авторизация: JWT (PyJWT), Passlib
HTTP‑запросы: HTTPX
Сервер: Uvicorn
Фронтенд: HTML, CSS, JS
Сторонний сервис: DeAPI

⚙️ Установка и запуск Требования:
• Python 3.8+
• MongoDB
• Токен доступа DeAPI

1.  Клонируйте репозиторий: git clone cd <папка‑проекта>

2.  Создайте и активируйте виртуальное окружение: python -m venv venv
    source venv/bin/activate # Windows: # venv

3.  Установите зависимости: pip install -r requirements.txt

4.  Создайте файл .env: MONGO_URL=“mongodb://localhost:27017/”
    JWT_SECRET=“your_super_secret_jwt_key”
    DEAPI_TOKEN=“your_deapi_access_token”

5.  Запустите сервер: uvicorn main:app –reload

API: http://127.0.0.1:8000
Документация: http://127.0.0.1:8000/docs
