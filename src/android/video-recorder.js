"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var permissions = require("nativescript-permissions");
var app = require("application");
var RESULT_CANCELED = 0;
var RESULT_OK = -1;
var REQUEST_VIDEO_CAPTURE = 999;
var REQUEST_CODE_ASK_PERMISSIONS = 1000;
var ORIENTATION_UNKNOWN = -1;
var PERMISSION_DENIED = -1;
var PERMISSION_GRANTED = 0;
var MARSHMALLOW = 23;
var applicationModule = require("application");
var platform = require("platform");
var currentapiVersion = android.os.Build.VERSION.SDK_INT;
var VideoRecorder = (function () {
    function VideoRecorder() {
    }
    VideoRecorder.prototype.record = function (options) {
        return new Promise(function (resolve, reject) {
            options = options || {};
            var data = null;
            var file;
            options.size = options.size || 0;
            options.hd = options.hd ? 1 : 0;
            options.saveToGallery = options.saveToGallery || false;
            options.duration = options.duration || 0;
            options.explanation = options.explanation = "";
            var startRecording = function () {
                var intent = new android.content.Intent(android.provider.MediaStore.ACTION_VIDEO_CAPTURE);
                intent.putExtra(android.provider.MediaStore.EXTRA_VIDEO_QUALITY, options.hd);
                var fileName = "videoCapture_" + +new Date() + ".mp4";
                if (options.size > 0) {
                    intent.putExtra(android.provider.MediaStore.EXTRA_SIZE_LIMIT, options.size * 1024 * 1024);
                }
                if (!options.saveToGallery) {
                    var path = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).getAbsolutePath() + "/Camera/" + fileName;
                    file = new java.io.File(path);
                    intent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, file.toURI());
                }
                else {
                    var sdkVersionInt = parseInt(platform.device.sdkVersion);
                    if (sdkVersionInt > 21) {
                        var path = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).getAbsolutePath() + "/Camera/" + fileName;
                        file = new java.io.File(path);
                        var tempPictureUri = android.support.v4.content.FileProvider.getUriForFile(applicationModule.android.currentContext, applicationModule.android.nativeApp.getPackageName() + ".provider", file);
                        intent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);
                    }
                    else {
                        var path = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).getAbsolutePath() + "/Camera/" + fileName;
                        file = new java.io.File(path);
                        intent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, android.net.Uri.fromFile(file));
                    }
                }
                if (options.duration > 0) {
                    intent.putExtra(android.provider.MediaStore.EXTRA_DURATION_LIMIT, options.duration);
                }
                if (intent.resolveActivity(app.android.currentContext.getPackageManager()) != null) {
                    app.android.currentContext.startActivityForResult(intent, REQUEST_VIDEO_CAPTURE);
                    app.android.on(app.AndroidApplication.activityResultEvent, function (args) {
                        if (args.requestCode === REQUEST_VIDEO_CAPTURE && args.resultCode === RESULT_OK) {
                            if (options.saveToGallery) {
                                resolve({ file: file.toString() });
                            }
                            else {
                                resolve({ file: file.toString() });
                            }
                        }
                        else if (args.resultCode === RESULT_CANCELED) {
                            reject({ event: 'cancelled' });
                        }
                        else {
                            reject({ event: 'failed' });
                        }
                    });
                }
                else {
                    reject({ event: 'failed' });
                }
            };
            if (currentapiVersion >= MARSHMALLOW) {
                if (options.explanation.length > 0) {
                    if (permissions.hasPermission(android.Manifest.permission.CAMERA) && permissions.hasPermission(android.Manifest.permission.RECORD_AUDIO)) {
                        startRecording();
                    }
                    else {
                        exports.requestPermissions(options.explanation)
                            .then(function () {
                            startRecording();
                        })
                            .catch(function () {
                            reject({ event: 'camera permission needed' });
                        });
                    }
                }
                else {
                    if (permissions.hasPermission(android.Manifest.permission.CAMERA) && permissions.hasPermission(android.Manifest.permission.RECORD_AUDIO)) {
                        startRecording();
                    }
                    else {
                        exports.requestPermissions(exports.requestPermissions)
                            .then(function () {
                            startRecording();
                        })
                            .catch(function () {
                            reject({ event: 'camera permission needed' });
                        });
                    }
                }
            }
            else {
                startRecording();
            }
        });
    };
    return VideoRecorder;
}());
exports.VideoRecorder = VideoRecorder;
exports.requestPermissions = function (options) {
    return new Promise(function (resolve, reject) {
        if (currentapiVersion >= MARSHMALLOW) {
            if (options.explanation.length > 0) {
                permissions.requestPermissions([android.Manifest.permission.CAMERA, android.Manifest.permission.RECORD_AUDIO], options.explanation)
                    .then(function () {
                    resolve();
                })
                    .catch(function () {
                    reject();
                });
            }
            else {
                permissions.requestPermissions([android.Manifest.permission.CAMERA, android.Manifest.permission.RECORD_AUDIO])
                    .then(function () {
                    resolve();
                })
                    .catch(function () {
                    reject();
                });
            }
        }
        else {
            resolve();
        }
    });
};
//# sourceMappingURL=video-recorder.js.map