# App CRUD Features (Kopitiam Meal Planner)

This document explains the **6 CRUD feature sets** in the project and how each one works end-to-end using the course concepts (Express routing, controllers, EJS view rendering, MongoDB via Mongoose, sessions/auth middleware).

## Concepts ↔ Notes topics mapping (with note file links)

Use this section to justify which “lecture concepts” appear in the codebase and where.

### Week 1 — Building Static Webpages with HTML

Notes: `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 1\[IS113] Week 1 - Building Static Webpages with HTML.pdf`

- **HTML forms + inputs**: EJS ultimately renders HTML forms (`<form>`, `<input>`, `<textarea>`, `<select>`) in templates like `views/add-review.ejs`, `views/forum-form.ejs`, `views/plan-meal.ejs`.
- **Hyperlinks / navigation**: anchors like `<a href="/ratings">...</a>` inside EJS.

### Week 2 & 3 — JavaScript (Part 1 & Part 2)

Notes:
- `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 2\[IS113] Week 2 - JavaScript (Part 1).pdf`
- `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 3\[IS113] Week 3 - JavaScript (Part 2).pdf`

- **Client-side JS in views**: dynamic behavior inside EJS templates (map search/pinning, photo previews, dynamic list inputs).
- **Arrays/objects + loops**: used heavily in EJS and server-side code (e.g., building `dayPlan`, mapping stores for rendering).
- **DOM manipulation**: add/remove food input rows in `views/add-store.ejs` and `views/edit-store.ejs`.

### Week 4 — Node.js with Express Web Framework (Part 1)

Notes: `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 4\[IS113] Week 4 - Node.js with Express Web Framework (Part 1).pdf`

- **Express setup + middleware**: `server.use(express.urlencoded(...))`, `server.use(express.static(...))`
- **Routing**:
  - Basic routing: `server.get(...)`
  - Express Router: `const router = express.Router()` in `routes/*.js`
- **GET vs POST form handling**: forms post to routes like `/ratings/new`, `/meal-planner/:date`.
- **Validation**: server-side validation patterns in controllers (if invalid → `res.render(...)` again with `error`).

### Week 5 — Node.js with Express Web Framework (Part 2) (EJS + view rendering)

Notes: `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 5\[IS113] Week 5 - Node.js with Express Web Framework (Part 2).pdf`

- **EJS syntax**:
  - Output escaping: `<%= value %>`
  - Logic blocks: `<% if (...) { %> ... <% } %>`
  - Iteration: `<% arr.forEach(...) %>`
- **Express view rendering**: `res.render('viewName', { data })` throughout controllers/routes.
- **Form validation with EJS**: pass an `error` string into template and conditionally display it.

### Week 9 — Node.js File System & Modularization

Notes: `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 9\[IS113] Week 9 - Node.js File System And Modularization-v2.pdf`

- **Modularization (`require`/`module.exports`)**:
  - Routes: `module.exports = router`
  - Controllers: `exports.someHandler = ...`
  - Models: exported functions like `Store.createStore`, `Challenge.updateById`
- **(Not heavily used) File system**:
  - The project does not use Node’s `fs` directly for CRUD.
  - But **uploads** write files to disk via `multer` (see “Topics not taught”).

### Week 10 — Database Interaction with MongoDB

Notes: `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 10\[IS113] Week 10- Database Interaction with MongoDB-v3-shar.pptx` *(PPTX couldn’t be opened here, but the code clearly uses MongoDB concepts.)*

- **Mongoose models/schemas**: `models/*.js`
- **CRUD with MongoDB**:
  - Create: `Model.create(...)`, `new Review(...).save()`
  - Read: `find`, `findById`
  - Update: `findByIdAndUpdate`, `findByIdAndUpdate(..., { new: true })`
  - Delete: `findByIdAndDelete`, `deleteMany`
- **References + population**: `populate('reviews')`, nested populate of `userid` in `models/Store.js` *(extra beyond basic CRUD)*

### Week 11 — Sessions, Authentication & Authorization

Notes: `c:\Users\komin\Desktop\SMU\Y1 Term 2 (2025)\IS113 - Web Application\Week 11\[IS113] Week 11 - Sessions, Authentication & Authorization-v3.pdf`

- **Sessions with `express-session`**: configured in `server.js`, used as `req.session.user`.
- **Authorization via middleware**: `requireLogin` and `requireAdmin`.
- **Password hashing**: login/register uses `bcrypt` in `controllers/authController.js`.

---

## Cross-feature “glue” snippets (how everything links)

### Express app setup: middleware + sessions + routers

Snippet (from `server.js`):

```js
server.set('view engine', 'ejs'); // Tell Express to render views using EJS templates in /views
server.use(express.urlencoded({ extended: true })); // Parse HTML form POST bodies into req.body (supports nested objects when extended:true)
server.use(express.static('public')); // Serve static files (CSS, client JS, uploaded images) from /public

server.use(session({ // Add session support (server-side state across requests)
  secret: process.env.SECRET, // Secret used to sign the session cookie (prevents tampering)
  resave: false, // Don't save session back to store if nothing changed
  saveUninitialized: false, // Don't create/store an empty session until something is stored in it (e.g., after login)
  store: MongoStore.create({ mongoUrl: process.env.DB }), // Persist sessions in MongoDB so sessions survive server restarts
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Session cookie expiry: 1 day (milliseconds)
}));

server.use('/meal-planner', mealPlannerRouter); // All routes in routes/mealPlanner.js start with /meal-planner
server.use('/ratings', ratingsRouter); // All routes in routes/ratings.js start with /ratings
server.use('/forum', forumRouter); // All routes in routes/forum.js start with /forum
```

### Auth middleware (authorization pattern)

Snippet (from `middleware/auth.js`):

```js
exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) return next(); // If logged in (session user exists), allow the request to continue
  res.redirect('/login'); // Otherwise redirect to login page
};

exports.requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next(); // Allow only if logged-in user has role "admin"
  res.status(403).redirect('/home'); // Otherwise block (403) and send user back to /home
};
```

## How this project is structured (MVC-ish)

- **Routes (Express Router)**: files in `routes/` define URL paths + HTTP methods and forward requests to controllers or inline handlers.
- **Controllers**: files in `controllers/` contain the request-handling logic (validation, permissions, calling models, deciding whether to `res.render()` or `res.redirect()`).
- **Models / Database**: files in `models/` define Mongoose schemas + exported helper functions that perform MongoDB operations.
- **Views (EJS templates)**: files in `views/` are rendered by controllers using `res.render(viewName, data)`. They generate HTML, forms, and sometimes include client-side JavaScript.
- **Sessions + auth middleware**:
  - Session is configured in `server.js` using `express-session` and `connect-mongo`.
  - `middleware/auth.js` provides:
    - `requireLogin`: blocks access unless `req.session.user` exists.
    - `requireAdmin`: blocks access unless logged in user role is `admin`.

### Common request lifecycle (CRUD pattern)

1. **Browser sends request** (GET to view a page or POST to submit a form).
2. **Route matches** (`router.get(...)` / `router.post(...)`).
3. **Middleware runs** (e.g., `requireLogin`, `requireAdmin`, `multer` upload parsing).
4. **Controller runs**:
   - Validates input (`req.body`, `req.params`, `req.query`).
   - Reads/writes MongoDB via a model.
   - Responds with either:
     - `res.render('some-view', { ...data })` to show an HTML page, or
     - `res.redirect('/somewhere')` after a successful create/update/delete.
5. **EJS renders dynamic HTML** using the passed variables and control flow (`<% %>`, `<%= %>`).

> Note: This project mostly uses **POST routes** for Update/Delete (instead of PUT/DELETE) because HTML forms natively support only GET and POST.

---

## CRUD Set 1 — Meal Planner (Calendar day plan)

### What is being stored

- A user’s meal plan is stored inside the **User document** as `calendar: Map`.
- Key: `YYYY-MM-DD` string (e.g., `2026-04-02`).
- Value: an object with up to 4 slots: `breakfast`, `lunch`, `dinner`, `supper`, each containing `mealName`, `storeName`, `notes`, `budget`.

Relevant files:
- `routes/mealPlanner.js`
- `models/User.js`
- Views: `views/meal-planner.ejs`, `views/plan-meal.ejs`

### Notes concepts used

- **Week 4**: Express Router + GET/POST form handling + redirects
- **Week 5**: EJS loops/conditions render the calendar and pre-fill forms
- **Week 10**: Mongoose read/write on the `User` model
- **Week 11**: `requireLogin` blocks unauthenticated users

### Routes (Read/Create/Update/Delete)

- **Read (list month)**: `GET /meal-planner`
  - Loads the logged-in user from DB.
  - Computes the month grid + total planned spend for the displayed month.
  - Renders `meal-planner.ejs`.
- **Read (single day form)**: `GET /meal-planner/:date`
  - Loads the user and all `Store` records (for autocomplete).
  - Finds existing plan for that date (if any).
  - Renders `plan-meal.ejs`.
- **Create/Update (upsert day plan)**: `POST /meal-planner/:date`
  - Reads nested form inputs like `breakfast[mealName]`, `lunch[budget]`, etc.
  - Builds a `dayPlan` object from non-empty slots.
  - If at least one slot is filled: `user.calendar.set(dateParam, dayPlan)`
  - If all slots are empty: `user.calendar.delete(dateParam)`
  - Saves user and redirects back to the calendar.
- **Delete (clear day)**: `POST /meal-planner/:date/delete`
  - Deletes that date’s entry from `user.calendar` and saves.

### Controller/route logic highlights (JavaScript logic)

- **Authentication**: `router.use(requireLogin)` blocks all meal-planner routes unless logged in.
- **Budget summary**: loops through `user.calendar.entries()` and sums `budget` values only for the month/year being displayed.
- **Auto-create Store**: `ensureStoreExists(storeName)` checks the `stores` collection for a name match (case-insensitive). If not found, it creates a new store with a default location and budget.
  - This links Meal Planner to the Ratings Board: typing a new store name in the planner can create it in `Store`.

### Important code snippets (route + DB write)

Snippet (from `routes/mealPlanner.js`) showing “upsert or delete” logic:

```js
for (const slot of SLOTS) {
  const slotData = req.body[slot]; // Read the submitted form data for this slot (e.g., req.body.breakfast)
  if (slotData && slotData.mealName && slotData.mealName.trim() !== '') { // Only save a slot if it has a non-empty meal name
    await ensureStoreExists(slotData.storeName); // If user typed a new store name, create it in Store collection (for Ratings Board)
    dayPlan[slot] = { // Save cleaned values into the dayPlan object under this slot key
      mealName: slotData.mealName.trim(), // Remove extra spaces from meal name
      storeName: slotData.storeName ? slotData.storeName.trim() : '', // Optional: trim store name, default to empty string
      notes: slotData.notes ? slotData.notes.trim() : '', // Optional: trim notes, default to empty string
      budget: slotData.budget ? parseFloat(slotData.budget) : 0 // Convert budget from string to number, default to 0
    };
  } // If meal name is empty, we skip storing this slot
}

if (Object.keys(dayPlan).length > 0) {
  user.calendar.set(dateParam, dayPlan); // Create/Update: store the dayPlan for this date (key is YYYY-MM-DD)
} else {
  user.calendar.delete(dateParam); // Delete-by-empty: if all slots were empty, remove this date from the calendar map
}

await user.save(); // Persist the updated calendar Map back into MongoDB (User document)
res.redirect('/meal-planner'); // Redirect to the month calendar page so refresh doesn't resubmit the form
```

### How the EJS views work with the routes

- `views/meal-planner.ejs`:
  - Receives: `calendar`, `month`, `year`, `firstDay`, `daysInMonth`, `totalBudget`.
  - Builds date keys using padded month/day (`YYYY-MM-DD`) to match `User.calendar` keys.
  - Shows a summary for each day if it has stored slots.
  - The “Add/Edit” link goes to `GET /meal-planner/<dateString>`.

- `views/plan-meal.ejs`:
  - Receives: `date`, `existingPlan`, `stores`.
  - Uses `<datalist>` to provide autocomplete for store names from the DB.
  - The form posts to `POST /meal-planner/<date>`.
  - The “Clear This Day” button submits a second hidden form to `POST /meal-planner/<date>/delete`.

### Important EJS snippets (nested form fields → `req.body`)

Snippet (from `views/plan-meal.ejs`):

```ejs
<form action="/meal-planner/<%= date %>" method="POST">
  <!-- POST to /meal-planner/<date> to create/update that day's plan -->
  <input
    type="text"
    name="<%= slot.key %>[mealName]"  <!-- makes req.body.breakfast.mealName (or lunch/dinner/supper) -->
    value="<%= saved ? saved.mealName : '' %>"> <!-- pre-fill if there is existingPlan -->

  <input
    type="text"
    name="<%= slot.key %>[storeName]" <!-- makes req.body.breakfast.storeName -->
    value="<%= saved && saved.storeName ? saved.storeName : '' %>">

  <input
    type="number"
    name="<%= slot.key %>[budget]" <!-- makes req.body.breakfast.budget (string), controller parsesFloat -->
    value="<%= saved && saved.budget ? saved.budget : '' %>">

  <textarea
    name="<%= slot.key %>[notes]"><%= saved && saved.notes ? saved.notes : '' %></textarea> <!-- makes req.body.breakfast.notes -->
</form>
```

How it links:
- With `express.urlencoded({ extended: true })`, Express parses these into nested objects like `req.body.breakfast.mealName`.

---

## CRUD Set 2 — Forum (Posts)

### What is being stored

- Forum posts are stored in `Forum` documents (`models/Forum.js`):
  - Fields: `title`, `content`, `userId`, optional `photo`, optional `location` (`address`, `lat`, `lng`), `likes[]`, and `replies[]`.

Relevant files:
- `routes/forum.js`
- `controllers/forumController.js`
- `models/Forum.js`
- Upload middleware: `middleware/upload.js` (multer)
- Views: `views/forums.ejs`, `views/forum-form.ejs`, `views/forum-post.ejs`, `views/forum-edit.ejs`

### Notes concepts used

- **Week 4**: Express Router + middleware chain (router-level `requireLogin`)
- **Week 5**: EJS conditionals decide which buttons/links show up
- **Week 10**: Mongoose CRUD for posts + update operators
- **Week 11**: authorization checks (owner/admin)

### Extra concepts (not directly taught in the notes)

- **File upload parsing**: `multer` handles `multipart/form-data` and populates `req.file`.
- **MongoDB update operators**: `$addToSet` and `$push` for likes/replies.
- **Leaflet + Nominatim**: map + geocoding on the client (browser) side.

### Routes (Read/Create/Update/Delete)

- **Read (list posts)**: `GET /forum` → `forumController.listPosts`
  - Fetches posts sorted by newest and renders `forums.ejs`.
- **Create (show form)**: `GET /forum/new` → `forumController.showCreate`
  - Renders `forum-form.ejs`.
- **Create (submit)**: `POST /forum/new` (+ `upload.single('photo')`) → `forumController.createPost`
  - Reads text fields from `req.body`, optional upload from `req.file`.
  - Creates the MongoDB document and redirects to `/forum`.
- **Read (single post)**: `GET /forum/:id` → `forumController.getPost`
  - Fetches a post (populates usernames) and renders `forum-post.ejs`.
- **Update (show edit form)**: `GET /forum/:id/edit` → `forumController.showEdit`
  - Only owner/admin can access. Renders `forum-edit.ejs`.
- **Update (submit edit)**: `POST /forum/:id/edit` (+ `upload.single('photo')`) → `forumController.updatePost`
  - Updates title/content/location; only overwrites `photo` if a new file was uploaded.
  - Redirects back to the post page.
- **Delete**: `POST /forum/:id/delete` → `forumController.deletePost`
  - Only owner/admin can delete.
  - Deletes the document and redirects to `/forum`.

> Extra (not counted as the CRUD set): likes and replies are additional “update” actions:
> - `POST /forum/:id/like`
> - `POST /forum/:id/reply`

### Controller logic highlights (JavaScript logic)

- **Authentication**: `router.use(requireLogin)` blocks all forum routes unless logged in.
- **Authorization checks** (edit/delete):
  - Owner if `post.userId._id.toString() === req.session.user._id.toString()`
  - Admin if `req.session.user.role === 'admin'`
- **File uploads**:
  - EJS forms set `enctype="multipart/form-data"`.
  - `multer` saves images into `public/uploads/forum/` and sets `req.file.filename`.
- **Likes**:
  - Model uses `$addToSet` so the same user can’t like twice.
  - It also contains a compatibility check for older documents where `likes` may have been a number.

### Important code snippets (router → controller → model)

Snippet (from `routes/forum.js`) showing middleware + controllers:

```js
router.use(requireLogin); // Middleware: all /forum routes require the user to be logged in

router.get('/', forumController.listPosts); // READ (list): show all posts
router.get('/new', forumController.showCreate); // CREATE (form): show "new post" page
router.post('/new', upload.single('photo'), forumController.createPost); // CREATE (submit): parse optional photo, then create post

router.get('/:id/edit', forumController.showEdit); // UPDATE (form): show edit page for a post id
router.post('/:id/edit', upload.single('photo'), forumController.updatePost); // UPDATE (submit): parse optional new photo, then update
router.post('/:id/delete', forumController.deletePost); // DELETE: delete the post
```

Snippet (from `controllers/forumController.js`) showing create:

```js
await Forum.createPost({
  title: req.body.title, // Read the title field from the submitted form body
  content: req.body.content, // Read the content field from the submitted form body
  userId: req.session.user._id, // Link the post to the logged-in user (from the session)
  photo: req.file ? req.file.filename : null, // If multer uploaded a file, store its filename; else store null
  location: { // Store optional location details (written into hidden fields by client-side JS)
    address: req.body.address || '', // Human-readable address string (may be empty)
    lat: req.body.lat ? parseFloat(req.body.lat) : null, // Convert latitude string to number, or null if missing
    lng: req.body.lng ? parseFloat(req.body.lng) : null // Convert longitude string to number, or null if missing
  }
});
res.redirect('/forum'); // Redirect back to the list page after creating (PRG pattern)
```

Snippet (from `models/Forum.js`) showing likes/replies:

```js
exports.addLike = async function(id, userId) {
  return Forum.findByIdAndUpdate(
    id, // Which post to update
    { $addToSet: { likes: userId } }, // MongoDB operator: add userId to likes[] only if not already present
    { new: true } // Return the updated document (not used by controller here, but useful if needed)
  );
};

exports.addReply = function(id, userId, content, photo) {
  return Forum.findByIdAndUpdate(
    id, // Which post to update
    { $push: { replies: { userId, content, photo: photo || null } } }, // Append a reply object into replies[]
    { new: true } // Return the updated post with the new reply included
  );
};
```

### How the EJS views work with the controllers

- `views/forums.ejs` (list):
  - Displays all posts.
  - “New Post” is a link to `GET /forum/new`.
  - Each post has a “Like” form posting to `POST /forum/:id/like` with a hidden `redirectTo` field (so controller can redirect to the correct page after liking).
  - Shows “Edit” link only if owner/admin.

- `views/forum-form.ejs` (create):
  - Submits to `POST /forum/new`.
  - Client-side JS:
    - Photo preview via `FileReader`.
    - Leaflet map: geolocation, address search (Nominatim), and click-to-pin.
    - Writes the chosen address/lat/lng into hidden form fields so Express can read them via `req.body`.

- `views/forum-post.ejs` (read single):
  - Shows the post, replies, and a reply form.
  - Client-side JS:
    - Optional Leaflet map preview if lat/lng exists.
    - Reply photo preview via `FileReader`.

- `views/forum-edit.ejs` (update):
  - Pre-fills existing fields.
  - Client-side JS:
    - Similar Leaflet logic to update the location.
    - Photo preview for replacement.

### Important EJS snippets (multipart form + hidden fields)

Snippet (from `views/forum-form.ejs`):

```ejs
<form action="/forum/new" method="POST" enctype="multipart/form-data">
  <input type="text" id="title" name="title" required>
  <textarea id="content" name="content" required></textarea>

  <input type="file" id="photo" name="photo" accept="image/*">

  <input type="hidden" id="address" name="address" value="">
  <input type="hidden" id="lat" name="lat" value="">
  <input type="hidden" id="lng" name="lng" value="">
</form>
```

---

## CRUD Set 3 — Ratings Board (Stores)

### What is being stored

- Stores are stored in `stores` collection (`models/Store.js`):
  - `name`, `location`, `budget`, optional `lat/lng`, `tags[]`, `food[]`, `reviews[]` (ObjectIds referencing Review).

Relevant files:
- `routes/ratings.js`
- `controllers/storeController.js`
- `controllers/ratingsController.js` (read/list logic)
- `models/Store.js`
- Views: `views/ratingboard.ejs`, `views/add-store.ejs`, `views/edit-store.ejs`, `views/store.ejs`

### Notes concepts used

- **Week 4**: routing + GET querystring filtering + POST deletes
- **Week 5**: EJS loops for cards/tags and conditional rendering for admins
- **Week 10**: CRUD on `Store` documents, and Mongoose `populate`
- **Week 11**: `requireAdmin` protects update/delete routes

### Extra concepts (not directly taught)

- **Leaflet + Nominatim** (client-side geocoding + map pinning)
- **Mongoose `populate`** (joining referenced docs for rendering)

### Routes (Read/Create/Update/Delete)

- **Read (list)**: `GET /ratings` → `ratingsController.getAllStores`
  - Optional filter: `?maxBudget=10` creates a MongoDB query `{ budget: { $lte: maxBudget } }`.
  - Renders `ratingboard.ejs`.
- **Read (single store)**: `GET /ratings/:storeId` → `ratingsController.getStoreById`
  - Loads store, populates reviews (and review user names), renders `store.ejs`.
- **Create (show form)**: `GET /ratings/new` → `storeController.getNewStore`
  - Renders `add-store.ejs`.
- **Create (submit)**: `POST /ratings/new` → `storeController.postNewStore`
  - Validates required fields.
  - Normalizes `tags` and `food` into arrays (because checkbox/multiple inputs can arrive as string or array).
  - Creates store and redirects to `/ratings`.
- **Update (show form)**: `GET /ratings/:storeId/edit` → `storeController.getEditStore` (**admin only**)
  - Renders `edit-store.ejs`.
- **Update (submit)**: `POST /ratings/:storeId/edit` → `storeController.postEditStore` (**admin only**)
  - Validates, normalizes arrays, updates store and redirects to `/ratings/:storeId`.
- **Delete**: `POST /ratings/:storeId/delete` → `storeController.deleteStore` (**admin only**)
  - Deletes all `Review` docs for that store first, then deletes the store.

### How EJS + client-side JS supports the CRUD

- `views/ratingboard.ejs`:
  - Displays store cards.
  - Filter form is a GET form to `/ratings` (querystring-based filtering).
  - Shows delete buttons only to admins.

- `views/add-store.ejs` and `views/edit-store.ejs`:
  - Uses a Leaflet map and Nominatim search to allow location pinning.
  - Client-side JS writes the selected `location`, `lat`, and `lng` to hidden inputs, which the controller reads from `req.body`.
  - Dynamic “menu items” UI:
    - “Add Item” adds a new `<input name="food">`.
    - “Remove” removes a row (but keeps at least one input).
  - Checkboxes `name="tags"` submit either a single string or an array; controller converts it to an array.

- `views/store.ejs`:
  - Displays store details and reviews.
  - If store has coordinates, shows a Leaflet preview map; otherwise provides a Google Maps search link.
  - Shows “Edit Store / Delete Store” only to admins.

### Important code snippets (filtering + populate)

Snippet (from `controllers/ratingsController.js`) showing query filter + render:

```js
const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : null; // Read ?maxBudget=10 from URL, convert to Number
const filter = maxBudget ? { budget: { $lte: maxBudget } } : {}; // If maxBudget given, filter stores with budget <= maxBudget
const stores = await Store.retrieveAll(filter); // DB READ: fetch matching stores (model populates reviews)

res.render('ratingboard', { // Render the EJS list page
  stores, // Data to loop over in EJS
  maxBudget, // Used to keep dropdown selection sticky
  sessionUser: req.session.user || null // Used for conditional UI (e.g., admin delete button)
});
```

Snippet (from `models/Store.js`) showing populate:

```js
exports.retrieveAll = function(filter) {
  return StoreModel.find(filter) // DB READ: find all stores matching filter
    .populate('reviews'); // Join Review documents referenced by Store.reviews[] so EJS can show review content
};

exports.retrieveById = function(id) {
  return StoreModel.findById(id) // DB READ: find one store by its Mongo _id
    .populate({ // Populate Store.reviews[] with Review docs, and populate each Review.userid with the user's username
      path: 'reviews', // First level: store.reviews
      populate: { path: 'userid', select: 'username' } // Second level: review.userid (only bring back username field)
    });
};
```

### Important EJS snippets (GET filter + admin-only actions)

Snippet (from `views/ratingboard.ejs`) showing GET filter:

```ejs
<form method="GET" action="/ratings" class="filter-bar">
  <select name="maxBudget" id="maxBudget">
    <option value="10" <%= maxBudget == 10 ? "selected" : "" %>>$10 & under</option>
  </select>
  <button type="submit">Filter</button>
</form>
```

Snippet (from `views/store.ejs`) showing admin-only edit/delete:

```ejs
<% if (sessionUser && sessionUser.role === 'admin') { %>
  <a href="/ratings/<%= store._id %>/edit">Edit Store</a>
  <form action="/ratings/<%= store._id %>/delete" method="POST">
    <button type="submit">Delete Store</button>
  </form>
<% } %>
```

---

## CRUD Set 4 — Reviews (for a Store)

### What is being stored

- Reviews are stored in `reviews` collection (`models/Review.js`):
  - `storeId` (required), optional `userid` (linked to session user), `title`, `body`, `rating`, `timestamp`.
- A store also keeps a list of review IDs in `Store.reviews[]`.

Relevant files:
- Create routes live in `routes/ratings.js` (nested under a store).
- Update/delete routes live in `routes/reviews.js`.
- Controller: `controllers/ReviewController.js`
- Model: `models/Review.js`, `models/Store.js`
- Views: `views/add-review.ejs`, `views/edit-review.ejs`, and review display inside `views/store.ejs`

### Notes concepts used

- **Week 4**: GET form + POST submit + server-side validation → re-render with error
- **Week 5**: EJS renders error messages and pre-fills edit fields
- **Week 10**: CRUD on `Review` documents + linking review IDs into a `Store`
- **Week 11**: authorization checks (owner/admin)

### Routes (Read/Create/Update/Delete)

- **Read (list as part of store page)**: `GET /ratings/:storeId`
  - Store page renders populated `store.reviews`.
- **Create (show form)**: `GET /ratings/:storeId/review/new`
  - Loads store to get the store name and renders `add-review.ejs`.
- **Create (submit)**: `POST /ratings/:storeId/review/new`
  - Validates title/body/rating.
  - Saves a new `Review`.
  - Pushes the review’s ID into the store’s `reviews[]` and saves the store.
  - Redirects back to the store page.
- **Update (show form)**: `GET /review/:reviewId/edit`
  - Only owner/admin can edit.
  - Renders `edit-review.ejs` with the review doc.
- **Update (submit)**: `POST /review/:reviewId/edit`
  - Validates input, updates the review, redirects to the store page.
- **Delete**: `POST /review/:reviewId/delete`
  - Only owner/admin can delete.
  - Pulls reviewId out of `Store.reviews[]`, deletes the review doc, redirects to the store page.

### How the EJS views connect to the controller

- `views/add-review.ejs`:
  - Posts to `/ratings/<storeId>/review/new`.
  - Includes a hidden `storeName` so the controller can re-render the page with the same store name if validation fails.

- `views/edit-review.ejs`:
  - Posts to `/review/<reviewId>/edit`.
  - Pre-fills existing values and shows an error block if controller sends validation error back.

- Reviews appear in `views/store.ejs`:
  - Shows “Edit/Delete” actions only if the logged-in user is the owner of that review or is an admin.

### Important code snippets (Review ↔ Store linking)

Snippet (from `controllers/ReviewController.js`) showing create + attach:

```js
const newReview = new Review({
  storeId: storeId, // Link this review to a store
  userid: req.session.user ? req.session.user._id : null, // Link to logged-in user (or null if session missing)
  title: title.trim(), // Clean up input
  body: body.trim(), // Clean up input
  rating: rating, // Store numeric rating (1–5)
  timestamp: Date.now(), // When review was created
});

const savedReview = await newReview.save(); // DB CREATE: insert review into reviews collection

const store = await Store.retrieveById(storeId); // DB READ: fetch the store document so we can modify it
store.reviews.push(savedReview._id); // Add the review's ObjectId into store.reviews[] array
await store.save(); // DB UPDATE: persist the modified store document

res.redirect('/ratings/' + storeId); // Redirect back to the store page so user can see their review
```

Snippet (from `views/store.ejs`) showing owner/admin gating:

```ejs
<% const isOwner = sessionUser && review.userid && review.userid.toString() === sessionUser._id.toString(); %>
<% const isAdmin = sessionUser && sessionUser.role === 'admin'; %>
<% if (isOwner || isAdmin) { %>
  <a href="/review/<%= review._id %>/edit" class="edit-btn">Edit</a>
  <form action="/review/<%= review._id %>/delete" method="POST" style="display:inline;">
    <button type="submit" class="delete-btn">Delete</button>
  </form>
<% } %>
```

---

## CRUD Set 5 — Food Hunt (Saved recommendation runs)

### What is being stored

- Each “hunt” is saved as a `FoodHunt` document (`models/FoodHunt.js`) containing:
  - `userId`, `requirements` (comma-joined tags), `totalBudget`, `numMeals`, `results[]`, `createdAt`.
- `results[]` stores the computed top combinations (denormalized for fast display).

Relevant files:
- `routes/foodHunt.js` (route contains the algorithm + CRUD handlers)
- `models/FoodHunt.js`
- `models/Store.js` (stores are the input data set)
- Views: `views/food-hunt-list.ejs`, `views/food-hunt-form.ejs`, `views/food-hunt-result.ejs`

### Notes concepts used

- **Week 4**: routes + validation + redirects
- **Week 5**: EJS template reused for “new” and “edit”
- **Week 10**: saving and updating hunts in MongoDB
- **Week 11**: session user ownership checks (only view/edit/delete your own hunts)

### Extra concepts (not directly taught)

- **Recommendation algorithm inside a route file** (combination generation + scoring + sorting)
- **Denormalized results** stored inside `FoodHunt.results[]` for fast rendering

### Routes (Read/Create/Update/Delete)

- **Read (list hunts)**: `GET /food-hunt`
  - Fetches hunts for the logged-in user and renders `food-hunt-list.ejs`.
- **Create (show form)**: `GET /food-hunt/new`
  - Renders `food-hunt-form.ejs` with no existing hunt.
- **Create (submit + calculate)**: `POST /food-hunt/new`
  - Validates inputs (tags, budget, numMeals).
  - Fetches all stores from DB.
  - Runs the recommendation algorithm to produce `results`.
  - Saves a new `FoodHunt` doc and redirects to `GET /food-hunt/:id`.
- **Read (single hunt result)**: `GET /food-hunt/:id`
  - Ensures the hunt belongs to the session user.
  - Renders `food-hunt-result.ejs`.
- **Update (show edit form)**: `GET /food-hunt/:id/edit`
  - Loads hunt (owner check), renders `food-hunt-form.ejs` pre-filled.
- **Update (submit + recalculate)**: `POST /food-hunt/:id/edit`
  - Validates again, recomputes results from current `Store` data, updates the hunt doc.
- **Delete**: `POST /food-hunt/:id/delete`
  - Owner check, deletes doc, redirects back to the list.

### JavaScript logic (algorithm + validation)

- The route file includes:
  - `combinationsWithRep(arr, k)` to generate combinations of stores with repetition allowed.
  - `getTopRecommendations(stores, requirements, totalBudget, numMeals)`:
    - Creates keywords from selected tags.
    - Scores each store by keyword matches in name/tags/food.
    - Generates combinations of length `numMeals`.
    - Filters combos by total cost <= budget.
    - Sorts by total match score (desc) then total cost (asc).
    - Returns the top 3 combos formatted for saving into MongoDB.

### How EJS works for Food Hunt

- `views/food-hunt-form.ejs`:
  - The same template supports create and edit by switching form `action` based on whether `hunt` exists.
  - Tag selection uses repeated checkboxes named `tags` (submitted as string or array).

- `views/food-hunt-list.ejs`:
  - Shows all saved hunts.
  - Each card has “View Results”, “Edit”, and a delete POST form.

- `views/food-hunt-result.ejs`:
  - Displays summary + top combinations.
  - Provides links into Store pages (`/ratings/:storeId`) so users can view details/reviews of recommended stores.

### Important code snippets (ownership check + reused form action)

Snippet (from `routes/foodHunt.js`) showing ownership enforcement on read:

```js
const hunt = await FoodHunt.findById(req.params.id); // DB READ: fetch the hunt document by id from the URL
if (!hunt || hunt.userId.toString() !== req.session.user._id.toString()) { // If not found OR it belongs to someone else
  return res.redirect('/food-hunt'); // Block access by redirecting back to the list
}
res.render('food-hunt-result', { hunt }); // Render results page with the hunt data
```

Snippet (from `views/food-hunt-form.ejs`) showing create vs edit action:

```ejs
<form action="<%= hunt ? '/food-hunt/' + hunt._id + '/edit' : '/food-hunt/new' %>" method="POST">
  <input type="number" id="totalBudget" name="totalBudget" value="<%= hunt ? hunt.totalBudget : '' %>">
  <select id="numMeals" name="numMeals">
    <option value="3" <%= hunt && hunt.numMeals === 3 ? 'selected' : '' %>>3 meals</option>
  </select>
</form>
```

---

## CRUD Set 6 — Challenges (Admin-managed challenge list)

### What is being stored

- Challenges are stored in `challenges` collection (`models/Challenge.js`):
  - `title`, `description`, `completedBy[]` (userId + completedAt), `createdAt`.

Relevant files:
- `routes/challenges.js`
- `models/Challenge.js`
- Views: `views/challenges.ejs`, `views/challenge-form.ejs`

### Notes concepts used

- **Week 4**: CRUD route handlers + POST delete
- **Week 5**: EJS conditional rendering (admin-only buttons, completed badge)
- **Week 10**: CRUD on `Challenge` collection
- **Week 11**: authorization via `requireAdmin`

### Routes (Read/Create/Update/Delete)

- **Read (list)**: `GET /challenges`
  - Loads all challenges and renders `challenges.ejs`.
- **Create (show form)**: `GET /challenges/new` (**admin only**)
  - Renders `challenge-form.ejs` (blank).
- **Create (submit)**: `POST /challenges/new` (**admin only**)
  - Validates title/description, creates new challenge, redirects to `/challenges`.
- **Update (show form)**: `GET /challenges/:id/edit` (**admin only**)
  - Loads the challenge and renders `challenge-form.ejs` pre-filled.
- **Update (submit)**: `POST /challenges/:id/edit` (**admin only**)
  - Validates, updates challenge, redirects to `/challenges`.
- **Delete**: `POST /challenges/:id/delete` (**admin only**)
  - Deletes the challenge and redirects to `/challenges`.

> Extra (not counted as the CRUD set): user completion toggles are additional updates:
> - `POST /challenges/:id/complete`
> - `POST /challenges/:id/uncomplete`

### How EJS works for Challenges

- `views/challenges.ejs`:
  - Receives `challenges` and `sessionUser`.
  - For each challenge, it checks whether the current user exists in `challenge.completedBy`.
  - Shows:
    - “Mark Complete” / “Undo” buttons for normal users.
    - “New Challenge”, “Edit”, “Delete” actions for admins.

- `views/challenge-form.ejs`:
  - Reused for create and edit (switches the form `action` based on whether `challenge` exists).
  - Shows server-side validation errors passed in as `error`.

### Important code snippets (admin-only CRUD + user updates)

Snippet (from `routes/challenges.js`) showing admin-only create/delete:

```js
router.get('/new', requireAdmin, (req, res) => {
  res.render('challenge-form', { challenge: null, error: null }); // Render a blank form (create mode)
});

router.post('/:id/delete', requireAdmin, async (req, res) => {
  await Challenge.deleteById(req.params.id); // DB DELETE: remove the challenge document
  res.redirect('/challenges'); // Redirect back to the challenge list
});
```

Snippet (from `views/challenges.ejs`) showing complete/undo POST forms:

```ejs
<% if (!isDone) { %>
  <form action="/challenges/<%= challenge._id %>/complete" method="POST">
    <button type="submit" class="complete-btn">Mark Complete</button>
  </form>
<% } else { %>
  <form action="/challenges/<%= challenge._id %>/uncomplete" method="POST">
    <button type="submit" class="undo-btn">Undo</button>
  </form>
<% } %>
```

---

## Quick mapping (the 6 CRUD sets)

1. **Meal Planner (User.calendar)**: `routes/mealPlanner.js` + `views/meal-planner.ejs`, `views/plan-meal.ejs`
2. **Forum Posts**: `routes/forum.js` + `controllers/forumController.js` + forum EJS templates
3. **Stores (Ratings Board)**: `routes/ratings.js` + `controllers/storeController.js` + store EJS templates
4. **Reviews**: `controllers/ReviewController.js` + `routes/ratings.js`/`routes/reviews.js` + review EJS templates
5. **Food Hunts**: `routes/foodHunt.js` + food hunt EJS templates
6. **Challenges**: `routes/challenges.js` + challenge EJS templates

---

## Topics not taught (but used here) — what they are + where to find them

### Multer file uploads (`multipart/form-data`)

- **Where**: `middleware/upload.js`, applied in `routes/forum.js` as `upload.single('photo')`
- **Why it matters**: normal form parsing (`express.urlencoded`) can’t handle binary files; multer writes files to disk and exposes metadata as `req.file`.

Minimal snippet (from `middleware/upload.js`):

```js
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});
```

### Leaflet map + Nominatim (geocode/reverse-geocode in the browser)

- **Where**:
  - `views/forum-form.ejs` / `views/forum-edit.ejs` (tag post location)
  - `views/add-store.ejs` / `views/edit-store.ejs` (pin store location)
- **How it links to Express**: JS writes hidden inputs (`address`, `lat`, `lng` / `location`, `lat`, `lng`) which become `req.body` on POST.

### Mongoose `populate` (joining referenced docs for rendering)

- **Where**: `models/Store.js` populates `reviews`, then populates each review’s `userid.username`.
- **Why it matters**: allows EJS to render `review.userid.username` without extra manual queries.

### MongoDB update operators (`$addToSet`, `$push`)

- **Where**: `models/Forum.js`:
  - `$addToSet` prevents duplicate likes by the same user.
  - `$push` appends replies.

### Mongoose `Map` fields (key/value storage)

- **Where**: `models/User.js` stores meal plans in `calendar: Map` keyed by date strings (`YYYY-MM-DD`).

