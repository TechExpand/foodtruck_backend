// Local EJS preview server — renders every admin page with stub data so we can
// visually verify the sidebar / layout without touching prod or needing DB/auth.
//
// Run from foodtruck_backend_src/:    node local-preview.js
// Then open in browser:                http://localhost:3030/

const path = require('path');
const express = require('express');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Stub data so EJS renders don't choke on missing locals
const STUB_VENDORS = [
  { id: 1, business_name: 'beebah', tag: '["Pizza","Burgers"]', phone: '555-0001', meanRate: 4.2, rating: 4.2,
    pro_pic: '', detail: 'Sample vendor', specializedTagId: null, subcription_id: null,
    user: { id: 101, email: 'beebah@example.com', username: 'beebah' }, specialTag: null,
    category: 'Food Truck', createdAt: new Date(), online: true },
  { id: 2, business_name: 'Super Tacos', tag: '[tacos]', phone: '555-0002', meanRate: 3.8, rating: 3.8,
    pro_pic: '', detail: 'Sample vendor 2', specializedTagId: null, subcription_id: 'sub_x',
    user: { id: 102, email: 'super@example.com', username: 'super' }, specialTag: null,
    category: 'Food Truck', createdAt: new Date(), online: false },
];
const STUB_USERS = [
  { id: 1, email: 'sample1@example.com', username: 'sample1', createdAt: new Date(), type: 'USER' },
];
const STUB_SPECIAL_TAGS = [
  { id: 1, title: 'Featured Truck', icon: null, createdAt: new Date() },
];
const STUB_ALL_TAGS = [
  { id: 1, title: 'Pizza', icon: null, createdAt: new Date() },
  { id: 2, title: 'Tacos', icon: null, createdAt: new Date() },
];

function render(res, view, locals) {
  res.render(view, { user: null, ...locals }, (err, html) => {
    if (err) {
      console.error(`render error for ${view}:`, err.message);
      res.status(500).send(`<pre>${err.stack || err.message}</pre>`);
    } else {
      res.send(html);
    }
  });
}

// Index of all pages
app.get('/', (req, res) => {
  res.send(`
    <!doctype html><html><head><title>Local Admin Preview</title>
    <style>body{font-family:sans-serif;padding:30px;line-height:1.8}a{display:block;color:#0d6efd}</style>
    </head><body>
    <h2>Local Admin Preview</h2>
    <p>Click each page to verify the sidebar and layout in isolation.</p>
    <a href="/dashboard">/ (Dashboard, index.ejs)</a>
    <a href="/admin-vendors">/admin-vendors</a>
    <a href="/admin-tags">/admin-tags</a>
    <a href="/admin-events">/admin-events</a>
    <a href="/admin-promo-codes">/admin-promo-codes</a>
    <a href="/admin-beacons">/admin-beacons</a>
    <a href="/users">/users</a>
    <a href="/vendors">/vendors</a>
    <a href="/calendar">/calendar</a>
    <a href="/profile">/profile</a>
    <a href="/add-event">/add-event</a>
    <a href="/admin-vendor-edit">/admin-vendors/:id/edit (admin-vendor-edit.ejs)</a>
    </body></html>
  `);
});

app.get('/dashboard', (req, res) => render(res, 'index', {
  title: 'Dashboard', activePage: 'dashboard',
  vendorCount: 20, userCount: 48, eventCount: 0, tagCount: 14, featuredTagsCount: 0,
  recentVendors: STUB_VENDORS, recentUsers: STUB_USERS,
  popularVendors: STUB_VENDORS,
  userGrowth: 12.5, vendorGrowth: 8.6,
}));
app.get('/admin-vendors',     (req, res) => render(res, 'admin-vendors', { title: 'Vendors', activePage: 'admin-vendors' }));
app.get('/admin-tags',        (req, res) => render(res, 'admin-tags',    { title: 'Tags',    activePage: 'admin-tags',
  specialTags: STUB_SPECIAL_TAGS, allTags: STUB_ALL_TAGS, tagRecords: STUB_ALL_TAGS,
}));
// Prod aliases /tags to the same handler as /admin-tags. Mirror that here.
app.get('/tags',              (req, res) => render(res, 'admin-tags',    { title: 'Tags',    activePage: 'admin-tags',
  specialTags: STUB_SPECIAL_TAGS, allTags: STUB_ALL_TAGS, tagRecords: STUB_ALL_TAGS,
}));
app.get('/admin-events',      (req, res) => render(res, 'admin-events',     { title: 'Events',       activePage: 'admin-events' }));
app.get('/admin-promo-codes', (req, res) => render(res, 'admin-promo-codes',{ title: 'Promo Codes',  activePage: 'admin-promo-codes' }));
app.get('/admin-beacons',     (req, res) => render(res, 'admin-beacons',    { title: 'Hunger Beacons', activePage: 'admin-beacons' }));
app.get('/users', (req, res) => render(res, 'users', {
  title: 'Users', activePage: 'users',
  users: STUB_USERS, followingCounts: {}, userProfiles: {},
}));
app.get('/vendors', (req, res) => render(res, 'vendors', {
  title: 'Vendors', activePage: 'admin-vendors',
  vendors: STUB_VENDORS, allCount: 2, onlineCount: 1, subscribedCount: 0,
}));
app.get('/calendar', (req, res) => render(res, 'app-fullcalender', { title: 'Calendar', activePage: 'calendar' }));
app.get('/profile',  (req, res) => render(res, 'user-profile',     { title: 'Profile',  activePage: '' }));
app.get('/add-event',(req, res) => render(res, 'add-event',        { title: 'Add Event',activePage: 'admin-events' }));
app.get('/admin-vendor-edit', (req, res) => render(res, 'admin-vendor-edit', {
  title: 'Edit Vendor', activePage: 'admin-vendors',
  vendor: { ...STUB_VENDORS[0], id: 1 }, specialTags: STUB_SPECIAL_TAGS, allTags: STUB_ALL_TAGS,
}));

const PORT = 3030;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Local preview running:  http://localhost:${PORT}/`);
});
