"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var frame = require("ui/frame");
var fs = require("file-system");
var types = require("utils/types");
var listener;
var VideoRecorder = (function () {
    function VideoRecorder() {
    }
    VideoRecorder.prototype.record = function (options) {
        var _this = this;
        if (options === void 0) { options = { saveToGallery: false, hd: false, format: 'default', position: 'back', size: 0, duration: 0 }; }
        return new Promise(function (resolve, reject) {
            listener = null;
            var picker = UIImagePickerController.new();
            var sourceType = 1;
            picker.mediaTypes = [kUTTypeMovie];
            picker.sourceType = sourceType;
            options.saveToGallery = Boolean(options.saveToGallery) ? true : false;
            options.hd = Boolean(options.hd) ? true : false;
            picker.cameraCaptureMode = 1;
            picker.allowsEditing = false;
            picker.videoQuality = options.hd ? 0 : 2;
            picker.videoMaximumDuration = (types.isNumber(options.duration) && options.duration > 0) ? Number(options.duration) : Number.POSITIVE_INFINITY;
            if (options && options.saveToGallery) {
                var authStatus = PHPhotoLibrary.authorizationStatus();
                if (authStatus === 3) {
                    options.saveToGallery = true;
                }
            }
            if (options) {
                listener = UIImagePickerControllerDelegateImpl.initWithOwnerCallbackOptions(new WeakRef(_this), resolve, options);
            }
            else {
                listener = UIImagePickerControllerDelegateImpl.initWithCallback(resolve);
            }
            picker.delegate = listener;
            picker.modalPresentationStyle = 3;
            var topMostFrame = frame.topmost();
            if (topMostFrame) {
                var viewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
                if (viewController) {
                    viewController.presentViewControllerAnimatedCompletion(picker, true, null);
                }
            }
        });
    };
    return VideoRecorder;
}());
exports.VideoRecorder = VideoRecorder;
var UIImagePickerControllerDelegateImpl = (function (_super) {
    __extends(UIImagePickerControllerDelegateImpl, _super);
    function UIImagePickerControllerDelegateImpl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._format = "default";
        return _this;
    }
    UIImagePickerControllerDelegateImpl.initWithCallback = function (callback) {
        var delegate = new UIImagePickerControllerDelegateImpl();
        delegate._callback = callback;
        return delegate;
    };
    UIImagePickerControllerDelegateImpl.initWithOwnerCallbackOptions = function (owner, callback, options) {
        var delegate = new UIImagePickerControllerDelegateImpl();
        if (options) {
            delegate._saveToGallery = options.saveToGallery;
            delegate._format = options.format;
            delegate._hd = options.hd;
        }
        delegate._callback = callback;
        return delegate;
    };
    UIImagePickerControllerDelegateImpl.prototype.imagePickerControllerDidCancel = function (picker) {
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
        listener = null;
    };
    UIImagePickerControllerDelegateImpl.prototype.imagePickerControllerDidFinishPickingMediaWithInfo = function (picker, info) {
        var _this = this;
        if (info) {
            var currentDate = new Date();
            if (this._saveToGallery) {
                var source = info.objectForKey(UIImagePickerControllerMediaURL);
                if (this._format === "mp4") {
                    var asset = AVAsset.assetWithURL(source);
                    var preset = this._hd ? AVAssetExportPresetHighestQuality : AVAssetExportPresetLowQuality;
                    var session = AVAssetExportSession.exportSessionWithAssetPresetName(asset, preset);
                    session.outputFileType = AVFileTypeMPEG4;
                    var fileName = "videoCapture_" + +new Date() + ".mp4";
                    var path_1 = fs.path.join(fs.knownFolders.documents().path, fileName);
                    var nativePath_1 = NSURL.fileURLWithPath(path_1);
                    session.outputURL = nativePath_1;
                    session.exportAsynchronouslyWithCompletionHandler(function () {
                        var assetLibrary = ALAssetsLibrary.alloc().init();
                        assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(nativePath_1, function (file, error) {
                            if (!error) {
                                _this._callback();
                            }
                            fs.File.fromPath(path_1).remove();
                        });
                    });
                }
                else {
                    var assetLibrary = ALAssetsLibrary.alloc().init();
                    assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(source, function (file, error) {
                        if (!error) {
                            _this._callback();
                        }
                        else {
                            console.log(error.localizedDescription);
                        }
                    });
                }
            }
            else {
                var source_1 = info.objectForKey(UIImagePickerControllerMediaURL);
                if (this._format === "mp4") {
                    var asset = AVAsset.assetWithURL(source_1);
                    var preset = this._hd ? AVAssetExportPresetHighestQuality : AVAssetExportPresetLowQuality;
                    var session = AVAssetExportSession.exportSessionWithAssetPresetName(asset, preset);
                    session.outputFileType = AVFileTypeMPEG4;
                    var fileName = "videoCapture_" + +new Date() + ".mp4";
                    var path_2 = fs.path.join(fs.knownFolders.documents().path, fileName);
                    var nativePath = NSURL.fileURLWithPath(path_2);
                    session.outputURL = nativePath;
                    session.exportAsynchronouslyWithCompletionHandler(function () {
                        fs.File.fromPath(source_1.path).remove();
                        _this._callback({ file: path_2 });
                    });
                }
                else {
                    this._callback({ file: source_1.path });
                }
            }
            picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
            listener = null;
        }
    };
    ;
    return UIImagePickerControllerDelegateImpl;
}(NSObject));
UIImagePickerControllerDelegateImpl.ObjCProtocols = [UIImagePickerControllerDelegate];
exports.requestPermissions = function () {
    return new Promise(function (resolve, reject) {
        var authStatus = PHPhotoLibrary.authorizationStatus();
        if (authStatus === 0) {
            PHPhotoLibrary.requestAuthorization(function (auth) {
                if (auth === 3) {
                    resolve();
                }
            });
        }
        else if (authStatus !== 3) {
            reject();
        }
    });
};
//# sourceMappingURL=video-recorder.js.map