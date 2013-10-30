
(function(w, d) {
  'use strict';

  var
  canvas = d.createElement('canvas'),
  context = canvas.getContext('2d'),
  pencil = d.createElement('div'),
  currentColor = [0, 0, 0];

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

  function applyStyles(element, styles) {
    for (var item in styles) {
      element.style[item] = styles[item];
    }
  }
  applyStyles(pencil, {
    width: 100,
    height: 100,
    border: '1px solid black'
  });

  canvas.width = 10;
  context.fillStyle = createVerticalRainbow(canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);

  function setDrawingColor(e) {
    var
    coords = relativeMouseCoords(e, canvas),
    data = context.getImageData(coords.x, coords.y, 1, 1).data;
    currentColor = [data[0], data[1], data[2]];
    pencil.style.backgroundColor= 'rgb(' + currentColor.join(',') + ')';
  };

  canvas.onmousedown = function(e) {
    setDrawingColor(e);
    canvas.onmousemove = setDrawingColor;
    w.onmouseup = function(e) {
      canvas.onmousemove = w.onmouseup = undefined;
    };
  };

  pencil.onclick = function(e) {
    canvas.style.display = (canvas.style.display === 'none') ? 'block' : 'none';
  };

  canvas.style.display = 'none';

  var
  bigCanvas = d.createElement('canvas'),
  bigContext = bigCanvas.getContext('2d');

  bigCanvas.width = w.innerWidth;
  bigCanvas.height = w.innerHeight;

  bigCanvas.onmousemove = function(e) {

  };

  d.body.appendChild(pencil);
  d.body.appendChild(canvas);
  d.body.appendChild(bigCanvas);

}).call(this, window, document);
