"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("file-system");
var types = require("utils/types");
var view_1 = require("ui/core/view");
var AdvancedVideoRecorder = (function () {
    function AdvancedVideoRecorder() {
    }
    Object.defineProperty(AdvancedVideoRecorder.prototype, "duration", {
        get: function () {
            if (this._output && this._output.recordedDuration) {
                return Math.floor(Math.round(CMTimeGetSeconds(this._output.recordedDuration)));
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    AdvancedVideoRecorder.prototype.stop = function () {
        this.session.stopRunning();
    };
    AdvancedVideoRecorder.prototype.open = function (options) {
        var _this = this;
        if (options === void 0) { options = { saveToGallery: false, hd: false, format: 'default', position: 'back', size: 0, duration: 0 }; }
        return new Promise(function (resolve, reject) {
            try {
                _this.session = new AVCaptureSession();
                var devices = AVCaptureDevice.devicesWithMediaType(AVMediaTypeVideo);
                var device = void 0;
                options.saveToGallery = Boolean(options.saveToGallery) ? true : false;
                options.hd = Boolean(options.hd) ? true : false;
                if (options && !options.format) {
                    options.format = 'default';
                }
                options.position = options && types.isString(options.position) ? options.position : "back";
                var pos = options.position === "front" ? 2 : 1;
                for (var i = 0; i < devices.count; i++) {
                    if (devices[i].position === pos) {
                        device = devices[i];
                        break;
                    }
                }
                var input = AVCaptureDeviceInput.deviceInputWithDeviceError(device, null);
                var audioDevice = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeAudio);
                var audioInput = AVCaptureDeviceInput.deviceInputWithDeviceError(audioDevice, null);
                _this._output = new AVCaptureMovieFileOutput();
                var format = options && options.format === 'default' ? '.mov' : '.' + options.format;
                var fileName = "videoCapture_" + +new Date() + format;
                var path = fs.path.join(fs.knownFolders.documents().path, fileName);
                _this._file = NSURL.fileURLWithPath(path);
                if (!input) {
                    reject("Error trying to open camera.");
                }
                if (!audioInput) {
                    reject("Error trying to open mic.");
                }
                _this._output.maxRecordedDuration = types.isNumber(options.duration) && options.duration > 0 ? CMTimeMakeWithSeconds(options.duration, 1) : kCMTimePositiveInfinity;
                if (options.size > 0) {
                    _this._output.maxRecordedFileSize = (options.size * 1024 * 1024);
                }
                _this.session.beginConfiguration();
                _this.session.sessionPreset = options.hd ? AVCaptureSessionPresetHigh : AVCaptureSessionPresetLow;
                _this.session.addInput(input);
                _this.session.addInput(audioInput);
                _this.session.addOutput(_this._output);
                _this.session.commitConfiguration();
                var preview_1 = AVCaptureVideoPreviewLayer.alloc().initWithSession(_this.session);
                dispatch_async(dispatch_get_current_queue(), function () {
                    preview_1.videoGravity = AVLayerVideoGravityResizeAspectFill;
                });
                if (!_this.session.running) {
                    _this.session.startRunning();
                }
                resolve(preview_1);
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    AdvancedVideoRecorder.prototype.record = function (cb) {
        var delegate = AVCaptureFileOutputRecordingDelegateImpl.initWithOwnerCallback(new WeakRef(this), cb);
        this._output.startRecordingToOutputFileURLRecordingDelegate(this._file, delegate);
    };
    return AdvancedVideoRecorder;
}());
exports.AdvancedVideoRecorder = AdvancedVideoRecorder;
var AVCaptureFileOutputRecordingDelegateImpl = (function (_super) {
    __extends(AVCaptureFileOutputRecordingDelegateImpl, _super);
    function AVCaptureFileOutputRecordingDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AVCaptureFileOutputRecordingDelegateImpl.initWithOwnerCallback = function (owner, callback) {
        var delegate = new AVCaptureFileOutputRecordingDelegateImpl();
        delegate._callback = callback;
        delegate._owner = owner;
        return delegate;
    };
    AVCaptureFileOutputRecordingDelegateImpl.prototype.captureOutputDidFinishRecordingToOutputFileAtURLFromConnectionsError = function (captureOutput, outputFileURL, connections, error) {
        if (!error) {
            this._callback(null, { status: 'completed', file: outputFileURL.absoluteString });
        }
        else {
            this._callback(error.localizedDescription);
        }
    };
    AVCaptureFileOutputRecordingDelegateImpl.prototype.captureOutputDidStartRecordingToOutputFileAtURLFromConnections = function (captureOutput, fileURL, connections) {
        this._callback(null, { status: 'started' });
    };
    return AVCaptureFileOutputRecordingDelegateImpl;
}(NSObject));
AVCaptureFileOutputRecordingDelegateImpl.ObjCProtocols = [AVCaptureFileOutputRecordingDelegate];
var AdvancedVideoView = (function (_super) {
    __extends(AdvancedVideoView, _super);
    function AdvancedVideoView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AdvancedVideoView.prototype.createNativeView = function () {
        return UIView.new();
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
    AdvancedVideoView.prototype.open = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.recorder.open(options).then(function (view) {
                dispatch_async(dispatch_get_current_queue(), function () {
                    view.frame = _this.nativeView.bounds;
                    _this.nativeView.layer.addSublayer(view);
                });
                resolve();
            }, function (err) {
                reject(err);
            });
        });
    };
    AdvancedVideoView.prototype.record = function (cb) {
        this.recorder.record(cb);
    };
    AdvancedVideoView.prototype.stop = function () {
        this.recorder.stop();
    };
    AdvancedVideoView.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var width = view_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var height = view_1.layout.getMeasureSpecSize(heightMeasureSpec);
        this.setMeasuredDimension(width, height);
    };
    return AdvancedVideoView;
}(view_1.View));
exports.AdvancedVideoView = AdvancedVideoView;
//# sourceMappingURL=advanced-video-recorder.js.map