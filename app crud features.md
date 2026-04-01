# App CRUD Features (Kopitiam Meal Planner)

This document explains the **6 CRUD feature sets** in the project and how each one works end-to-end using the course concepts (Express routing, controllers, EJS view rendering, MongoDB via Mongoose, sessions/auth middleware).

### How to read the code snippets in this document

- **JavaScript (server or client)** runs as normal JS. Comments inside `js` blocks explain line-by-line where present.
- **EJS templates** use:
  - **`<% ... %>`** — server-side logic only (loops, `if`, variables); nothing is sent to the browser.
  - **`<%= ... %>`** — prints a value into the HTML (escaped for safety).
  - **`<%- ... %>`** — *(not used in snippets below)* unescaped output.
- After most fenced code blocks, an **Explanation** subsection spells out what the snippet does in plain language so you can match it to routes, `req.body`, and MongoDB.

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

**Explanation:** This is the Express app’s global setup. `ejs` is registered so `res.render('viewName')` works. `urlencoded` turns submitted form fields into `req.body` (needed for almost every POST). `static('public')` makes files under `public/` (CSS, uploaded images under `public/uploads/`) available at URLs like `/uploads/...`. `session` stores login state in MongoDB via `connect-mongo`. The last lines **mount** each router so URLs are prefixed (`/meal-planner`, `/ratings`, `/forum`).

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

**Explanation:** `requireLogin` is middleware: if `req.session.user` exists, `next()` runs and the real route handler executes; otherwise the browser is sent to `/login`. `requireAdmin` adds a **role** check (`admin`); non-admins get HTTP 403 and redirect to `/home`. These are attached to specific routes in `routes/*.js` to protect pages or actions.

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

## Image uploads (end-to-end)

**Where image upload exists:** Only the **Forum** feature uses file uploads. Everywhere else, CRUD uses plain form fields (text, numbers, checkboxes) and **no** `multipart/form-data`.

**Pipeline (browser → server → disk → database → browser again):**

1. **Form encoding:** File inputs must live inside a form with `enctype="multipart/form-data"`. The default `application/x-www-form-urlencoded` is not used for binary uploads.

2. **Why Multer:** `express.urlencoded()` parses text fields only. **`multer`** middleware runs on specific forum POST routes as `upload.single('photo')`. The string `'photo'` must match the file input’s `name="photo"`. After Multer runs, `req.body` still holds text fields, and `req.file` is set when a file was sent.

3. **Disk storage:** `middleware/upload.js` uses `multer.diskStorage` to write into `public/uploads/forum/`. Filenames are `Date.now()` plus the original extension (lowercased) so names stay unique and safe.

4. **Validation:** A `fileFilter` rejects non-images. `limits: { fileSize: 5 * 1024 * 1024 }` caps uploads at **5 MB**.

5. **What MongoDB stores:** The `Forum` schema keeps a **string** (`photo`) for the post and each reply—not file bytes. The value is the saved filename (e.g. `1712345678901.jpg`).

6. **How images are shown:** `server.use(express.static('public'))` serves `public/` at the site root, so `public/uploads/forum/x.png` is reachable at **`/uploads/forum/x.png`**. EJS uses that path in `<img src="...">`.

7. **Create vs edit:** New posts and replies pass `req.file ? req.file.filename : null` into the model. On **edit post**, the controller adds `photo` to the update object **only if** `req.file` exists, so omitting a new file **keeps** the previous image in the database.

8. **Client-side JavaScript:** `FileReader` in the forum templates only provides an **in-browser preview** before submit; the actual persistence is always the POST + Multer path above.

**Multer configuration (server-side):**

```js
// middleware/upload.js — destination, safe filename, image-only filter, 5 MB cap
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/forum/');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + ext);
  }
});
```

**Explanation:** This configures **where** Multer saves files (`public/uploads/forum/`) and **how** each file is named: a timestamp plus the original file extension (lowercase), so names are unique and filesystem-safe. The full `multer({ storage, fileFilter, limits })` setup in the project also restricts MIME types and file size (see Topics section at the end).

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

**Explanation:** The handler walks each meal **slot** (`breakfast`, etc.). For each slot, if the user entered a non-empty meal name, it trims strings, parses `budget` to a number, and may call `ensureStoreExists` so the store name exists in the Ratings collection. It builds `dayPlan` only from filled slots. If `dayPlan` has any keys, that object is stored in `user.calendar` under the date string; if **no** slots were filled, that date is **removed** from the map. `user.save()` persists to MongoDB, then **redirect** avoids duplicate POST on refresh (PRG pattern).

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

**Explanation:** The form’s `action` includes `<%= date %>` so the POST goes to `/meal-planner/2026-04-02` (example). Each slot’s inputs use **bracket notation** in the `name` attribute: `breakfast[mealName]`, `breakfast[budget]`, etc. The server-side loop substitutes `slot.key` so the same template renders four slots. `value` / textarea content uses `saved` (from `existingPlan`) to pre-fill when editing. **`<%= %>`** outputs the dynamic part of the name; **`saved ? ... : ''`** avoids showing `undefined`.

How it links:
- With `express.urlencoded({ extended: true })`, Express parses these into nested objects like `req.body.breakfast.mealName`.

### Supplement: EJS — calendar month grid (read + deep link per day)

The list view builds each cell’s date key (`YYYY-MM-DD`) to match `User.calendar` Map keys, then links to the plan form for that day. This CRUD set does **not** use image uploads or multipart forms.

```ejs
<% for (let day = 1; day <= daysInMonth; day++) {
  const mFormat    = (month + 1).toString().padStart(2, '0');
  const dFormat    = day.toString().padStart(2, '0');
  const dateString = `${year}-${mFormat}-${dFormat}`;
  const dayPlan    = calendar.has(dateString) ? calendar.get(dateString) : null;
%>
  <td>
    <div class="day-num"><%= day %></div>
    <!-- ... slot summaries omitted ... -->
    <a href="/meal-planner/<%= dateString %>" class="day-link">
      <%= filledSlots.length > 0 ? 'Edit' : 'Add' %>
    </a>
  </td>
<% } %>
```

**Explanation:** For each day number `1…daysInMonth`, the template builds **`dateString`** as `YYYY-MM-DD` (zero-padded month/day) so it matches keys in `User.calendar`. `calendar.has/get` reads whether the user saved a plan for that day. Each table cell shows the day number and an **Add** or **Edit** link to `/meal-planner/<dateString>`. The `for` mixes HTML (`<td>`) with EJS; `filledSlots` (computed above in the full template) drives whether the link says Add vs Edit. Month **Prev/Next** links pass `?month=&year=` so the same route can show another month.

**Month navigation** uses query parameters on the same route, e.g. `href="/meal-planner?month=<%= prevMonth %>&year=<%= prevYear %>"`, so the controller can render another month without a separate “page” per month.

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

**Explanation:** `router.use(requireLogin)` applies to **all** forum routes below it. Routes are ordered so **`/new`** and **`/new`** POST are registered before **`/:id`**, otherwise Express would treat `"new"` as an `:id`. `upload.single('photo')` must run on POSTs that include a file field named `photo`; it parses multipart data and attaches `req.file`. Delete and like routes do not use Multer.

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

**Explanation:** `Forum.createPost` receives plain fields from `req.body` plus `req.file` from Multer. `photo` becomes the **stored filename string** or `null` if the user did not attach a file. `userId` comes from the session so posts are tied to the logged-in user. `location` groups address and coordinates; `lat`/`lng` are parsed from strings to numbers (or `null`). After insert, **`res.redirect('/forum')`** sends the user to the list (POST-Redirect-GET).

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

**Explanation:** `addLike` uses MongoDB **`$addToSet`** on the `likes` array so the same `userId` cannot be inserted twice (duplicate likes blocked). `addReply` uses **`$push`** to append one object to `replies` with `userId`, `content`, and optional `photo` filename. Both return the updated document when `{ new: true }` is set (useful if the caller needs the new state).

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

**Explanation:** **`enctype="multipart/form-data"`** is required whenever the form includes `<input type="file">`; without it, the file would not upload correctly. `title` and `content` are normal text fields. `photo` is the file input **name** that must match `upload.single('photo')`. Hidden `address`, `lat`, `lng` start empty; **client-side** Leaflet/Nominatim scripts fill them before submit so the server still receives location in `req.body` together with the file.

### Supplement: EJS — displaying uploaded images (read)

Stored filenames are combined with the static URL prefix. The `if (post.photo)` guard avoids broken `<img>` tags when no file was uploaded.

**Post image (single post view):**

```ejs
<% if (post.photo) { %>
  <img src="/uploads/forum/<%= post.photo %>" alt="Post photo" class="post-photo">
<% } %>
```

**Explanation:** Only render an image when `post.photo` is truthy. `<%= post.photo %>` injects the filename into the URL path the browser will request from the static file server.

**Reply image in the thread:**

```ejs
<% if (reply.photo) { %>
  <img src="/uploads/forum/<%= reply.photo %>" alt="Reply photo" class="reply-photo">
<% } %>
```

**Explanation:** Each reply can have its own optional `photo` filename. The same static URL pattern `/uploads/forum/<filename>` applies as for the main post.

**Edit form — show current image before optional replacement:**

```ejs
<% if (post.photo) { %>
  <img src="/uploads/forum/<%= post.photo %>" alt="Current photo" class="current-photo">
<% } %>
<input type="file" id="photo" name="photo" accept="image/*">
```

**Explanation:** If the post already has a photo, show it so the user knows what will be replaced. The new file input uses the same `name="photo"` as create; the controller only updates `photo` in the database when a **new** file is uploaded.

### Supplement: EJS — reply form with photo (create reply)

Replies use the same field name `photo` so the same Multer middleware (`upload.single('photo')`) applies. The form posts to the post-specific reply URL.

```ejs
<form action="/forum/<%= post._id %>/reply" method="POST" enctype="multipart/form-data">
  <textarea name="content" placeholder="Share your thoughts or experience..." required></textarea>
  <input type="file" id="reply-photo" name="photo" accept="image/*">
  <button type="submit" class="reply-submit-btn">Post Reply</button>
</form>
```

**Explanation:** `action` uses `<%= post._id %>` so the reply POST goes to `/forum/<thatId>/reply`. `enctype="multipart/form-data"` is required because of the file input. The file input’s **`id`** can be `reply-photo` for JS, but **`name` must be `photo`** to match `upload.single('photo')`.

### Supplement: JavaScript — photo preview only (create / edit / reply)

The browser reads the selected file with `FileReader` and sets an `<img>` `src` to a data URL. This **does not** upload the file; upload happens when the user submits the form.

**New post (`views/forum-form.ejs`):**

```js
document.getElementById('photo').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('photo-preview');
    img.src = e.target.result;
    img.style.display = 'block';
  };
  reader.readAsDataURL(file);
});
```

**Explanation:** When the user picks a file, `change` fires. `readAsDataURL` reads the file as a base64 data URL; `onload` assigns it to the preview `<img>` and shows it. **No upload** occurs until the user clicks the form submit button.

**Reply thread (`views/forum-post.ejs`):** the same pattern is used on `#reply-photo` and `#reply-preview`.

**Edit post (`views/forum-edit.ejs`):** same pattern on `#photo` and `#photo-preview` so the user sees the newly chosen replacement before save.

### Supplement: JavaScript — Leaflet + Nominatim (location, not images)

Forum create/edit templates also load Leaflet and use `fetch` to Nominatim to fill `address`, `lat`, `lng` hidden fields. That location data travels as normal form fields alongside the multipart file upload.

**Explanation:** This is **browser** JavaScript: the map is interactive, but only the hidden inputs are submitted. The server does not call Nominatim; it only reads `req.body.address`, `req.body.lat`, `req.body.lng` like any other form fields.

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

**Explanation:** `req.query` holds GET querystring parameters (e.g. `?maxBudget=10`). If present, `filter` limits MongoDB to stores with `budget <= maxBudget`. `retrieveAll` returns stores for the list view. The template receives `maxBudget` so the dropdown can stay **selected** after filter, and `sessionUser` so EJS can show admin-only controls.

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

**Explanation:** `populate('reviews')` replaces each `Review` ObjectId in `store.reviews` with the full review document. **Nested** `populate` on `reviews.userid` loads the user who wrote the review and only the `username` field—so the template can use `review.userid.username` without extra queries.

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

**Explanation:** `method="GET"` and `action="/ratings"` mean submitting the form navigates to `/ratings?maxBudget=...` (other options exist in the full template). The `<option>` uses `<%= maxBudget == 10 ? "selected" : "" %>` so the **current** filter stays selected when the page re-renders.

Snippet (from `views/store.ejs`) showing admin-only edit/delete:

```ejs
<% if (sessionUser && sessionUser.role === 'admin') { %>
  <a href="/ratings/<%= store._id %>/edit">Edit Store</a>
  <form action="/ratings/<%= store._id %>/delete" method="POST">
    <button type="submit">Delete Store</button>
  </form>
<% } %>
```

**Explanation:** **`if (sessionUser && sessionUser.role === 'admin')`** wraps destructive or admin-only actions. `<%= store._id %>` builds correct URLs for this store’s edit and delete POST. Non-admins never see this block.

### Supplement: EJS — dynamic menu rows (`name="food"`)

`add-store.ejs` / `edit-store.ejs` repeat `<input name="food">` so the controller can normalize to an array. Rows are added or removed in the DOM before submit.

```ejs
<div id="food-list">
  <div class="food-row">
    <input type="text" name="food" placeholder="e.g. Chicken Rice">
    <button type="button" class="remove-btn" onclick="removeFood(this)">✕</button>
  </div>
</div>
<button type="button" class="add-food-btn" onclick="addFood()">+ Add Item</button>
```

**Explanation:** Multiple inputs share **`name="food"`** so the server may receive one value or an array. `onclick` calls **global** functions defined in a `<script>` block below. `removeFood` / `addFood` only change the DOM; data is sent on form submit.

### Supplement: JavaScript — map + food list (create/edit store)

**Leaflet + Nominatim** (`views/add-store.ejs`): `placeMarker(lat, lng, displayName)` writes `location`, `lat`, and `lng` hidden inputs so `req.body` contains coordinates on POST. Map click uses reverse geocode; search uses forward geocode.

```js
function placeMarker(lat, lng, displayName) {
  document.getElementById('location').value = displayName;
  document.getElementById('lat').value = lat;
  document.getElementById('lng').value = lng;
}
```

**Explanation:** When the user picks a point on the map or selects a search result, this function writes the human-readable label and coordinates into hidden inputs. The next POST to create/update store includes them in `req.body` like any text field.

**Dynamic food rows:**

```js
function addFood() {
  const list = document.getElementById('food-list');
  const row = document.createElement('div');
  row.className = 'food-row';
  row.innerHTML = `
    <input type="text" name="food" placeholder="e.g. Char Kway Teow">
    <button type="button" class="remove-btn" onclick="removeFood(this)">✕</button>
  `;
  list.appendChild(row);
}

function removeFood(btn) {
  const list = document.getElementById('food-list');
  if (list.children.length > 1) {
    btn.parentElement.remove();
  } else {
    btn.previousElementSibling.value = '';
  }
}
```

**Explanation:** `addFood` **appends** a new row with `name="food"` so multiple menu lines submit together. `removeFood` deletes a row if more than one exists; if only one row remains, it clears the input instead of removing the row so at least one `food` field always exists. **Button `type="button"`** prevents accidental form submit.

If the form re-renders after validation error, optional EJS can `fetch` Nominatim to re-place the marker from `formData.location` (see bottom of `add-store.ejs`).

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

**Explanation:** A new `Review` document is created with `storeId`, optional `userid` from session, trimmed text fields, numeric `rating`, and `timestamp`. After `save()`, the review’s `_id` is **pushed** into `store.reviews` so the store document references all its reviews. Redirect shows the updated store page.

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

**Explanation:** For each review, `isOwner` compares the review author’s id to the logged-in user’s id (`toString()` so ObjectId comparison works). `isAdmin` checks role. Only if either is true does the template show **Edit** (GET link) and **Delete** (POST form). Other users see neither control.

### Supplement: EJS — add review form (create)

Standard `POST` with **no** `multipart` (text-only fields). `storeName` is duplicated in a hidden input so the controller can re-render with context if validation fails.

```ejs
<form action="/ratings/<%= storeId %>/review/new" method="POST">
  <input type="hidden" name="storeName" value="<%= storeName %>">
  <input type="text" id="title" name="title" maxlength="100" required>
  <textarea id="body" name="body" rows="5" minlength="10" required></textarea>
  <select id="rating" name="rating" required>
    <option value="">-- Select --</option>
    <option value="1">1 — Poor</option>
    <option value="2">2 — Fair</option>
    <option value="3">3 — Average</option>
    <option value="4">4 — Good</option>
    <option value="5">5 — Excellent</option>
  </select>
  <button type="submit">Submit Review</button>
</form>
```

**Explanation:** `action` includes `<%= storeId %>` so the POST targets `/ratings/<storeId>/review/new`. Hidden `storeName` is not required for the DB but helps the controller re-render the form with the store title if validation fails. `name` attributes (`title`, `body`, `rating`) map directly to `req.body` fields. No `multipart` encoding—reviews are text only.

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

**Explanation:** Loads the hunt by URL id. If the document is missing **or** `hunt.userId` does not match the session user, the handler **redirects** away (users cannot view others’ hunts). Otherwise it renders the result page with that hunt’s data.

Snippet (from `views/food-hunt-form.ejs`) showing create vs edit action:

```ejs
<form action="<%= hunt ? '/food-hunt/' + hunt._id + '/edit' : '/food-hunt/new' %>" method="POST">
  <input type="number" id="totalBudget" name="totalBudget" value="<%= hunt ? hunt.totalBudget : '' %>">
  <select id="numMeals" name="numMeals">
    <option value="3" <%= hunt && hunt.numMeals === 3 ? 'selected' : '' %>>3 meals</option>
  </select>
</form>
```

**Explanation:** The form **`action`** uses a ternary: if `hunt` exists (edit mode), POST to `/food-hunt/<id>/edit`; otherwise POST to `/food-hunt/new` for create. `value="<%= hunt ? hunt.totalBudget : '' %>"` pre-fills numbers when editing. The `<option>` uses `selected` when `hunt.numMeals` matches (full template has more meal counts).

### Supplement: EJS — hunt list cards (read + delete)

Each saved hunt shows tags (from a comma-separated `requirements` string), summary meta, top result line, and actions linking to view/edit plus a **POST** delete form.

```ejs
<% hunts.forEach(function(hunt) { %>
  <div class="hunt-card">
    <div class="req">
      <% hunt.requirements.split(',').forEach(function(tag) { %>
        <span class="tag"><%= tag.trim() %></span>
      <% }) %>
    </div>
    <div class="actions">
      <a href="/food-hunt/<%= hunt._id %>" class="view-btn">View Results</a>
      <a href="/food-hunt/<%= hunt._id %>/edit" class="edit-btn">Edit</a>
      <form action="/food-hunt/<%= hunt._id %>/delete" method="POST" style="display:inline;">
        <button type="submit" class="delete-btn">Delete</button>
      </form>
    </div>
  </div>
<% }) %>
```

**Explanation:** Outer `forEach` renders one card per hunt. `requirements.split(',')` turns the stored comma-separated string into tags; `trim()` cleans spaces. Links embed `<%= hunt._id %>` for view and edit routes. **Delete** uses a separate POST form (no JavaScript) to `/food-hunt/<id>/delete`.

**Note:** Recommendation scoring runs on the **server** in `routes/foodHunt.js`; these templates are mostly declarative HTML/EJS with no image upload.

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

**Explanation:** `GET /challenges/new` is wrapped in `requireAdmin`; the handler renders the form with **`challenge: null`** so the template knows it is create mode. `POST /:id/delete` deletes by Mongo id from the URL and redirects to the list—no body fields required beyond what Express parses from `params`.

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

**Explanation:** `isDone` is computed earlier in the template from `challenge.completedBy` and the current user. If the user has **not** completed the challenge, show the **complete** POST form; if they have, show **uncomplete** instead. Only one form appears per challenge row.

### Supplement: EJS — admin create/edit form (single template)

`challenge-form.ejs` switches `action` and field defaults depending on whether `challenge` is passed (edit) or `null` (create). Server-side `error` displays when validation fails.

```ejs
<form action="<%= challenge ? '/challenges/' + challenge._id + '/edit' : '/challenges/new' %>" method="POST">
  <input type="text" id="title" name="title"
    value="<%= challenge ? challenge.title : '' %>">
  <textarea id="description" name="description" rows="3"><%= challenge ? challenge.description : '' %></textarea>
  <button type="submit" class="submit-btn">
    <%= challenge ? 'Save Changes' : 'Create Challenge' %>
  </button>
</form>
```

**Explanation:** `action` uses a ternary on **challenge**: edit posts to `/challenges/<_id>/edit`, create posts to `/challenges/new`. Input `value` and textarea body use `challenge ? ... : ''` to pre-fill when editing. **Submit button label** also switches for clarity. The same template file serves both flows.

**Note:** This CRUD set has **no** client-side JavaScript for map or uploads; behavior is standard form POSTs and redirects.

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

- **Where**: `middleware/upload.js`, applied in `routes/forum.js` as `upload.single('photo')` on `POST /forum/new`, `POST /forum/:id/edit`, and `POST /forum/:id/reply`.
- **Why it matters**: normal form parsing (`express.urlencoded`) can’t handle binary files; multer writes files to disk and exposes metadata as `req.file`.
- **Full walkthrough**: see the section **[Image uploads (end-to-end)](#image-uploads-end-to-end)** earlier in this document.

Minimal snippet (from `middleware/upload.js`):

```js
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});
```

**Explanation:** The exported Multer instance wires **disk storage** (defined above in the same file), **fileFilter** (MIME allowlist), and **size limit** (`5 * 1024 * 1024` bytes). Routes import this object and call `.single('photo')` so only one file field per request is handled.

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

