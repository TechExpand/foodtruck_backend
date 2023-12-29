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
exports.Extra = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Menus_1 = require("./Menus");
let Extra = class Extra extends sequelize_typescript_1.Model {
};
exports.Extra = Extra;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Extra.prototype, "extra_title", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Extra.prototype, "extra_description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Extra.prototype, "extra_price", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Menus_1.Menu),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Extra.prototype, "menuId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Menus_1.Menu, { onDelete: 'CASCADE' }),
    __metadata("design:type", Menus_1.Menu)
], Extra.prototype, "menu", void 0);
exports.Extra = Extra = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'extra' })
], Extra);
//# sourceMappingURL=Extras.js.map