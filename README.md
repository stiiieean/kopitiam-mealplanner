# Kopitiam — Meal Planner & Food Community

A full-stack web application for discovering food stores, planning meals, and sharing food experiences, built with Express.js, MongoDB, and EJS templates using MVC architecture.

## Features

- **Store Listings & Reviews**: Browse hawker stalls and restaurants, read and submit reviews with star ratings
- **Meal Planner**: Plan weekly meals by adding stores to specific meal slots
- **Food Hunt**: Complete location-based food challenges to discover new places
- **Challenges**: Create and participate in community food challenges
- **Forum**: Share food experiences, tag locations, attach photos, and reply to threads
- **User Accounts**: Register, log in, manage a personal profile
- **Admin Panel**: Manage users and content via an admin dashboard

## Tech Stack

- **Backend**: Node.js / Express.js (MVC architecture)
- **Database**: MongoDB with Mongoose ODM
- **Templates**: EJS
- **Authentication**: express-session + bcrypt
- **File Uploads**: multer
- **Maps**: Leaflet.js + OpenStreetMap / Nominatim (no API key required)
- **Environment**: dotenv (config.env)

## Project Structure

```
kopitiam-mealplanner/
├── controllers/          # Business logic
│   ├── authController.js
│   ├── forumController.js
│   ├── ratingsController.js
│   ├── storeController.js
│   ├── ReviewController.js
│   ├── profileController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js           # requireLogin / requireAdmin
│   └── upload.js         # multer config for photo uploads
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Store.js
│   ├── Review.js
│   ├── Forum.js
│   ├── Challenge.js
│   └── FoodHunt.js
├── routes/               # Express routers
│   ├── auth.js
│   ├── forum.js
│   ├── ratings.js
│   ├── challenges.js
│   ├── foodHunt.js
│   ├── profile.js
│   └── admin.js
├── views/                # EJS templates
│   ├── home.ejs
│   ├── forums.ejs
│   ├── forum-post.ejs
│   ├── forum-form.ejs
│   ├── forum-edit.ejs
│   └── ...
├── public/
│   └── uploads/forum/    # Uploaded forum photos
├── server.js
├── config.env
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kopitiam-mealplanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy or create `config.env` with your MongoDB connection string and session secret:
     ```
     DB=mongodb+srv://<user>:<password>@cluster.mongodb.net/kopitiam
     SECRET=your_session_secret
     ```

4. **Start the application**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:8000
   ```

## Use of AI Assistance

This project was developed by a team of students, each independently hand-coding their own features and modules. The codebase is the result of merging those individual contributions together.

AI assistance (Claude) was used in a limited and targeted way — primarily to help scaffold and refine certain UI components. Specifically, AI helped generate boilerplate HTML/CSS for page layouts (such as form cards, navigation bars, and responsive containers) so the team could focus on the core application logic. The interactive elements — including the Leaflet map integration, geolocation handling, and Nominatim address search on the forum pages — were also drafted with AI support to produce clean, working starting code that the team then reviewed and integrated.

All business logic, database schemas, routing, authentication, and application architecture were written by the team.

## License

This project is licensed under the ISC License.
