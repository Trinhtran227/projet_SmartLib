# 📚 Library Management System API

A library management system built with **Node.js + Express + MongoDB**, featuring **JWT authentication** and **RBAC (Role-Based Access Control)**.

---

## 🚀 Main Features

### 👥 User Roles

* **GUEST**: Can only view books, book details, and filters
* **USER (Student)**: Register/login, edit profile, borrow books, view borrowing/return history
* **LIBRARIAN**: Create loan/return records for any reader, print PDF receipts, manage categories
* **ADMIN**: Full access + user/role management + fine configuration

---

### ⚙️ Core Features

* ✅ JWT Authentication & Authorization
* ✅ Role-Based Access Control (RBAC)
* ✅ Manage books, categories, publishers, faculties, departments
* ✅ Borrow/return system with transactions
* ✅ Late and damage fee calculation
* ✅ Statistics and reporting
* ✅ Upload book covers and user avatars
* ✅ Cron job for overdue updates

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Auth**: JWT
* **File Upload**: Multer
* **Security**: Helmet, CORS, Rate Limiting
* **Testing**: Jest, Supertest
* **Scheduler**: Node-cron

---

## 📦 Installation

### Requirements

* Node.js >= 14
* MongoDB >= 4
* npm or yarn

### 1. Clone repo

```bash
git clone <repository-url>
cd projet_smartlib/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment

```bash
cp env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/library_management
DB_NAME=library_management

JWT_SECRET=your_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

PORT=5000
NODE_ENV=development

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

CORS_ORIGIN=http://localhost:3000
```

### 4. Start MongoDB

```bash
mongod
```

### 5. Seed data

```bash
npm run seed
```

### 6. Run server

```bash
npm run dev   # development
npm start     # production
```

---

## 🧪 Testing

```bash
npm test
npm run test:coverage
npm run test:watch
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

```
Authorization: Bearer <access_token>
```

### Response Format

**Success**

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

**Error**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": []
  }
}
```

---

## 🔗 Endpoints

### Auth

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/refresh`
* `GET /auth/me`

### Users

* `PATCH /users/me`
* `PUT /users/me/password`
* `POST /users/me/avatar`
* `GET /users` (ADMIN)
* `POST /users` (ADMIN)
* `PUT /users/:id` (ADMIN)
* `DELETE /users/:id` (ADMIN)
* `PATCH /users/:id/role` (ADMIN)

### Books

* `GET /books`
* `GET /books/:id`
* `POST /books` (LIBRARIAN/ADMIN)
* `PUT /books/:id`
* `DELETE /books/:id`

### Loans

* `GET /loans`
* `GET /loans/:id`
* `POST /loans/self`
* `POST /loans/:id/print`

### User History

* `GET /users/me/loans`

### Statistics

* `GET /stats/summary`
* `GET /stats/books-by-category`
* `GET /stats/borrows-monthly`

---

## 🔐 Security

* JWT Authentication
* RBAC Authorization
* Rate Limiting
* Input Validation
* Secure headers (Helmet)
* CORS protection
* Password hashing (bcrypt)

---

## 📁 Project Structure

```
backend/
├── models/
├── routes/
├── middleware/
├── utils/
├── scripts/
├── tests/
├── uploads/
│   ├── books/
│   └── avatars/
├── server.js
└── package.json
```

---

## 🚀 Deployment

### Environment

```env
NODE_ENV=production
MONGODB_URI=your-db-uri
JWT_SECRET=your-secret
PORT=5000
```

### PM2

```bash
npm install -g pm2
pm2 start server.js --name "library-api"
pm2 startup
pm2 save
```

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

1. Fork repo
2. Create branch
3. Commit changes
4. Push
5. Open PR

---

## 📝 License

MIT License

---

## 📞 Support

Open an issue or contact the dev team.

---

**Happy Coding! 🎉**
