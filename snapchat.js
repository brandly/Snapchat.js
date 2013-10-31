
(function(w, d) {
  'use strict';

  var
  canvas = d.createElement('canvas'),
  context = canvas.getContext('2d'),
  pencil = d.createElement('div'),

  config = {

  },

  currentColor = [255, 0, 0];
  currentColor.toString = function() {
    return 'rgb(' + currentColor.join(',') + ')';
  };
  currentColor.set = function (data) {
    for (var i = 0; i <3 ; i++) {
      currentColor[i] = data[i];
    }
  };

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

  canvas.width = 15;
  canvas.height = 200;
  context.fillStyle = createVerticalRainbow(canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);

  function setDrawingColor(e) {
    var
    coords = relativeMouseCoords(e, canvas);
    currentColor.set( context.getImageData(0, Math.min(coords.y, canvas.height - 1), 1, 1).data );
    pencil.style.backgroundColor = currentColor.toString();
  };

  canvas.onmousedown = function(e) {
    setDrawingColor(e);
    canvas.onmousemove = setDrawingColor;
    canvas.onmouseout = canvas.onmouseup = function(e) {
      canvas.onmousemove = canvas.onmouseout = canvas.onmouseup = undefined;
    };
  };

  pencil.onclick = function(e) {
    canvas.style.display = (canvas.style.display === 'none') ? '' : 'none';
  };

  canvas.style.display = 'none';

  var
  bigCanvas = d.createElement('canvas'),
  bigContext = bigCanvas.getContext('2d');

  bigCanvas.width = w.innerWidth;
  bigCanvas.height = w.innerHeight;

  var last = null;
  function draw(element, coords) {
    bigContext.beginPath();
    bigContext.strokeStyle = currentColor.toString();
    bigContext.lineWidth = 5;
    bigContext.lineJoin = 'round';
    bigContext.moveTo(last.x, last.y);
    bigContext.lineTo(coords.x, coords.y);
    bigContext.closePath();
    bigContext.stroke();
  }

  bigCanvas.onmousedown = function(e) {
    last = relativeMouseCoords(e, bigCanvas);

    bigCanvas.onmousemove = function(e) {
      var coords = relativeMouseCoords(e, bigCanvas);
      draw(bigCanvas, coords);
      last = relativeMouseCoords(e, bigCanvas);
    };
    bigCanvas.onmouseup = function(e) {
      bigCanvas.onmousemove = bigCanvas.onmouseup = undefined;
    };
  };

  applyStyles(bigCanvas, {
    position: 'absolute',
    top: 0,
    left: 0
  });

  applyStyles(pencil, {
    width: 60,
    height: 60,
    border: '1px solid black',
    position: 'absolute',
    top: '10px',
    right: '10px'
  });

  applyStyles(canvas, {
    position: 'absolute',
    top: '95px',
    right: '10px'
  });

  var
  borderStyles = {
    border: '4px solid white',
    borderRadius: '5px',
    'box-shadow': '0 0 5px black'
  };
  applyStyles(canvas, borderStyles);
  applyStyles(pencil, borderStyles);

  pencil.style.backgroundColor = currentColor.toString();

  d.body.appendChild(bigCanvas);
  d.body.appendChild(pencil);
  d.body.appendChild(canvas);

}).call(this, window, document);
