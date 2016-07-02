(function (angular, _) {
    'use strict';

    angular.module('aquasketch.app', ['ngSanitize', 'ngTouch', 'aquasketch.components'])
        .constant('_', _);
})(window.angular, window._);

(function(angular) {
    'use strict';

    angular.module('aquasketch.app')
        .controller('MainController', function ($scope) {
            var ctrl = $scope;
            var drawing = ctrl.drawing = {
                layers: []
            };

            ctrl.addLayer = function () {
                var layer = {
                    id: drawing.layers.length,
                    name: 'Layer' + drawing.layers.length,
                    visible: true,
                    lines: []
                };
                drawing.layers.push(layer);
                drawing.activeLayer = layer.id;
            };
            ctrl.addLayer();
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
                    var nGapsVertical =Math.floor(height / gapVertical);

                    var drawing = scope.drawing;
                    var layers = drawing.layers;

                    ctx.translate(0.5, 0.5);

                    var repaint = _.throttle(function () {
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

                        ctx.lineWidth = 1.0;
                        ctx.lineJoin = 'round';
                        ctx.lineCap = 'round';
                        _.forEach(layers, function (layer) {
                            if(!layer.visible) return;
                            _.forEach(layer.lines, function (line) {
                                if(line.points.length) {
                                    ctx.beginPath();
                                    var points = line.points;
                                    var i;
                                    for (i = 0; i < points.length - 2; i++) {
                                        var point = points[i];
                                        if (i == 0) {
                                            ctx.moveTo(point[0], point[1]);
                                        } else {
                                            var c = (points[i][0] + points[i + 1][0]) / 2;
                                            var d = (points[i][1] + points[i + 1][1]) / 2;

                                            ctx.quadraticCurveTo(points[i][0], points[i][1], c, d);
//                                                ctx.lineTo(point[0], point[1]);
                                        }
                                    }
                                    ctx.quadraticCurveTo(points[i][0], points[i][1], c, d);
                                    ctx.stroke();
                                }
                            });
                        });
                    }, 10);
                    repaint();

                    var layer = function() {
                        return _.find(drawing.layers, { id: drawing.activeLayer });
                    };

                    var mouseDown = false;
                    var startX, startY;
                    canvas.addEventListener("mousemove", _.throttle(function (e) {
                        if (mouseDown) {
                            var rect = canvas.getBoundingClientRect();
                            var x = e.clientX - rect.left;
                            var y = e.clientY - rect.top;
                            if (e.altKey) {
                                y = startY;
                            }
                            if (e.shiftKey) {
                                x = startX;
                            }
                            layer().lines[layer().lines.length-1].points.push([x, y]);
                            repaint();
                        }
                    }, 24), false);
                    canvas.addEventListener("mousedown", function (e) {
                        mouseDown = true;
                        var rect = canvas.getBoundingClientRect();
                        startX = e.clientX - rect.left;
                        startY = e.clientY - rect.top;
                        layer().lines.push({ points: [[startX, startY]]});
                        repaint();
                    }, false);
                    canvas.addEventListener("mouseup", function (e) {
                        mouseDown = false;

                    }, false);
                    canvas.addEventListener("mouseout", function (e) {
//                            findxy('out', e)
                    }, false);
                }
            };
        });
})(window.angular);