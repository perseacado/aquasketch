(function (angular, _) {
    'use strict';

    angular.module('aquasketch.app', ['ngSanitize', 'ngTouch', 'aquasketch.components', 'aquasketch.services'])
        .constant('_', _);
})(window.angular, window._);

(function (angular) {
    'use strict';

    angular.module('aquasketch.app')
        .controller('MainController', function ($scope, SketchService, _) {
            var ctrl = $scope;

            ctrl.addLayer = function () {
                var layer = {
                    id: ctrl.drawing.layers.length,
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
                    ctrl.drawing = {
                        id: 1,
                        layers: []
                    };
                    ctrl.addLayer();
                }
            };

            ctrl.drawing = SketchService.findOne(1);
            if (!ctrl.drawing) {
                ctrl.drawing = {
                    id: 1,
                    layers: []
                };
                ctrl.addLayer();
            }
            $scope.$watch('drawing', function (drawing) {
                SketchService.save(drawing);
            }, true);
        });
})(window.angular);

(function (angular) {
    'use strict';

    angular.module('aquasketch.services', ['LocalStorageModule'])
        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider.setPrefix('aquasketch');
        })
        .service('SketchService', function (localStorageService) {
            this.findOne = function (id) {
                return localStorageService.get(id);
            };
            this.save = function (sketch) {
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
                    var canvas = elem[0];
                    var ctx = canvas.getContext('2d');
                    canvas.width = width;
                    canvas.height = height;

                    var gapHorizontal = 15;
                    var nGapsHorizontal = Math.floor(width / gapHorizontal);
//                            var gapVertical = gapHorizontal * ratio;
                    var gapVertical = gapHorizontal;
                    var nGapsVertical = Math.floor(height / gapVertical);

                    ctx.translate(0.5, 0.5);

                    var repaint = function () {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        ctx.lineJoin = 'round';
                        ctx.lineCap = 'round';
                        ctx.lineWidth = 0.10;
                        for (var i = 0; i <= nGapsHorizontal; i++) {
                            ctx.beginPath();
                            ctx.moveTo(i * gapHorizontal, 0);
                            ctx.lineTo(i * gapHorizontal, height);
                            ctx.stroke();
                        }
                        for (var i = 0; i <= nGapsVertical; i++) {
                            ctx.beginPath();
                            ctx.moveTo(0, i * gapVertical);
                            ctx.lineTo(width, i * gapVertical);
                            ctx.stroke();
                        }

                        ctx.lineWidth = 1.3;
                        ctx.lineJoin = 'round';
                        ctx.lineCap = 'round';
                        _.forEach(scope.drawing.layers, function (layer) {
                            if (!layer.visible) return;
                            _.forEach(layer.lines, function (line) {
                                if (line.points.length) {
                                    ctx.beginPath();
                                    var ps = _.flatMap(line.points, function (point) {
                                        return point;
                                    });
                                    ctx.moveTo(ps[0], ps[1]);
                                    ctx.curve(ps, 0.5, 3);
//                                     var i;
//                                     for (i = 0; i < points.length - 2; i++) {
//                                         var point = points[i];
//                                         if (i == 0) {
//                                             ctx.moveTo(point[0], point[1]);
//                                         } else {
//                                             var c = (points[i][0] + points[i + 1][0]) / 2;
//                                             var d = (points[i][1] + points[i + 1][1]) / 2;
//
//                                             ctx.quadraticCurveTo(points[i][0], points[i][1], c, d);
// //                                                ctx.lineTo(point[0], point[1]);
//                                         }
//                                     }
//                                     ctx.quadraticCurveTo(points[i][0], points[i][1], c, d);
                                    ctx.stroke();
                                }
                            });
                        });
                    };
                    //repaint();
                    scope.$watch('drawing', function () {
                        repaint();
                    }, true);

                    var layer = function () {
                        return _.find(scope.drawing.layers, {id: scope.drawing.activeLayer});
                    };

                    var mouseDown = false;
                    var startX, startY, lastX, lastY;
                    canvas.addEventListener("mousemove", _.throttle(function (e) {
                        if (mouseDown) {
                            var rect = canvas.getBoundingClientRect();
                            var x = e.clientX - rect.left;
                            var y = e.clientY - rect.top;
                            var d = Math.sqrt(Math.pow(lastX - x, 2) + Math.pow(lastY - y, 2));
                            if (d > 4) {
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
                    }, 24), false);
                    canvas.addEventListener("mousedown", function (e) {
                        mouseDown = true;
                        var rect = canvas.getBoundingClientRect();
                        lastX = startX = e.clientX - rect.left;
                        lastY = startY = e.clientY - rect.top;
                        scope.$apply(function () {
                            layer().lines.push({points: [[startX, startY]]});
                        });
                    }, false);
                    canvas.addEventListener("mouseup", function (e) {
                        mouseDown = false;
                        var rect = canvas.getBoundingClientRect();
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
                    }, false);
                    canvas.addEventListener("mouseout", function (e) {
//                            findxy('out', e)
                    }, false);
                }
            };
        });
})(window.angular);