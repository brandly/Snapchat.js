
(function(w, d) {
  'use strict';

  var
  colorPicker = d.createElement('canvas'),
  context = colorPicker.getContext('2d'),
  pencil = d.createElement('div'),

  config = {

  },

  hasTouch = 'ontouchstart' in d.documentElement,
  events = {
    down: hasTouch ? 'touchstart' : 'mousedown',
    move: hasTouch ? 'touchmove' : 'mousemove',
    up: hasTouch ? 'touchend' : 'mouseup',
    out: hasTouch ? 'touchcancel' : 'mouseout'
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

  colorPicker.width = 15;
  colorPicker.height = 200;
  context.fillStyle = createVerticalRainbow(colorPicker.height);
  context.fillRect(0, 0, colorPicker.width, colorPicker.height);

  function setDrawingColor(e) {
    var
    coords = relativeMouseCoords(e, colorPicker);
    currentColor.set( context.getImageData(0, Math.min(coords.y, colorPicker.height - 1), 1, 1).data );
    pencil.style.backgroundColor = currentColor.toString();
  }

  colorPicker.addEventListener(events.down, function(e) {
    setDrawingColor(e);
    function removeListeners(e) {
      colorPicker.removeEventListener(events.move, setDrawingColor);
      colorPicker.removeEventListener(events.up, removeListeners);
      colorPicker.removeEventListener(events.out, removeListeners);
    };
    colorPicker.addEventListener(events.move, setDrawingColor);
    colorPicker.addEventListener(events.up, removeListeners);
    colorPicker.addEventListener(events.out, removeListeners);
  });

  pencil.addEventListener('click', function(e) {
    if (colorPicker.style.display === 'none') {
      applyStyles(colorPicker, {display: ''});
      applyStyles(bigCanvas, {'pointer-events': ''});
    } else {
      applyStyles(colorPicker, {display: 'none'});
      applyStyles(bigCanvas, {'pointer-events': 'none'});
    }
  });

  colorPicker.style.display = 'none';

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

  bigCanvas.addEventListener(events.down, function(e) {
    function drawMove(e) {
      var coords = relativeMouseCoords(e, bigCanvas);
      draw(bigCanvas, coords);
      last = relativeMouseCoords(e, bigCanvas);
    }

    function removeListeners(e) {
      bigCanvas.removeEventListener(events.move, drawMove);
      bigCanvas.removeEventListener(events.up, removeListeners);
    }

    last = relativeMouseCoords(e, bigCanvas);
    bigCanvas.addEventListener(events.move, drawMove);
    bigCanvas.addEventListener(events.up, removeListeners);
  });

  applyStyles(bigCanvas, {
    position: 'absolute',
    top: 0,
    left: 0,
    'pointer-events': 'none'
  });

  applyStyles(pencil, {
    width: 60,
    height: 60,
    border: '1px solid black',
    position: 'absolute',
    top: '10px',
    right: '10px'
  });

  applyStyles(colorPicker, {
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
  applyStyles(colorPicker, borderStyles);
  applyStyles(pencil, borderStyles);

  pencil.style.backgroundColor = currentColor.toString();

  d.body.appendChild(bigCanvas);
  d.body.appendChild(pencil);
  d.body.appendChild(colorPicker);

}).call(this, window, document);
