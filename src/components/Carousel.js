(function(global){
  function Carousel(selector, options) {
    if (!selector) { throw new Error('Missing selector.') }

    for (var i = 0; i < selectorPool.length; i++) {
      if (selectorPool[i] === selector) {
        throw new Error('An instance of Carousel with this selector already exists.');
      }
    }

    this.options = {
      buttonPreviousClass: 'Carousel-buttonPrevious',
      buttonNextClass: 'Carousel-buttonNext',
      itemClass: 'Carousel-item',
      currentItemClass: 'Carousel-item--current',
      showPreviousClass: 'Carousel-item--showPrevious',
      showNextClass: 'Carousel-item--showNext',
      hidePreviousClass: 'Carousel-item--hidePrevious',
      hideNextClass: 'Carousel-item--hideNext',
      carousel: true
    };

    if (selector.length > 0) {
      throw new Error('Selector cannot be an array');
    } else {
      this.$selector = selector;
    }

    this.options = extend(this.options, options);
    this.event = null;

    // "Global vars"
    this.reset();
    this.buttonPrevious = this.$selector.querySelector(' .' + this.options.buttonPreviousClass);
    this.buttonNext = this.$selector.querySelector(' .' + this.options.buttonNextClass);

    this.bindEvents();
    this.createCustomEvent();

    // If there is no active item, start at 0
    if (this.currentItemIndex === -1) {
      this.currentItemIndex = 0;
      addClass(this.allItemsArray[this.currentItemIndex], this.options.currentItemClass);
    }

    // Update button states to make sure the correct state is set on initialization
    this.updateButtonStates();

    // Wrapped in timeout function so event can
    // be listened from outside at anytime
    var _this = this;
    setTimeout(function() {
      _this.event.detail.currentItemIndex = _this.currentItemIndex;
      _this.$selector.dispatchEvent(_this.event);
    }, 0);
  }

  var selectorPool = [];

  var Slider = Carousel.prototype;

  // Update prev/next disabled attribute
  Slider.updateButtonStates = function () {
    if ((!this.buttonPrevious && !this.buttonNext) || this.options.carousel) { return; }

    if (this.currentItemIndex === this.lastItemIndex) {
      this.buttonNext.setAttribute('disabled', 'disabled');
    } else if (this.currentItemIndex === 0) {
      this.buttonPrevious.setAttribute('disabled', 'disabled');
    }
  };

  // Reset all settings by removing classes and attributes added by goTo() & updateButtonStates()
  Slider.removeAllHelperSettings = function () {
    removeClass(this.allItemsArray[this.currentItemIndex], this.options.currentItemClass);
    removeClass($$(this.options.hidePreviousClass, this.$selector), this.options.hidePreviousClass);
    removeClass($$(this.options.hideNextClass, this.$selector), this.options.hideNextClass);
    removeClass($$(this.options.showPreviousClass, this.$selector), this.options.showPreviousClass);
    removeClass($$(this.options.showNextClass, this.$selector), this.options.showNextClass);

    if (!this.buttonPrevious && !this.buttonNext) { return; }

    this.buttonPrevious.removeAttribute('disabled');
    this.buttonNext.removeAttribute('disabled');
  };

  // Method to add classes to the right elements depending on the index passed
  Slider.goTo = function (index) {
    if (index === this.currentItemIndex) { return; }

    // Fix the index if it's out of bounds and carousel is enabled
    index = index === -1 && this.options.carousel ? this.lastItemIndex : index;
    index = index === this.lastItemIndex + 1 && this.options.carousel ? 0 : index;

    // Exit when index is out of bounds
    if (index < 0 || index > this.lastItemIndex) { return; }

    this.removeAllHelperSettings();

    var isForwards = (index > this.currentItemIndex || index === 0 && this.currentItemIndex === this.lastItemIndex) && !(index === this.lastItemIndex && this.currentItemIndex === 0);
    addClass(this.allItemsArray[this.currentItemIndex], isForwards ? this.options.hidePreviousClass : this.options.hideNextClass);
    addClass(this.allItemsArray[index], this.options.currentItemClass + ' ' + (isForwards ? this.options.showNextClass : this.options.showPreviousClass));

    this.currentItemIndex = index;

    this.updateButtonStates();

    this.event.detail.currentItemIndex = this.currentItemIndex;
    this.$selector.dispatchEvent(this.event);
  };

  // Previous item handler
  Slider.previous = function () {
    this.goTo(this.currentItemIndex - 1);
  };

  // Next item handler
  Slider.next = function () {
    this.goTo(this.currentItemIndex + 1);
  };

  // Update global variables
  Slider.reset = function () {
    this.allItemsArray = Array.prototype.slice.call(this.$selector.querySelectorAll(' .' + this.options.itemClass));
    this.currentItemIndex = this.allItemsArray.indexOf(this.$selector.querySelector(' .' + this.options.currentItemClass));
    this.lastItemIndex = this.allItemsArray.length - 1;
  };

  // Attach click handlers
  Slider.bindEvents = function () {
    selectorPool.push(this.$selector);

    var _this = this;

    if (this.buttonPrevious) {
      this.buttonPrevious.addEventListener('click', function (event) {
        event.preventDefault();
        _this.previous();
      });
    }

    if (this.buttonNext) {
      this.buttonNext.addEventListener('click', function (event) {
        event.preventDefault();
        _this.next();
      });
    }

  };

  // Create custom Event
  Slider.createCustomEvent = function () {
    var _this = this;
    this.event = new CustomEvent('change', {
      detail: {
        CarouselElement: _this.$selector,
        currentItemIndex: Number(_this.currentItemIndex)
      },
      bubbles: true,
      cancelable: true
    });
  };

  // Helper functions
  function $$(element, container) {
    if (!element) { return; }
    if (!container) {
      container = document;
    }
    return container.querySelector('.' + element);
  }

  function addClass(element, className) {
    if (!element) { return; }
    element.className = (element.className + ' ' + className).trim();
  }

  function removeClass(element, className) {
    if (!element) { return; }
    element.className = element.className.replace(className, '').trim();
  }

  function extend(origOptions, userOptions){
    var extendOptions = {}, attrname;
    for (attrname in origOptions) { extendOptions[attrname] = origOptions[attrname]; }
    for (attrname in userOptions) { extendOptions[attrname] = userOptions[attrname]; }
    return extendOptions;
  }

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.CustomEvent ? window.CustomEvent.prototype : {};
  window.CustomEvent = CustomEvent;

  if(typeof define === 'function'){
    define(function () { return Carousel; });
  } else if (typeof module !== 'undefined' && module.exports){
    module.exports = Carousel;
  } else {
    global['Carousel'] = Carousel;
  }
}(this));
