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
exports.FeaturedEventTrucks = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Profile_1 = require("./Profile");
const Event_1 = require("./Event");
let FeaturedEventTrucks = class FeaturedEventTrucks extends sequelize_typescript_1.Model {
};
exports.FeaturedEventTrucks = FeaturedEventTrucks;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Profile_1.Profile),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], FeaturedEventTrucks.prototype, "profileId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.Events),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], FeaturedEventTrucks.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profile_1.Profile, { onDelete: 'CASCADE' }),
    __metadata("design:type", Profile_1.Profile)
], FeaturedEventTrucks.prototype, "profile", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.Events, { onDelete: 'CASCADE' }),
    __metadata("design:type", Event_1.Events)
], FeaturedEventTrucks.prototype, "event", void 0);
exports.FeaturedEventTrucks = FeaturedEventTrucks = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'featured_event_trucks' })
], FeaturedEventTrucks);
//# sourceMappingURL=FeaturedEventTrucks.js.map