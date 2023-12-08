"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const configSetup_1 = __importDefault(require("./config/configSetup"));
const db_1 = require("./controllers/db");
const index_1 = __importDefault(require("./routes/index"));
const auth_1 = __importDefault(require("./routes/auth"));
// import vendorAuth from './vendorRoutes/auth';
const authorise_1 = require("./middlewares/authorise");
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
// PARSE JSON
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use(formidable())
// ENABLE CORS AND START SERVER
app.use((0, cors_1.default)({ origin: true }));
(0, db_1.initDB)();
app.listen(configSetup_1.default.PORT, () => {
    console.log(`Server started on port ${configSetup_1.default.PORT}`);
});
// Routes
app.all('*', authorise_1.isAuthorized);
app.use("/foodtruck", auth_1.default);
app.use("/foodtruck", index_1.default);
// app.all('*', isAuthorized);
// app.use("/foodtruck", auth);
// app.use("/foodtruck", index);
//# sourceMappingURL=app.js.map