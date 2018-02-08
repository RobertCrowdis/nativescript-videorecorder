"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var AdvancedVideoRecorder = (function () {
    function AdvancedVideoRecorder() {
    }
    Object.defineProperty(AdvancedVideoRecorder.prototype, "duration", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    AdvancedVideoRecorder.prototype.stop = function () { };
    AdvancedVideoRecorder.prototype.open = function (options) {
        if (options === void 0) { options = { saveToGallery: false, hd: false, format: 'default', position: 'back', size: 0, duration: 0 }; }
    };
    AdvancedVideoRecorder.prototype.record = function (cb) { };
    return AdvancedVideoRecorder;
}());
exports.AdvancedVideoRecorder = AdvancedVideoRecorder;
var AdvancedVideoView = (function (_super) {
    __extends(AdvancedVideoView, _super);
    function AdvancedVideoView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AdvancedVideoView.prototype.createNativeView = function () {
        return new android.widget.LinearLayout(this._context);
    };
    AdvancedVideoView.prototype.initNativeView = function () {
        this.recorder = new AdvancedVideoRecorder();
    };
    Object.defineProperty(AdvancedVideoView.prototype, "duration", {
        get: function () {
            return this.recorder.duration;
        },
        enumerable: true,
        configurable: true
    });
    AdvancedVideoView.prototype.open = function (options) { };
    AdvancedVideoView.prototype.record = function (cb) { };
    AdvancedVideoView.prototype.stop = function () { };
    return AdvancedVideoView;
}(view_1.View));
exports.AdvancedVideoView = AdvancedVideoView;
//# sourceMappingURL=advanced-video-recorder.js.map