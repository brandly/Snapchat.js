
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
      var bodyRect = d.body.getBoundingClientRect();
      var totalOffsetX = bodyRect.left,
          totalOffsetY = bodyRect.top;

      do {
        totalOffsetX += el.offsetLeft - el.scrollLeft;
        totalOffsetY += el.offsetTop - el.scrollTop;
      } while(el = el.offsetParent);

      return {
        x: event.pageX - totalOffsetX - w.scrollX,
        y: event.pageY - totalOffsetY - w.scrollY
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
      colorPicker.context = context = el.getContext('2d');

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
        position: 'fixed',
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
      return colorPicker.element.style.display === '';
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
          undo.hide();
        } else {
          colorPicker.show();
          bigCanvas.enable();
          undo.refresh();
        }
      });

      // icon
      // thanks P.J. Onori
      // http://thenounproject.com/term/pencil/2870/
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">'
                   +   '<path style="fill:white;" d="M92.676,7.324C87.805,2.441,81.408,0,75,0c-6.396,0-12.793,2.441-17.676,7.324L0.098,64.551L0,100  h35.352l57.324-57.324C102.441,32.91,102.441,17.09,92.676,7.324z M30.176,87.5H25V75H12.573l0.013-5.249l53.576-53.589l0,0  l17.676,17.676l0,0L30.176,87.5z"/>'
                   + '</svg>';

      // styles
      utils.css(el, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '6px',
        zIndex: '1001',
        lineHeight: '1',
        cursor: 'pointer'
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
    },
    refresh: function() {
      var currentColor = pencil.getCurrentColor();
      utils.css(pencil.element, {
          backgroundColor: currentColor
      });
      bigCanvas.setColor(currentColor);
    }
  },
  bigCanvas = {
    element: d.createElement('canvas'),
    history: [],
    init: function() {
      var context, el = bigCanvas.element;
      bigCanvas.context = context = this.element.getContext('2d');

      // size
      el.width = w.innerWidth;
      el.height = d.scrollingElement.offsetHeight;

      // events
      var previousCoords = null;
      el.addEventListener(events.down, function(e) {
        // coords for a line
        var line = [];
        line.color = pencil.getCurrentColor();

        function drawMove(e) {
          var coords = utils.relativeMouseCoords(e, el);
          utils.draw(context, previousCoords, coords);
          previousCoords = coords;
          line.push(coords);
        }

        function finishLine(e) {
          el.removeEventListener(events.move, drawMove);
          el.removeEventListener(events.up, finishLine);
          bigCanvas.history.push(line);
          undo.refresh();
        }

        previousCoords = utils.relativeMouseCoords(e, el);
        line.push(previousCoords);

        el.addEventListener(events.move, drawMove);
        el.addEventListener(events.up, finishLine);
      });

      var bodyRect = d.body.getBoundingClientRect();

      // style
      utils.css(el, {
        zIndex: '1000',
        position: 'absolute',
        top: -(bodyRect.top + w.scrollY) + 'px',
        left: -(bodyRect.left + w.scrollX) + 'px',
        'pointer-events': 'none'
      });
      bigCanvas.defaultLineStyle();

      // dom
      d.body.appendChild(el);
    },
    defaultLineStyle: function() {
      bigCanvas.context.lineWidth = 5;
      bigCanvas.context.lineJoin = 'round';
    },
    setColor: function(color) {
      bigCanvas.context.strokeStyle = color;
    },
    enable: function() {
      utils.css(bigCanvas.element, {
        'pointer-events': '',
        cursor: 'crosshair'
      });
    },
    disable: function() {
      utils.css(bigCanvas.element, {
        'pointer-events': 'none',
        cursor: ''
      });
    },
    redraw: function() {
      // clear it
      bigCanvas.element.width = bigCanvas.element.width;
      bigCanvas.defaultLineStyle();

      for(var i = 0, length = bigCanvas.history.length; i < length; i++) {
        var line = bigCanvas.history[i];
        bigCanvas.setColor(line.color);
        for (var j = 0, max = line.length - 1; j < max; j++) {
          utils.draw(bigCanvas.context, line[j], line[j + 1]);
        }
      }

      // since we messed with bigCanvas' color
      pencil.refresh();
    },
    undo: function() {
      bigCanvas.history.pop();
      bigCanvas.redraw();
      undo.refresh();
    }
  },
  undo = {
    element: d.createElement('div'),
    init: function() {
      var el = undo.element;

      // events
      el.addEventListener('click', function(e) {
        bigCanvas.undo();
      });

      // icon
      // thanks, Alex Auda Samora
      // http://thenounproject.com/term/arrow/34729/
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="30px" height="30px" viewBox="0 0 30 30" enable-background="new 0 0 30 30" xml:space="preserve" fill="white" transform="scale(-1, 1)" >'
                   +   '<g transform="translate(30,0), scale(-1,1)">'
                   +    '<rect x="-131" y="-29" display="none" width="198" height="87"/>'
                   +    '<path d="M-89.562-16c15.323,0,20.256,11.675,20.857,13.264l10.103-9.526v34.928l-35.445-11.228l12.513-5.865  c-1.783-2.515-5.753-5.132-8.668-5.132c-3.417,0-10.462,0.213-11.103,15.801S-91.27,37.808-90.203,44  c-12.812-2.562-25.195-22.419-25.195-34.88S-106.003-16-89.562-16z" />'
                   +    '<path d="M-29.708-7c10.215,0,13.504,7.784,13.905,8.843l6.735-6.351v23.286l-23.63-7.485l8.342-3.91  c-1.188-1.676-3.836-3.421-5.779-3.421c-2.278,0-6.975,0.142-7.401,10.535c-0.427,10.393,6.69,14.376,7.401,18.504  c-8.541-1.707-16.796-14.946-16.796-23.253C-46.932,1.439-40.669-7-29.708-7z"/>'
                   +    '<path d="M13.719,0c7.662,0,10.128,5.838,10.429,6.632l5.051-4.763v17.464L11.477,13.72l6.256-2.933  c-0.891-1.257-2.877-2.566-4.334-2.566c-1.708,0-5.231,0.106-5.551,7.901C7.527,23.916,12.865,26.904,13.398,30  C6.993,28.72,0.801,18.791,0.801,12.56S5.498,0,13.719,0z"/>'
                   +    '<path d="M45.146,4c5.107,0,6.752,3.892,6.952,4.421l3.368-3.175v11.643l-11.815-3.743l4.171-1.955  c-0.594-0.838-1.918-1.71-2.89-1.71c-1.139,0-3.487,0.071-3.7,5.267c-0.214,5.196,3.345,7.188,3.7,9.252  c-4.271-0.854-8.398-7.473-8.398-11.626C36.534,8.22,39.666,4,45.146,4z"/>'
                   +   '</g>'
                   + '</svg>';

      // styles
      utils.css(el, {
        display: 'none',
        position: 'fixed',
        top: '10px',
        right: '90px',
        padding: '5px',
        zIndex: '1001',
        lineHeight: '1',
        cursor: 'pointer'
      });
      utils.css(el, utils.borderStyles);

      // dom
      d.body.appendChild(el);
    },
    show: function() {
      utils.css(undo.element, {display: ''});
    },
    hide: function() {
      utils.css(undo.element, {display: 'none'});
    },
    refresh: function() {
      if (bigCanvas.history.length) {
        var lastColor = bigCanvas.history[bigCanvas.history.length - 1].color;
        utils.css(undo.element, {
          backgroundColor: lastColor
        });
        undo.show();
      } else {
        undo.hide();
      }
    }
  };

  bigCanvas.init();
  pencil.init();
  colorPicker.init();
  undo.init();

}).call(this, window, document);
