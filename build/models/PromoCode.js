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
exports.PromoCodeRedemption = exports.PromoCode = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Profile_1 = require("./Profile");
let PromoCode = class PromoCode extends sequelize_typescript_1.Model {
};
exports.PromoCode = PromoCode;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], PromoCode.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PromoCode.prototype, "max_uses", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PromoCode.prototype, "used_count", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Object)
], PromoCode.prototype, "expires_at", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(30),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PromoCode.prototype, "trial_days", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => PromoCodeRedemption, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], PromoCode.prototype, "redemptions", void 0);
exports.PromoCode = PromoCode = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'promo_codes' })
], PromoCode);
let PromoCodeRedemption = class PromoCodeRedemption extends sequelize_typescript_1.Model {
};
exports.PromoCodeRedemption = PromoCodeRedemption;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => PromoCode),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PromoCodeRedemption.prototype, "promo_code_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Profile_1.Profile),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PromoCodeRedemption.prototype, "profile_id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], PromoCodeRedemption.prototype, "redeemed_at", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Object)
], PromoCodeRedemption.prototype, "subscription_expires_at", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => PromoCode, { onDelete: 'CASCADE' }),
    __metadata("design:type", PromoCode)
], PromoCodeRedemption.prototype, "promoCode", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profile_1.Profile, { onDelete: 'CASCADE' }),
    __metadata("design:type", Profile_1.Profile)
], PromoCodeRedemption.prototype, "profile", void 0);
exports.PromoCodeRedemption = PromoCodeRedemption = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'promo_code_redemptions', indexes: [{ unique: true, fields: ['promo_code_id', 'profile_id'] }] })
], PromoCodeRedemption);
//# sourceMappingURL=PromoCode.js.map