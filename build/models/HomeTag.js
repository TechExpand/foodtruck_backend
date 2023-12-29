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
exports.HomeTag = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Tag_1 = require("./Tag");
let HomeTag = class HomeTag extends sequelize_typescript_1.Model {
};
exports.HomeTag = HomeTag;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Tag_1.Tag),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], HomeTag.prototype, "tagId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Tag_1.Tag, { onDelete: 'CASCADE' }),
    __metadata("design:type", Tag_1.Tag)
], HomeTag.prototype, "tag", void 0);
exports.HomeTag = HomeTag = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'hometag' })
], HomeTag);
//# sourceMappingURL=HomeTag.js.map