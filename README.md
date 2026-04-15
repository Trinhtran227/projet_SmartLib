# Hệ Thống Quản Lý Thư Viện

Hệ thống quản lý thư viện được xây dựng với React (Frontend) và Node.js/Express (Backend), sử dụng MongoDB làm cơ sở dữ liệu.

## 📋 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Node.js**: phiên bản 16.x trở lên
- **MongoDB**: phiên bản 4.4 trở lên
- **npm** hoặc **yarn**: để quản lý dependencies

### Kiểm Tra Phiên Bản
```bash
node --version
npm --version
mongod --version
```

## 🚀 Hướng Dẫn Cài Đặt và Chạy Project

### Cách 1: Sử dụng Scripts Tự Động (Khuyến nghị)

#### 🪟 Windows (Command Prompt/PowerShell)

**Setup tự động:**
```cmd
git clone <repository-url>
cd QuanLyThuVien
setup.bat
```

**Khởi động project:**
```cmd
start.bat
```

**Tạo dữ liệu mẫu:**
```cmd
seed.bat
```

**Dừng project:**
```cmd
stop.bat
```

**Script tổng hợp:**
```cmd
dev.bat help    # Xem tất cả commands
dev.bat setup   # Cài đặt project
dev.bat start   # Khởi động servers
dev.bat seed    # Tạo dữ liệu mẫu
dev.bat test    # Chạy tests
dev.bat status  # Kiểm tra trạng thái
```

#### 🐧 Linux/macOS (Bash)

**Setup tự động:**
```bash
git clone <repository-url>
cd QuanLyThuVien
./setup.sh
```

**Khởi động project:**
```bash
./start.sh
```

**Tạo dữ liệu mẫu:**
```bash
./seed.sh
```

**Dừng project:**
```bash
./stop.sh
```

**Script tổng hợp:**
```bash
./dev.sh help    # Xem tất cả commands
./dev.sh setup   # Cài đặt project
./dev.sh start   # Khởi động servers
./dev.sh seed    # Tạo dữ liệu mẫu
./dev.sh test    # Chạy tests
./dev.sh status  # Kiểm tra trạng thái
```

### Cách 2: Thủ Công

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd QuanLyThuVien
```

### Bước 2: Cài Đặt Backend

1. **Di chuyển vào thư mục backend:**
```bash
cd backend
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình biến môi trường:**
```bash
# Copy file env.example thành .env
cp env.example .env
```

4. **Chỉnh sửa file .env với các thông tin sau:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/library_management
DB_NAME=library_management

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Bước 3: Cài Đặt Frontend

1. **Di chuyển vào thư mục frontend:**
```bash
cd ../frontend
```

2. **Cài đặt dependencies:**
```bash
npm install
```

### Bước 4: Khởi Động MongoDB

**Trên Windows:**
```bash
# Khởi động MongoDB service
net start MongoDB
```

**Trên macOS:**
```bash
# Sử dụng Homebrew
brew services start mongodb-community
```

**Trên Linux:**
```bash
# Khởi động MongoDB service
sudo systemctl start mongod
```

### Bước 5: Chạy Project

#### Chạy Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend sẽ chạy tại: `http://localhost:5000`

#### Chạy Frontend (Terminal 2)
```bash
cd frontend
npm start
```
Frontend sẽ chạy tại: `http://localhost:3000`

### Bước 6: Seed Dữ Liệu (Tùy Chọn)

Để có dữ liệu mẫu để test, chạy lệnh sau trong thư mục backend:

```bash
cd backend
npm run seed
```

#### 📊 Các Script Seeding Có Sẵn

Thư mục `backend/scripts/` chứa các script seeding với dữ liệu mẫu phong phú:

**Script chính:**
- `seed.js` - Script seeding chính với dữ liệu đầy đủ
- `seed-optimized.js` - Phiên bản tối ưu hóa

**Script bổ sung:**
- `seedLoanData.js` - Tạo dữ liệu phiếu mượn mẫu
- `seedNotifications.js` - Tạo thông báo mẫu
- `seedReviews.js` - Tạo đánh giá sách mẫu
- `testNotifications.js` - Test hệ thống thông báo
- `testNewBookNotification.js` - Test thông báo sách mới

**Dữ liệu mẫu bao gồm:**
- ✅ **28 cuốn sách** với ảnh bìa thật từ Amazon
- ✅ **12 danh mục** sách đa dạng
- ✅ **12 nhà xuất bản** trong và ngoài nước  
- ✅ **12 khoa** và **14 bộ môn**
- ✅ **5 người dùng** mẫu với các vai trò khác nhau
- ✅ **3 phiếu mượn** mẫu với các trạng thái khác nhau
- ✅ **Chính sách phạt** mặc định

**Tài khoản mặc định để test:**

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@library.com | admin123 |
| Thủ thư | librarian@library.com | librarian123 |
| Sinh viên 1 | student1@university.edu | student123 |
| Sinh viên 2 | student2@university.edu | student123 |
| Sinh viên 3 | student3@university.edu | student123 |

## 🛠️ Scripts Có Sẵn

### Backend Scripts
- `npm start`: Chạy server production
- `npm run dev`: Chạy server development với nodemon
- `npm run seed`: Tạo dữ liệu mẫu
- `npm test`: Chạy tests

### Scripts Seeding Bổ Sung
```bash
# Chạy script seeding chính
node scripts/seed.js

# Chạy phiên bản tối ưu
node scripts/seed-optimized.js

# Tạo dữ liệu phiếu mượn
node scripts/seedLoanData.js

# Tạo thông báo mẫu
node scripts/seedNotifications.js

# Tạo đánh giá sách mẫu
node scripts/seedReviews.js

# Test hệ thống thông báo
node scripts/testNotifications.js

# Test thông báo sách mới
node scripts/testNewBookNotification.js
```

### Frontend Scripts
- `npm start`: Chạy development server
- `npm run build`: Build cho production
- `npm test`: Chạy tests
- `npm run eject`: Eject từ Create React App

## 📁 Cấu Trúc Project

```
QuanLyThuVien/
├── backend/                 # Backend API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── scripts/            # Database seeding scripts
│   │   ├── seed.js         # Script seeding chính
│   │   ├── seed-optimized.js # Phiên bản tối ưu
│   │   ├── seedLoanData.js # Tạo phiếu mượn mẫu
│   │   ├── seedNotifications.js # Tạo thông báo mẫu
│   │   ├── seedReviews.js  # Tạo đánh giá mẫu
│   │   ├── testNotifications.js # Test thông báo
│   │   └── README.md       # Hướng dẫn scripts
│   ├── tests/              # Test files
│   └── uploads/            # File uploads
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # API utilities
│   │   └── types/         # TypeScript types
│   └── public/            # Static files
└── README.md
```

## 🔧 Cấu Hình Bổ Sung

### MongoDB Atlas (Cloud Database)
Nếu muốn sử dụng MongoDB Atlas thay vì local MongoDB:

1. Tạo cluster trên [MongoDB Atlas](https://cloud.mongodb.com)
2. Lấy connection string
3. Cập nhật `MONGODB_URI` trong file `.env`

### Environment Variables
Các biến môi trường quan trọng:

- `MONGODB_URI`: Đường dẫn kết nối MongoDB
- `JWT_SECRET`: Secret key cho JWT tokens
- `PORT`: Port cho backend server (mặc định: 5000)
- `CORS_ORIGIN`: URL frontend được phép truy cập

## 🐛 Troubleshooting

### Lỗi Thường Gặp

1. **MongoDB connection error:**
   - Kiểm tra MongoDB đã chạy chưa
   - Kiểm tra connection string trong .env

2. **Port already in use:**
   - Thay đổi PORT trong .env
   - Hoặc kill process đang sử dụng port

3. **CORS error:**
   - Kiểm tra CORS_ORIGIN trong .env
   - Đảm bảo frontend và backend chạy đúng port

4. **Module not found:**
   - Chạy `npm install` lại
   - Xóa node_modules và cài lại

### Logs và Debugging

**Backend logs:**
```bash
cd backend
npm run dev
```

**Frontend logs:**
```bash
cd frontend
npm start
```

## 📚 API Documentation

Backend API được document trong Postman collection:
- File: `backend/postman/Library_Management_API.postman_collection.json`

## 🧪 Testing

### Chạy Tests Backend
```bash
cd backend
npm test
```

### Chạy Tests Frontend
```bash
cd frontend
npm test
```

## 🚀 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Chạy Production
```bash
cd backend
NODE_ENV=production npm start
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong terminal
2. Đảm bảo tất cả dependencies đã được cài đặt
3. Kiểm tra MongoDB connection
4. Xem troubleshooting section ở trên

## 🛠️ Scripts Tự Động

Project bao gồm các script `.sh` để tự động hóa việc setup và quản lý:

### 📋 Danh Sách Scripts

#### 🪟 Windows Scripts (.bat)

| Script | Mô tả | Cách sử dụng |
|--------|-------|--------------|
| `setup.bat` | Cài đặt project từ đầu | `setup.bat` |
| `start.bat` | Khởi động cả backend và frontend | `start.bat` |
| `stop.bat` | Dừng tất cả servers | `stop.bat` |
| `seed.bat` | Tạo dữ liệu mẫu | `seed.bat` |
| `dev.bat` | Script tổng hợp cho development | `dev.bat help` |

#### 🐧 Linux/macOS Scripts (.sh)

| Script | Mô tả | Cách sử dụng |
|--------|-------|--------------|
| `setup.sh` | Cài đặt project từ đầu | `./setup.sh` |
| `start.sh` | Khởi động cả backend và frontend | `./start.sh` |
| `stop.sh` | Dừng tất cả servers | `./stop.sh` |
| `seed.sh` | Tạo dữ liệu mẫu | `./seed.sh` |
| `dev.sh` | Script tổng hợp cho development | `./dev.sh help` |

### 🚀 Scripts Chi Tiết

#### `setup.sh` - Cài Đặt Tự Động
```bash
./setup.sh
```
**Chức năng:**
- Kiểm tra Node.js và MongoDB
- Cài đặt dependencies cho backend và frontend
- Tạo file .env từ env.example
- Tạo thư mục uploads
- Hiển thị hướng dẫn tiếp theo

#### `start.sh` - Khởi Động Servers
```bash
./start.sh
```
**Chức năng:**
- Kiểm tra kết nối MongoDB
- Khởi động backend trên port 5000
- Khởi động frontend trên port 3000
- Tạo logs và quản lý PIDs
- Hiển thị URLs và tài khoản test

#### `stop.sh` - Dừng Servers
```bash
./stop.sh
```
**Chức năng:**
- Dừng backend và frontend servers
- Dọn dẹp processes và PIDs
- Hiển thị hướng dẫn khởi động lại

#### `seed.sh` - Tạo Dữ Liệu Mẫu
```bash
./seed.sh                    # Chế độ tương tác
./seed.sh seed              # Chạy seed.js
./seed.sh optimized         # Chạy seed-optimized.js
./seed.sh loans            # Chạy seedLoanData.js
./seed.sh notifications    # Chạy seedNotifications.js
./seed.sh reviews          # Chạy seedReviews.js
./seed.sh all              # Chạy tất cả scripts
```
**Chức năng:**
- Kiểm tra MongoDB connection
- Chạy các script seeding
- Hiển thị tài khoản test và dữ liệu đã tạo

#### `dev.sh` - Development Tools
```bash
./dev.sh help      # Hiển thị help
./dev.sh setup     # Cài đặt project
./dev.sh start     # Khởi động servers
./dev.sh stop      # Dừng servers
./dev.sh restart   # Khởi động lại
./dev.sh seed      # Tạo dữ liệu mẫu
./dev.sh test      # Chạy tests
./dev.sh build     # Build production
./dev.sh logs      # Xem logs
./dev.sh clean     # Dọn dẹp project
./dev.sh status    # Kiểm tra trạng thái
```

### 📝 Logs và Monitoring

**Xem logs real-time:**
```bash
tail -f logs/backend.log    # Backend logs
tail -f logs/frontend.log   # Frontend logs
```

**Kiểm tra trạng thái:**
```bash
./dev.sh status
```

**URLs quan trọng:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

### 🔧 Troubleshooting Scripts

#### 🪟 Windows

**Nếu script không chạy được:**
```cmd
dev.bat clean             # Dọn dẹp và cài đặt lại
dev.bat status            # Kiểm tra trạng thái
```

**Nếu port bị chiếm:**
```cmd
stop.bat                  # Dừng tất cả servers
netstat -ano | findstr ":3000"  # Tìm process trên port 3000
netstat -ano | findstr ":5000"  # Tìm process trên port 5000
taskkill /PID <PID> /F    # Force kill process
```

**Nếu MongoDB không chạy:**
```cmd
net start MongoDB         # Khởi động MongoDB service
```

#### 🐧 Linux/macOS

**Nếu script không chạy được:**
```bash
chmod +x *.sh              # Cấp quyền thực thi
./dev.sh clean             # Dọn dẹp và cài đặt lại
./dev.sh status            # Kiểm tra trạng thái
```

**Nếu port bị chiếm:**
```bash
./stop.sh                  # Dừng tất cả servers
lsof -ti:3000 | xargs kill -9  # Force kill port 3000
lsof -ti:5000 | xargs kill -9  # Force kill port 5000
```

**Nếu MongoDB không chạy:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

**Lưu ý:** Đảm bảo MongoDB đang chạy trước khi khởi động backend server.
