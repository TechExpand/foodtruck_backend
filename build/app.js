"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const configSetup_1 = __importDefault(require("./config/configSetup"));
const db_1 = require("./controllers/db");
const index_1 = __importDefault(require("./routes/index"));
const auth_1 = __importDefault(require("./routes/auth"));
const views_1 = __importDefault(require("./routes/views"));
const admin_1 = __importDefault(require("./routes/admin"));
const authorise_1 = require("./middlewares/authorise");
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
// PARSE JSON
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// SESSION CONFIGURATION
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'foodtruck-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// ENABLE CORS AND START SERVER
app.use((0, cors_1.default)({ origin: true }));
// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(process.cwd(), 'views'));
// Disabled layout system since templates are standalone
// app.use(expressLayouts);
// app.set('layout', 'layout');
// app.set("layout extractScripts", true);
// app.set("layout extractStyles", true);
// Serve static assets from public directory at root
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
// Simple test route
// app.get("/", (req, res) => {
// 	res.send("Hello World - Server is working!");
// });
// View routes (no authorization required)
app.use("/", views_1.default);
// Redirect /views/ to /
app.get("/views/", (req, res) => {
    res.redirect("/");
});
// Admin routes (no authorization required for local access)
app.use("/admin", admin_1.default);
// API routes (with authorization)
app.use("/foodtruck", authorise_1.isAuthorized, auth_1.default);
app.use("/foodtruck", authorise_1.isAuthorized, index_1.default);
// Initialize database
(0, db_1.initDB)();
app.listen(configSetup_1.default.PORT || 3000, '0.0.0.0', () => {
    console.log(`Server started on port ${configSetup_1.default.PORT || 3000}`);
    console.log(`Try: http://localhost:${configSetup_1.default.PORT || 3000}`);
});
//# sourceMappingURL=app.js.map