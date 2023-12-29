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
exports.Menu = exports.ProfileType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Users_1 = require("./Users");
// import { Professional } from './Professional';
const LanLog_1 = require("./LanLog");
const Extras_1 = require("./Extras");
// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }
var ProfileType;
(function (ProfileType) {
    ProfileType["CLIENT"] = "CLIENT";
    ProfileType["PROFESSIONAL"] = "PROFESSIONAL";
})(ProfileType || (exports.ProfileType = ProfileType = {}));
let Menu = class Menu extends sequelize_typescript_1.Model {
};
exports.Menu = Menu;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Menu.prototype, "menu_title", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Menu.prototype, "menu_adon", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Menu.prototype, "menu_description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Menu.prototype, "menu_price", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Menu.prototype, "menu_picture", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => LanLog_1.LanLog),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Menu.prototype, "lanlogId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Users_1.Users),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Menu.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Menu.prototype, "extras", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Users_1.Users, { onDelete: 'CASCADE' }),
    __metadata("design:type", Users_1.Users)
], Menu.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => LanLog_1.LanLog, { onDelete: 'CASCADE' }),
    __metadata("design:type", LanLog_1.LanLog)
], Menu.prototype, "lanlog", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Extras_1.Extra, { onDelete: 'CASCADE' }),
    __metadata("design:type", Extras_1.Extra)
], Menu.prototype, "extra", void 0);
exports.Menu = Menu = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'menu' })
], Menu);
//# sourceMappingURL=Menus.js.map