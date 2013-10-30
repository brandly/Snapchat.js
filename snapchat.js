
(function(w, d) {
  'use strict';

  var
  canvas = d.createElement('canvas'),
  context = canvas.getContext('2d');

  canvas.width = 10;

  function createVerticalRainbow(height) {
    // thanks dude
    // https://gist.github.com/robtarr/1199770
    var gradient = context.createLinearGradient(0, 0, 0, height);

    gradient.addColorStop(0,    "rgb(255,   0,   0)");
    gradient.addColorStop(0.15, "rgb(255,   0, 255)");
    gradient.addColorStop(0.33, "rgb(0,     0, 255)");
    gradient.addColorStop(0.49, "rgb(0,   255, 255)");
    gradient.addColorStop(0.67, "rgb(0,   255,   0)");
    gradient.addColorStop(0.84, "rgb(255, 255,   0)");
    gradient.addColorStop(1,    "rgb(255,   0,   0)");

    return gradient;
  }

  function relativeMouseCoords(event, currentElement) {
    // thanks dude
    // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
  }

  context.fillStyle = createVerticalRainbow(canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);

  canvas.onmousedown = function(e) {
    var coords = relativeMouseCoords(e, canvas);
    var data = context.getImageData(coords.x, coords.y, 1, 1).data;
    d.body.style.backgroundColor= 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';
  };

  d.body.appendChild(canvas);

}).call(this, window, document);
