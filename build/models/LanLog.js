"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanLog = exports.UserStatus = exports.UserType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Users_1 = require("./Users");
var UserType;
(function (UserType) {
    UserType["USER"] = "USER";
    UserType["VENDOR"] = "VENDOR";
})(UserType || (exports.UserType = UserType = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let LanLog = class LanLog extends sequelize_typescript_1.Model {
};
exports.LanLog = LanLog;
__decorate([
    (0, sequelize_typescript_1.Default)(UserType.VENDOR),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(UserType.USER, UserType.VENDOR)),
    __metadata("design:type", String)
], LanLog.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", String)
], LanLog.prototype, "Lan", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", String)
], LanLog.prototype, "Log", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", String)
], LanLog.prototype, "online", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Users_1.Users),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LanLog.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Users_1.Users, { onDelete: 'CASCADE' }),
    __metadata("design:type", Users_1.Users)
], LanLog.prototype, "user", void 0);
exports.LanLog = LanLog = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'lanlog' })
], LanLog);
//# sourceMappingURL=LanLog.js.map