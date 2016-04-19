/*** TouchMouseEvent.js event normalizer for synchronizing touch-based
 *** and mouse-based user input.
 ***
 *** adapted from Mathias Paumgarten's guide at https://www.safaribooksonline.com/blog/2012/04/18/mapping-mouse-events-and-touch-events-onto-a-single-event/
 ***
 *** requires jQuery
 ***/

TouchMouseEvent = {
  DOWN: "touchmousedown",
  UP: "touchmouseup",
  MOVE: "touchmousemove"
};

var normalizeEvent = function(type, originalEvent, x, y) {
  return $.Event(type, {
    x: x,
    y: y,
    e: originalEvent
  });
}

var initTouchMouseEvent = function() {

  var jQueryDocument = $(document);

  if ("ontouchstart" in window) {
    jQueryDocument.on("touchstart", onTouchEvent);
    jQueryDocument.on("touchmove", onTouchEvent);
    jQueryDocument.on("touchend", onTouchEvent);
  } 
  else {
    jQueryDocument.on("mousedown", onMouseEvent);
    jQueryDocument.on("mouseup", onMouseEvent);
    jQueryDocument.on("mousemove", onMouseEvent);
  }

}

var onMouseEvent = function(event) {
  var type;

  switch (event.type) {
    case "mousedown": type = TouchMouseEvent.DOWN; break;
    case "mouseup":   type = TouchMouseEvent.UP;   break;
    case "mousemove": type = TouchMouseEvent.MOVE; break;
    default: return;
  }

	var touchMouseEvent = normalizeEvent(type, event, event.pageX, event.pageY);
	$(event.target).trigger(touchMouseEvent);
}

var onTouchEvent = function(event) {
	var type;

	switch (event.type) {
    case "touchstart": type = TouchMouseEvent.DOWN; break;
    case "touchend":   type = TouchMouseEvent.UP;   break;
    case "touchmove":  type = TouchMouseEvent.MOVE; break;
    default: return;
  }

  var touch = event.originalEvent.touches[0];
  var touchMouseEvent;

  if (type == TouchMouseEvent.UP)
  	touchMouseEvent = normalizeEvent(type, event, null, null);
  else 
  	touchMouseEvente = normalizeEvent(type, event, touch.pageX, touch.pageY);

  $(event.target).trigger(touchMouseEvent);
}