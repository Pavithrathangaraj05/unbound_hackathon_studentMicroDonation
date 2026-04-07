# 💜 MicroGive — Student Micro-Donation Platform for Care Homes

A full-stack **MERN** (MongoDB, Express, React, Node.js) application that connects university students with care homes through micro-donations.

---

## 🌟 Features

### For Students
- 🎓 Student-specific login & registration portal
- 🏠 Browse verified care homes with search & filter
- 💰 Donate from as little as £0.50 with preset amounts
- 🎯 Support specific campaigns or make general donations
- 🎁 Browse & fulfill care home wishlists
- 🏆 Points & badges gamification system
- 📊 Personal donation history & stats
- 🥇 Leaderboard to compete with other students

### For Care Homes
- 🏠 Care home-specific login & registration portal
- 📊 Dashboard with donation analytics
- 📣 Create & manage fundraising campaigns
- 🎁 Wishlist management (specific items for residents)
- 💌 View donation messages from students
- 📈 Track total received & donor stats
- ✅ Account approval workflow

### Technical Features
- JWT authentication with role-based access control
- Separate login pages for students and care homes
- Points system (10 pts per £1 donated)
- Badge system (First Giver, Regular, Super, Bronze/Silver/Gold Donor)
- Material UI + React Bootstrap hybrid UI
- Responsive for mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Material UI v5, React Bootstrap v2 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Routing | React Router v6 |
| Charts | Recharts |
| HTTP | Axios |

---

## 📁 Project Structure

```
microgive/
├── backend/
│   ├── models/
│   │   ├── User.js          # Student & CareHome user model
│   │   ├── Campaign.js      # Fundraising campaigns
│   │   ├── Donation.js      # Donation records
│   │   └── WishlistItem.js  # Care home wishlists
│   ├── routes/
│   │   ├── auth.js          # Login, register, profile
│   │   ├── students.js      # Student leaderboard, profile
│   │   ├── carehomes.js     # Browse care homes
│   │   ├── campaigns.js     # CRUD campaigns
│   │   ├── donations.js     # Make & view donations
│   │   ├── wishlist.js      # Wishlist CRUD
│   │   └── admin.js         # Admin management
│   ├── middleware/
│   │   └── auth.js          # JWT + role protection
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js   # Auth state + API client
        ├── components/
        │   └── common/
        │       └── DashboardLayout.js
        ├── pages/
        │   ├── HomePage.js
        │   ├── auth/
        │   │   ├── StudentLogin.js
        │   │   ├── StudentRegister.js
        │   │   ├── CareHomeLogin.js
        │   │   └── CareHomeRegister.js
        │   ├── student/
        │   │   ├── StudentDashboard.js
        │   │   ├── StudentCareHomes.js
        │   │   ├── StudentCareHomeDetail.js
        │   │   ├── StudentDonate.js
        │   │   ├── StudentHistory.js
        │   │   ├── StudentLeaderboard.js
        │   │   ├── StudentWishlist.js
        │   │   └── StudentProfile.js
        │   └── carehome/
        │       ├── CareHomeDashboard.js
        │       ├── CareHomeCampaigns.js
        │       ├── CareHomeWishlist.js
        │       ├── CareHomeDonations.js
        │       └── CareHomeProfile.js
        ├── App.js
        └── index.js
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

### 3. Environment Variables (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/microgive
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:3000
```

### 4. Create Admin User (optional)

```js
// In MongoDB shell or Compass:
db.users.insertOne({
  name: "Admin",
  email: "admin@microgive.com",
  password: "$2a$10$...", // bcrypt hash of your password
  role: "admin",
  isActive: true
})
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register student or care home |
| POST | /api/auth/login | Login (with role verification) |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/donations | Make a donation |
| GET | /api/donations/my | Student's donation history |
| GET | /api/donations/received | Care home's received donations |
| GET | /api/donations/leaderboard | Student leaderboard |
| GET | /api/donations/stats | Platform statistics |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/campaigns | List all campaigns |
| POST | /api/campaigns | Create campaign (care home) |
| PUT | /api/campaigns/:id | Update campaign |
| DELETE | /api/campaigns/:id | Delete campaign |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/wishlist | List wishlist items |
| POST | /api/wishlist | Add item (care home) |
| PUT | /api/wishlist/:id/fulfill | Fulfill item (student) |
| DELETE | /api/wishlist/:id | Remove item |

---

## 🎨 UI Design

- **Student portal**: Purple/indigo theme (`#6C63FF`)
- **Care home portal**: Pink/rose theme (`#FF6584`)
- Material UI v5 components with custom theming
- React Bootstrap for navbar and grid layouts
- Custom gradient cards and hero sections
- Responsive sidebar navigation

---

## 🏆 Gamification

| Badge | Requirement |
|-------|------------|
| 🌟 First Gift | Make your first donation |
| 💚 Regular Giver | 5+ donations |
| 🦸 Super Giver | 20+ donations |
| 🥉 Bronze Donor | £10+ total donated |
| 🥈 Silver Donor | £50+ total donated |
| 🥇 Gold Donor | £100+ total donated |

Points: 10 points per £1 donated

---

## 📝 License

MIT
"# microgive-project" 
