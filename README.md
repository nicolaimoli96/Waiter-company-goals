# 🍽️ Waiter FM - Enterprise Competition System

A complete restaurant management system with gamified competition features for 3000+ waiters across multiple locations.

## 🚀 Features

### 🔐 **Authentication System**
- **User Registration & Login** with JWT tokens
- **Role-based Access Control** (Admin/Waiter)
- **Secure Session Management**
- **Password Hashing** with bcrypt

### 🏆 **Competition Management**
- **Central Office Admin Panel** for creating competitions
- **Real-time Competition Status** tracking
- **Persistent Database Storage** (SQLite)
- **Competition Participation** tracking
- **Progress Monitoring** with visual rings

### 📊 **Performance Tracking**
- **Activity Rings** (Apple Watch style)
- **Target vs Actual** progress tracking
- **Money Rain Animation** when targets are reached
- **Real-time Updates** across all users

### 🎨 **Modern UI/UX**
- **Responsive Design** for mobile and desktop
- **Dark Theme** with glassmorphism effects
- **Smooth Animations** and transitions
- **Professional Typography** with Gotham font

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** with modern hooks
- **Axios** for API communication
- **Custom CSS** with advanced animations
- **JWT Authentication** with localStorage

### Backend
- **Express.js** REST API server
- **SQLite Database** with persistent storage
- **JWT Authentication** with bcrypt password hashing
- **CORS & Security** middleware
- **Rate Limiting** for API protection

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
node database/init-db.js
npm start
```

### 2. Frontend Setup
```bash
cd .. # (back to project root)
npm install
npm start
```

### 3. Quick Setup (Automated)
```bash
cd backend
node scripts/setup.js
```

## 🎯 Demo Credentials

### Admin Access
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full competition management

### Waiter Access
- **Registration:** Create new accounts
- **Role:** Automatic waiter role assignment
- **Features:** Competition participation, progress tracking

## 🏗️ System Architecture

### Database Schema
```
users
├── id (Primary Key)
├── username (Unique)
├── email (Unique)
├── password_hash
├── role (admin/waiter)
├── restaurant_id
└── timestamps

competitions
├── id (Primary Key)
├── item
├── target_quantity
├── prize
├── description
├── is_active
├── created_by (Foreign Key)
└── timestamps

competition_participation
├── id (Primary Key)
├── competition_id (Foreign Key)
├── user_id (Foreign Key)
├── is_participating
├── actual_quantity
└── timestamps
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Competitions
- `GET /api/competition/active` - Get active competition
- `GET /api/competition/status` - Get user's competition status
- `POST /api/competition/start` - Start new competition (Admin)
- `POST /api/competition/stop` - Stop active competition (Admin)
- `POST /api/competition/participate` - Join/leave competition
- `PUT /api/competition/progress` - Update progress
- `GET /api/competition/leaderboard` - Get leaderboard (Admin)

#### Waiters
- `GET /api/waiters` - Get all waiters
- `POST /api/waiters` - Add new waiter

## 🎮 How to Use

### For Central Office (Admin)
1. **Login** with admin credentials
2. **Access Admin Panel** via "🏢 Admin Panel" button
3. **Create Competition:**
   - Select item (Marinara, Margherita, etc.)
   - Set target quantity
   - Define prize amount
   - Write description
4. **Start Competition** - All waiters see notification
5. **Monitor Progress** via leaderboard
6. **Stop Competition** when complete

### For Waiters
1. **Register/Login** with personal credentials
2. **View Dashboard** with activity rings
3. **See Competition Notification** (pulsing bell 🔔)
4. **Click to Participate** or ignore
5. **Input Progress** in golden competition chip
6. **Watch Ring Fill** as you approach target
7. **Prize Reveals** when target is reached!

## 🔧 Configuration

### Environment Variables
```bash
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
DB_PATH=./database/waiter_fm.db
```

### Production Deployment
1. **Update JWT_SECRET** to secure random string
2. **Set NODE_ENV=production**
3. **Configure CORS** for your domain
4. **Use PostgreSQL/MySQL** for production database
5. **Set up SSL/HTTPS**

## 📱 Mobile Support
- **Responsive Design** works on all devices
- **Touch-friendly** interactions
- **Optimized Performance** for mobile networks
- **PWA Ready** for app-like experience

## 🔒 Security Features
- **JWT Token Authentication**
- **Password Hashing** with bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Protection**
- **Input Validation**
- **SQL Injection Prevention**

## 🚀 Scaling for 3000+ Users

### Database Optimization
- **Indexed Queries** for fast lookups
- **Connection Pooling** for concurrent users
- **Query Optimization** for large datasets

### Performance Features
- **Efficient State Management** with React hooks
- **Optimized API Calls** with proper caching
- **Lazy Loading** for better performance
- **Error Boundaries** for stability

### Monitoring & Analytics
- **User Activity Tracking**
- **Competition Performance Metrics**
- **System Health Monitoring**
- **Error Logging & Reporting**

## 🎉 Result

This system transforms your restaurant chain into a **gamified, data-driven operation** where:

- **3000+ waiters** can participate in real-time competitions
- **Central office** has full control over competition parameters
- **Progress is tracked** persistently across sessions
- **Motivation is maintained** through visual feedback and rewards
- **Data is secure** with enterprise-grade authentication
- **System scales** to handle thousands of concurrent users

The app now provides a **complete enterprise solution** for restaurant performance management with engaging competition features that drive results! 🏆

## 📞 Support

For technical support or feature requests, contact the development team.

---

**Built with ❤️ for the restaurant industry**