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
exports.Beacon = exports.BeaconStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Users_1 = require("./Users");
const BeaconParticipant_1 = require("./BeaconParticipant");
var BeaconStatus;
(function (BeaconStatus) {
    BeaconStatus["PENDING"] = "PENDING";
    BeaconStatus["ACTIVE"] = "ACTIVE";
    BeaconStatus["CLAIMED"] = "CLAIMED";
    BeaconStatus["EXPIRED"] = "EXPIRED";
})(BeaconStatus || (exports.BeaconStatus = BeaconStatus = {}));
let Beacon = class Beacon extends sequelize_typescript_1.Model {
};
exports.Beacon = Beacon;
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", Number)
], Beacon.prototype, "lan", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", Number)
], Beacon.prototype, "log", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Beacon.prototype, "locationName", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(25),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Beacon.prototype, "threshold", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Beacon.prototype, "currentCount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(BeaconStatus.PENDING),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(BeaconStatus))),
    __metadata("design:type", String)
], Beacon.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Object)
], Beacon.prototype, "claimedByUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", Object)
], Beacon.prototype, "vendorBusinessName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Beacon.prototype, "expiresAt", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Users_1.Users),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Beacon.prototype, "creatorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Users_1.Users, { foreignKey: 'creatorId', onDelete: 'CASCADE' }),
    __metadata("design:type", Users_1.Users)
], Beacon.prototype, "creator", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => BeaconParticipant_1.BeaconParticipant, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Beacon.prototype, "participants", void 0);
exports.Beacon = Beacon = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'beacon' })
], Beacon);
//# sourceMappingURL=Beacon.js.map