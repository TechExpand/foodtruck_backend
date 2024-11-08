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
exports.OrderV2 = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Users_1 = require("./Users");
const Profile_1 = require("./Profile");
const CartProduct_1 = require("./CartProduct");
var OrderType;
(function (OrderType) {
    OrderType["COMPLETED"] = "COMPLETED";
    OrderType["PENDING"] = "PENDING";
})(OrderType || (OrderType = {}));
let OrderV2 = class OrderV2 extends sequelize_typescript_1.Model {
};
exports.OrderV2 = OrderV2;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Profile_1.Profile),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], OrderV2.prototype, "profileId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Users_1.Users),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], OrderV2.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(OrderType.PENDING),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(OrderType.COMPLETED, OrderType.PENDING)),
    __metadata("design:type", String)
], OrderV2.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profile_1.Profile, { onDelete: 'CASCADE' }),
    __metadata("design:type", Profile_1.Profile)
], OrderV2.prototype, "profile", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Users_1.Users, { onDelete: 'CASCADE' }),
    __metadata("design:type", Users_1.Users)
], OrderV2.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => CartProduct_1.CartProduct, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], OrderV2.prototype, "menu", void 0);
exports.OrderV2 = OrderV2 = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'order_v2' })
], OrderV2);
//# sourceMappingURL=OrderV2.js.map