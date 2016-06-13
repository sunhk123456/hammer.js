import { AttrRecognizer } from './attribute';
import inherit from '../utils/inherit';
import {
    DIRECTION_ALL,
    DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL,
    DIRECTION_NONE,
    DIRECTION_UP,
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT
} from '../inputjs/input-consts';
import { STATE_BEGAN } from '../recognizerjs/recognizer-consts';
import { TOUCH_ACTION_PAN_X,TOUCH_ACTION_PAN_Y } from '../touchactionjs/touchaction-Consts';
import directionStr from '../recognizerjs/direction-str';

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
  AttrRecognizer.apply(this, arguments);

  this.pX = null;
  this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
  /**
   * @namespace
   * @memberof PanRecognizer
   */
  defaults: {
    event: 'pan',
    threshold: 10,
    pointers: 1,
    direction: DIRECTION_ALL
  },

  getTouchAction: function() {
    let direction = this.options.direction;
    let actions = [];
    if (direction & DIRECTION_HORIZONTAL) {
      actions.push(TOUCH_ACTION_PAN_Y);
    }
    if (direction & DIRECTION_VERTICAL) {
      actions.push(TOUCH_ACTION_PAN_X);
    }
    return actions;
  },

  directionTest: function(input) {
    let options = this.options;
    let hasMoved = true;
    let distance = input.distance;
    let direction = input.direction;
    let x = input.deltaX;
    let y = input.deltaY;

    // lock to axis?
    if (!(direction & options.direction)) {
      if (options.direction & DIRECTION_HORIZONTAL) {
        direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
        hasMoved = x != this.pX;
        distance = Math.abs(input.deltaX);
      } else {
        direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
        hasMoved = y != this.pY;
        distance = Math.abs(input.deltaY);
      }
    }
    input.direction = direction;
    return hasMoved && distance > options.threshold && direction & options.direction;
  },

  attrTest: function(input) {
    return AttrRecognizer.prototype.attrTest.call(this, input) &&
        (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
  },

  emit: function(input) {

    this.pX = input.deltaX;
    this.pY = input.deltaY;

    let direction = directionStr(input.direction);

    if (direction) {
      input.additionalEvent = this.options.event + direction;
    }
    this._super.emit.call(this, input);
  }
});

export { PanRecognizer };
