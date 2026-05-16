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
exports.BeaconParticipant = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Beacon_1 = require("./Beacon");
const Users_1 = require("./Users");
let BeaconParticipant = class BeaconParticipant extends sequelize_typescript_1.Model {
};
exports.BeaconParticipant = BeaconParticipant;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Beacon_1.Beacon),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], BeaconParticipant.prototype, "beaconId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Users_1.Users),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], BeaconParticipant.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Beacon_1.Beacon, { onDelete: 'CASCADE' }),
    __metadata("design:type", Beacon_1.Beacon)
], BeaconParticipant.prototype, "beacon", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Users_1.Users, { onDelete: 'CASCADE' }),
    __metadata("design:type", Users_1.Users)
], BeaconParticipant.prototype, "user", void 0);
exports.BeaconParticipant = BeaconParticipant = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: 'beacon_participant',
        indexes: [{ unique: true, fields: ['beaconId', 'userId'] }],
    })
], BeaconParticipant);
//# sourceMappingURL=BeaconParticipant.js.map