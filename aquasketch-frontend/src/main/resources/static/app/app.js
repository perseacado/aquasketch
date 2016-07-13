(function (angular, _) {
    'use strict';

    angular.module('aquasketch.app', [
        'ngSanitize',
        'colorpicker.module',
        'rzModule', 'ngFileUpload', 'ngTouch', 'ui.router', 'aquasketch.components', 'aquasketch.services'])
        .constant('_', _);
})(window.angular, window._);

(function (angular, ctx) {
    angular.module('aquasketch.app')
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/");

            $stateProvider
                .state('list', {
                    url: '/',
                    controller: function (sketches, SketchService, $state) {
                        var ctrl = this;
                        ctrl.sketches = sketches;

                        ctrl.newSketch = function () {
                            SketchService.createSketch().then(function (sketch) {
                                $state.go('sketch', {sketchId: sketch.id});
                            });
                        };
                    },
                    controllerAs: 'ctrl',
                    resolve: {
                        sketches: function (SketchService) {
                            return SketchService.findAll();
                        }
                    },
                    templateUrl: ctx.contextPath + 'app/list.html'
                })
                .state('sketch', {
                    url: '/sketch/{sketchId}',
                    controller: 'SketchController',
                    controllerAs: 'ctrl',
                    resolve: {
                        sketch: function (SketchService, $stateParams) {
                            return SketchService.findOne($stateParams.sketchId);
                        }
                    },
                    templateUrl: ctx.contextPath + 'app/sketch.html'
                })
            ;
        });
})(window.angular, window.ctx);

(function (angular) {
    'use strict';

    angular.module('aquasketch.app')
        .controller('SketchController', function ($scope, sketch, SketchService, Upload) {
            var ctrl = this;

            ctrl.drawing = sketch;
            ctrl.sketch = sketch;

            ctrl.changeName = function () {
                var name = prompt('Change name', ctrl.sketch.name);
                if (name) {
                    ctrl.sketch.name = name;
                }
            };

            ctrl.changeLayerName = function (layer) {
                var name = prompt('Change name', layer.name);
                if (name) {
                    layer.name = name;
                }
            };

            ctrl.addLayer = function () {
                var layer = {
                    id: new Date().getTime(),
                    name: 'Layer' + ctrl.drawing.layers.length,
                    visible: true,
                    lines: []
                };
                ctrl.drawing.layers.push(layer);
                ctrl.drawing.activeLayer = layer.id;
            };

            ctrl.removeLayer = function (layer) {
                if (confirm('Sicher?')) {
                    ctrl.drawing.layers = _.without(ctrl.drawing.layers, layer);
                }
            };

            ctrl.resetSketch = function () {
                if (confirm('Sicher?')) {
                    ctrl.drawing.layers = [];
                    delete ctrl.drawing.activeLayer;
                    ctrl.addLayer();
                }
            };

            ctrl.addImage = function (file) {
                if (file) {
                    Upload.upload({
                        url: 'api/media',
                        data: {file: file}
                    }).then(function (resp) {
                        var layer = _.find(ctrl.sketch.layers, {id: ctrl.sketch.activeLayer});
                        layer.data = layer.data || [];
                        layer.data.push(resp.data.id);
                    }, function (resp) {
                        console.log('Error status: ' + resp.status);
                    }, function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                    });
                }
            };

            $scope.$watch(function () {
                return sketch;
            }, _.debounce(function (drawing) {
                SketchService.save(drawing);
            }, 500), true);
        })
        .controller('MainController', function ($scope, SketchService, $http, $window, _) {
            var ctrl = $scope;
            $http.get('/user').success(function (user) {
                ctrl.user = user;
            });

            ctrl.logout = function () {
                $http.post('/logout', {}).success(function () {
                    $window.location.href = '/login';
                }).error(function (data) {
                });
            };
        });
})(window.angular);

(function (angular) {
    'use strict';

    angular.module('aquasketch.services', ['LocalStorageModule'])
        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider.setPrefix('aquasketch');
        })
        .service('SketchService', function ($http, localStorageService) {
            this.createSketch = function () {
                return $http.get('/sketches/new').then(function (response) {
                    return response.data;
                });
            };
            this.findOne = function (id) {
                return $http.get('/sketches/' + id).then(function (response) {
                    return response.data;
                });
            };
            this.findAll = function () {
                return $http.get('/sketches').then(function (response) {
                    return response.data;
                });
            };
            this.save = function (sketch) {
                $http.post('/sketches', sketch).then(function (response) {
                }, function (response) {
                });
                localStorageService.set(sketch.id, sketch);
            };
        });
})(window.angular);


(function (angular) {
    'use strict';

    angular.module('aquasketch.components', [])
        .directive('asDrawPanel', function (_) {
            return {
                scope: {
                    drawing: '='
                },
                link: function (scope, elem, attrs) {
                    var ratio = elem.width() / elem.height();
                    var width = elem.width();
                    var height = elem.height();

                    elem.css({
                        position: 'relative'
                    });

                    var css = {
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    };
                    var main_canvas = angular.element("<canvas id='main_canvas'>").css(css)[0];
                    elem.append(main_canvas);
                    var main_ctx = main_canvas.getContext("2d");
                    var helper = angular.element('#canvas-helper')[0];
                    main_canvas.width = width;
                    main_canvas.height = height;
                    main_ctx.translate(0.5, 0.5);
                    helper.width = width;
                    helper.height = height;

                    var gapHorizontal = 15;
                    var nGapsHorizontal = Math.floor(width / gapHorizontal);
                    var gapVertical = gapHorizontal;
                    var nGapsVertical = Math.floor(height / gapVertical);

                    var layer_canvas = {};
                    var getCanvas = function (layer) {
                        var canv = layer_canvas[layer.id];
                        if (!canv) {
                            var lcanvas = angular.element("<canvas class='layer" + layer.id + "_lines'>").css(css)[0];
                            var lcanvas_img = angular.element("<canvas class='layer" + layer.id + "_img'>").css(css)[0];
                            lcanvas.width = width;
                            lcanvas_img.width = width;
                            lcanvas.height = height;
                            lcanvas_img.height = height;
                            var lctx = lcanvas.getContext("2d");
                            var lctx_img = lcanvas_img.getContext("2d");
                            lctx.lineJoin = 'round';
                            lctx.lineCap = 'round';
                            canv = {
                                hide: function () {
                                    $(lcanvas).hide();
                                    $(lcanvas_img).hide();
                                },
                                show: function () {
                                    $(lcanvas).show();
                                    $(lcanvas_img).show();
                                },
                                remove: function () {
                                    $(lcanvas).remove();
                                    $(lcanvas_img).remove();
                                },
                                canvas: lcanvas,
                                ctx: lctx,
                                img: {
                                    canvas: lcanvas_img,
                                    ctx: lctx_img
                                }
                            };
                            layer_canvas[layer.id] = canv;
                            lctx.translate(0.5, 0.5);
                            $(lcanvas_img).insertBefore($(main_canvas));
                            $(lcanvas).insertBefore($(main_canvas));
                        }
                        return canv;
                    };

                    var isOnLine = function (x1, y1, x2, y2, px, py) {
                        var dxc = px - x1;
                        var dyc = py - y1;
                        var dxl = x2 - x1;
                        var dyl = y2 - y1;
                        var cross = dxc * dyl - dyc * dxl;
                        if (Math.abs(cross) > 50.0)
                            return false;
                        if (Math.abs(dxl) >= Math.abs(dyl))
                            return dxl > 0 ?
                            x1 <= px && px <= x2 :
                            x2 <= px && px <= x1;
                        else
                            return dyl > 0 ?
                            y1 <= py && py <= y2 :
                            y2 <= py && py <= y1;
                    }

                    var deletePointsIn = function (line, x1, y1, x2, y2) {
                        // console.log("delete points");
                        var newLines = [];
                        var currentLine = {
                            points: []
                        };
                        newLines.push(currentLine);
                        for (var i = 0; i < line.points.length; i++) {
                            if (i < line.points.length - 1 && isOnLine(
                                    line.points[i][0], line.points[i][1],
                                    line.points[i + 1][0], line.points[i + 1][1],
                                    (x1 + x2) / 2, (y1 + y2) / 2)) {
                                currentLine.points.push(line.points[i])
                                currentLine = {
                                    points: []
                                };
                                newLines.push(currentLine);
                            } else {
                                currentLine.points.push(line.points[i]);
                            }
                        }

                        // _.forEach(line.points, function (point) {
                        //     if (point[0] >= x1 && point[1] >= y1
                        //         && point[0] <= x2 && point[1] <= y2) {
                        //         currentLine = {
                        //             points: []
                        //         };
                        //         newLines.push(currentLine);
                        //     } else {
                        //         currentLine.points.push(point);
                        //     }
                        // });
                        return newLines;
                    };

                    var deletePointsInLayer = _.throttle(function (layer, x1, y1, x2, y2) {
                        layer.lines = _.flatMap(layer.lines, function (line) {
                            return deletePointsIn(line, x1, y1, x2, y2);
                        });
                    }, 10);

                    var layer = function () {
                        return _.find(scope.drawing.layers, {id: scope.drawing.activeLayer});
                    };

                    var layer_img_tmp = {};
                    var repaint_layer = function (layer) {
                        var layer_ctx = getCanvas(layer);
                        var ctx = layer_ctx.ctx;
                        var canvas_img = layer_ctx.img.canvas;
                        var ctx_img = layer_ctx.img.ctx;
                        ctx.clearRect(0, 0, width, height);
                        if (!layer.visible) {
                            layer_ctx.hide();
                        } else {
                            layer_ctx.show();
                            var img_tmp = layer_img_tmp[layer.id];
                            if (!img_tmp || angular.toJson(img_tmp) != angular.toJson(layer.data)) {
                                ctx_img.clearRect(0, 0, width, height);
                                _.forEach(layer.data || [], function (data) {
                                    var image = new Image();
                                    image.onload = function () {
                                        var ratio = image.height / image.width;
                                        ctx_img.drawImage(image, 0, 0, canvas_img.width, canvas_img.width * ratio);
                                    };
                                    image.src = '/api/media/' + data;
                                });
                                layer_img_tmp[layer.id] = angular.copy(layer.data);
                            }
                            // var odd = false;
                            _.forEach(layer.lines, function (line) {
                                if (line.points.length) {
                                    var pen = line.tools.pen || {
                                            size: 1.0
                                        };
                                    ctx.lineWidth = pen.size || 1.0;
                                    ctx.strokeStyle = pen.color || '#000000';
                                    // odd = !odd;
                                    // var tmpColor = line.color;
                                    // if(odd) {
                                    //     ctx.strokeStyle = "#ff0000";
                                    // } else {
                                    //     ctx.strokeStyle = "#00ff00";
                                    // }
                                    ctx.beginPath();
                                    var ps = _.flatMap(line.points, function (point) {
                                        return point;
                                    });
                                    ctx.moveTo(ps[0], ps[1]);
                                    ctx.curve(ps, 0.5, 3);
                                    ctx.stroke();
                                    // ctx.colorStyle = tmpColor;
                                }
                            });
                        }
                    };

                    var repaint = function () {
                        main_ctx.clearRect(0, 0, width, height);

                        if (scope.drawing.showGrid) {
                            main_ctx.lineJoin = 'round';
                            main_ctx.lineCap = 'round';
                            main_ctx.lineWidth = 0.10;
                            for (var i = 0; i <= nGapsHorizontal; i++) {
                                main_ctx.beginPath();
                                main_ctx.moveTo(i * gapHorizontal, 0);
                                main_ctx.lineTo(i * gapHorizontal, height);
                                main_ctx.stroke();
                            }
                            for (var i = 0; i <= nGapsVertical; i++) {
                                main_ctx.beginPath();
                                main_ctx.moveTo(0, i * gapVertical);
                                main_ctx.lineTo(width, i * gapVertical);
                                main_ctx.stroke();
                            }
                        }

                        main_ctx.lineWidth = 1.3;
                        main_ctx.lineJoin = 'round';
                        main_ctx.lineCap = 'round';
                        // _.forEach(scope.drawing.layers, function (layer) {
                        repaint_layer(layer());
                        // });
                    };

                    _.forEach(scope.drawing.layers, function (layer) {
                        repaint_layer(layer);
                    });

                    scope.$watch('drawing', function (sketch) {
                        var layer_ids = _.map(sketch.layers, 'id');
                        _.forEach(layer_canvas, function (lc, id) {
                            if (layer_ids.indexOf(parseInt(id)) === -1
                                && layer_ids.indexOf(id) === -1) {
                                lc.remove();
                            }
                        });
                        repaint();
                    }, true);

                    var mouseDown = false;
                    var startX, startY, lastX, lastY;
                    elem[0].addEventListener("mousemove", _.throttle(function (e) {
                        if (scope.drawing.eraser && mouseDown) {
                            var rect = elem[0].getBoundingClientRect();
                            var x = e.clientX - rect.left;
                            var y = e.clientY - rect.top;
                            scope.$apply(function () {
                                deletePointsInLayer(layer(), x - 4, y - 4, x + 4, y + 4);
                            });
                        } else if (mouseDown) {
                            var rect = elem[0].getBoundingClientRect();
                            var x = e.clientX - rect.left;
                            var y = e.clientY - rect.top;
                            var d = Math.sqrt(Math.pow(lastX - x, 2) + Math.pow(lastY - y, 2));
                            if (d > 1) {
                                lastX = x;
                                lastY = y;
                                if (e.altKey) {
                                    y = startY;
                                }
                                if (e.shiftKey) {
                                    x = startX;
                                }
                                scope.$apply(function () {
                                    layer().lines[layer().lines.length - 1].points.push([x, y]);
                                });
                            }
                        }
                    }, 10), false);
                    elem[0].addEventListener("mousedown", function (e) {
                        mouseDown = true;
                        if (scope.drawing.eraser) {
                        } else {
                            var rect = elem[0].getBoundingClientRect();
                            lastX = startX = e.clientX - rect.left;
                            lastY = startY = e.clientY - rect.top;
                            scope.$apply(function () {
                                var line = {points: [[startX, startY]]};
                                line.tools = angular.copy(scope.drawing.tools);
                                layer().lines.push(line);
                            });
                        }
                    }, false);
                    elem[0].addEventListener("mouseup", function (e) {
                        mouseDown = false;
                        if (scope.drawing.eraser) {
                        } else {
                            var rect = elem[0].getBoundingClientRect();
                            var x = e.clientX - rect.left;
                            var y = e.clientY - rect.top;
                            if (e.altKey) {
                                y = startY;
                            }
                            if (e.shiftKey) {
                                x = startX;
                            }
                            scope.$apply(function () {
                                layer().lines[layer().lines.length - 1].points.push([x, y]);
                            });
                        }
                    }, false);
                    elem[0].addEventListener("mouseout", function (e) {
//                            findxy('out', e)
                    }, false);
                }
            };
        });
})(window.angular);