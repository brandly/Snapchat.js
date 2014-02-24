
(function(w, d) {
  'use strict';

  var
  utils = {
    hasTouch: 'ontouchstart' in d.documentElement,
    // thanks dude
    // https://gist.github.com/robtarr/1199770
    createVerticalRainbow: function(context, height) {
      var gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0,    "rgb(255,   0,   0)");
      gradient.addColorStop(0.15, "rgb(255,   0, 255)");
      gradient.addColorStop(0.33, "rgb(0,     0, 255)");
      gradient.addColorStop(0.49, "rgb(0,   255, 255)");
      gradient.addColorStop(0.67, "rgb(0,   255,   0)");
      gradient.addColorStop(0.84, "rgb(255, 255,   0)");
      gradient.addColorStop(1,    "rgb(255,   0,   0)");
      return gradient;
    },
    // thanks dude
    // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    relativeMouseCoords: function(event, el) {
      var totalOffsetX = 0,
          totalOffsetY = 0;

      do {
        totalOffsetX += el.offsetLeft - el.scrollLeft;
        totalOffsetY += el.offsetTop - el.scrollTop;
      } while(el = el.offsetParent);

      return {
        x: event.pageX - totalOffsetX,
        y: event.pageY - totalOffsetY
      }
    },
    css: function(element, styles) {
      for (var item in styles) {
        element.style[item] = styles[item];
      }
    },
    draw: function(context, start, end) {
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.closePath();
      context.stroke();
    },
    borderStyles: {
      border: '4px solid white',
      borderRadius: '5px',
      'box-shadow': '0 0 5px black'
    }
  },
  events = {
    down: utils.hasTouch ? 'touchstart' : 'mousedown',
    move: utils.hasTouch ? 'touchmove' : 'mousemove',
    up: utils.hasTouch ? 'touchend' : 'mouseup',
    out: utils.hasTouch ? 'touchcancel' : 'mouseout'
  },
  colorPicker = {
    element: d.createElement('canvas'),
    size: {
      width: 15,
      height: 200
    },
    init: function() {
      var context, el = colorPicker.element;
      this.context = context = el.getContext('2d');

      // size
      el.width = this.size.width;
      el.height = this.size.height;

      // rainbow
      this.context.fillStyle = utils.createVerticalRainbow(context, this.size.height);
      this.context.fillRect(0, 0, this.size.width, this.size.height);

      // events
      el.addEventListener(events.down, function(e) {
        colorPicker.setDrawingColor(e);
        function removeListeners(e) {
          el.removeEventListener(events.move, colorPicker.setDrawingColor);
          el.removeEventListener(events.up, removeListeners);
          el.removeEventListener(events.out, removeListeners);
        };
        el.addEventListener(events.move, colorPicker.setDrawingColor);
        el.addEventListener(events.up, removeListeners);
        el.addEventListener(events.out, removeListeners);
      });

      // styles
      utils.css(el, {
        position: 'absolute',
        top: '95px',
        right: '10px',
        zIndex: '1001',
        display: 'none'
      });
      utils.css(el, utils.borderStyles);

      // dom
      d.body.appendChild(el);
    },
    setDrawingColor: function(e) {
      var
      coords = utils.relativeMouseCoords(e, colorPicker.element),
      color = colorPicker.context.getImageData(0, Math.min(coords.y, colorPicker.size.height - 1), 1, 1).data;
      pencil.setCurrentColor(color);
    },
    isVisibile: function() {
      colorPicker.element.style.display === '';
    },
    show: function() {
      utils.css(colorPicker.element, {display: ''});
    },
    hide: function() {
      utils.css(colorPicker.element, {display: 'none'});
    }
  },
  pencil = {
    element: d.createElement('div'),
    init: function() {
      var el = pencil.element;

      // events
      el.addEventListener('click', function(e) {
        if (colorPicker.isVisibile()) {
          colorPicker.hide();
          bigCanvas.disable();
        } else {
          colorPicker.show();
          bigCanvas.enable();
        }
      });

      // styles
      utils.css(el, {
        width: '60px',
        height: '60px',
        border: '1px solid black',
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '1001'
      });
      utils.css(el, utils.borderStyles);
      pencil.refresh();

      // dom
      d.body.appendChild(el);
    },

    currentColor: [255, 0, 0],
    getCurrentColor: function() {
      return 'rgb(' + pencil.currentColor.join(',') + ')';
    },
    setCurrentColor: function(data) {
      for (var i = 0; i <3 ; i++) {
        pencil.currentColor[i] = data[i];
      }
      pencil.refresh();
      bigCanvas.context.strokeStyle = pencil.getCurrentColor();
    },
    refresh: function() {
      pencil.element.style.backgroundColor = pencil.getCurrentColor();
    }
  },
  bigCanvas = {
    element: d.createElement('canvas'),
    init: function() {
      var context, el = bigCanvas.element;
      this.context = context = this.element.getContext('2d');

      // size
      el.width = w.innerWidth;
      el.height = w.innerHeight;

      // events
      var previousCoords = null;
      el.addEventListener(events.down, function(e) {
        function drawMove(e) {
          var coords = utils.relativeMouseCoords(e, el);
          utils.draw(context, previousCoords, coords);
          previousCoords = coords;
        }

        function removeListeners(e) {
          el.removeEventListener(events.move, drawMove);
          el.removeEventListener(events.up, removeListeners);
        }

        previousCoords = utils.relativeMouseCoords(e, el);
        el.addEventListener(events.move, drawMove);
        el.addEventListener(events.up, removeListeners);
      });

      // style
      utils.css(el, {
        zIndex: '1000',
        position: 'absolute',
        top: 0,
        left: 0,
        'pointer-events': 'none',
      });
      context.lineWidth = 5;
      context.lineJoin = 'round';

      // dom
      d.body.appendChild(el);
    },
    enable: function() {
      utils.css(bigCanvas.element, {'pointer-events': ''});
    },
    disable: function() {
      utils.css(bigCanvas.element, {'pointer-events': 'none'});
    }
  };

  bigCanvas.init();
  pencil.init();
  colorPicker.init();

}).call(this, window, document);
