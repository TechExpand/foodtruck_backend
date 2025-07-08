"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingService = void 0;
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const options = {
    provider: 'google',
    apiKey: 'AIzaSyCmNU-SKcFdq_4PdDBqtdqRDm8xOpptV5Q',
    formatter: null
};
const geocoder = (0, node_geocoder_1.default)(options);
class GeocodingService {
    static getCityFromCoordinates(lat, lng) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[Geocoding] Requesting city for:', lat, lng);
                const results = yield geocoder.reverse({ lat, lon: lng });
                console.log('[Geocoding] Raw result:', JSON.stringify(results, null, 2));
                if (results && results.length > 0) {
                    const result = results[0];
                    // Try to get city from various possible fields
                    const city = result.city ||
                        result.locality ||
                        ((_a = result.administrativeLevels) === null || _a === void 0 ? void 0 : _a.level2long) ||
                        ((_b = result.administrativeLevels) === null || _b === void 0 ? void 0 : _b.level1long) ||
                        'Unknown city';
                    console.log('[Geocoding] Parsed city:', city);
                    return city;
                }
                return 'Unknown city';
            }
            catch (err) {
                console.error('[Geocoding] Error object:', err);
                if (err && typeof err === 'object') {
                    if ('response' in err) {
                        console.error('[Geocoding] Error response:', err.response);
                    }
                    if ('status' in err) {
                        console.error('[Geocoding] Error status:', err.status);
                    }
                    if ('message' in err) {
                        console.error('[Geocoding] Error message:', err.message);
                    }
                }
                return 'Unknown city';
            }
        });
    }
    static getCityFromLanLog(lan, log) {
        return __awaiter(this, void 0, void 0, function* () {
            const lat = Number(lan);
            const lng = Number(log);
            if (isNaN(lat) || isNaN(lng)) {
                return 'Invalid coordinates';
            }
            return this.getCityFromCoordinates(lat, lng);
        });
    }
}
exports.GeocodingService = GeocodingService;
//# sourceMappingURL=geocoding.js.map