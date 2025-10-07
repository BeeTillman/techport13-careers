/*! RESOURCE: /scripts/heisenberg/bootstrap/affix.js */
+function ($) {
  'use strict';
  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    var target = this.options.target === Affix.DEFAULTS.target ? $(this.options.target) : $(document).find(this.options.target === '#' ? [] : this.options.target)
    this.$target = target
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))
    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null
    this.checkPosition()
  }
  Affix.VERSION  = '3.2.0'
  Affix.RESET    = 'affix affix-top affix-bottom'
  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }
  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }
  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }
  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return
    var scrollHeight = $(document).height()
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)
    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false
    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')
    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null
    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))
    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.affix
  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix
  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }
  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()
      data.offset = data.offset || {}
      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop
      Plugin.call($spy, data)
    })
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/alert.js */
+function ($) {
  'use strict';
  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }
  Alert.VERSION = '3.2.0'
  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')
    if (!selector) {
      selector = $this.attr('href')
selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '')
    }
    selector = selector === '#' ? [] : selector
    var $parent = $(document).find(selector)
    if (e) e.preventDefault()
    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }
    $parent.trigger(e = $.Event('close.bs.alert'))
    if (e.isDefaultPrevented()) return
    $parent.removeClass('in')
    function removeElement() {
      $parent.detach().trigger('closed.bs.alert').remove()
    }
    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')
      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }
  var old = $.fn.alert
  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert
  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }
  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/button.js */
+function ($) {
  'use strict';
  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }
  Button.VERSION  = '3.2.0'
  Button.DEFAULTS = {
    loadingText: 'loading...'
  }
  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()
    state = state + 'Text'
    if (data.resetText == null) $el.data('resetText', $el[val]())
    $el[val](data[state] == null ? this.options[state] : data[state])
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }
  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')
    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }
    if (changed) this.$element.toggleClass('active')
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.button', (data = new Button(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }
  var old = $.fn.button
  $.fn.button             = Plugin
  $.fn.button.Constructor = Button
  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }
  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/carousel.js */
+function ($) {
  'use strict';
  var Carousel = function (element, options) {
    this.$element    = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null
    this.options.pause == 'hover' && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }
  Carousel.VERSION  = '3.2.0'
  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }
  Carousel.prototype.keydown = function (e) {
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }
    e.preventDefault()
  }
  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)
    this.interval && clearInterval(this.interval)
    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
    return this
  }
  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }
  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))
    if (pos > (this.$items.length - 1) || pos < 0) return
if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()
    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }
  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)
    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }
    this.interval = clearInterval(this.interval)
    return this
  }
  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }
  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }
  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this
    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }
    if ($next.hasClass('active')) return (this.sliding = false)
    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return
    this.sliding = true
    isCycling && this.pause()
    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }
var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction })
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
$next[0].offsetWidth
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }
    isCycling && this.cycle()
    return this
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }
  var old = $.fn.carousel
  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel
  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }
  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    if (href) {
href = href.replace(/.*(?=#[^\s]+$)/, '')
    }
    var target  = $this.attr('data-target') || href
    target = target === '#' ? [] : target
    var $target = $(document).find(target)
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false
    Plugin.call($target, options)
    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }
    e.preventDefault()
  })
  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/collapse.js */
+function ($) {
  'use strict';
  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null
    if (this.options.parent) this.$parent = $(document).find(this.options.parent === '#' ? [] : this.options.parent)
    if (this.options.toggle) this.toggle()
  }
  Collapse.VERSION  = '3.2.0'
  Collapse.DEFAULTS = {
    toggle: true
  }
  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }
  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return
    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    var actives = this.$parent && this.$parent.find('> .panel > .in')
    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      Plugin.call(actives, 'hide')
      hasData || actives.data('bs.collapse', null)
    }
    var dimension = this.dimension()
    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
    this.transitioning = 1
    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }
    if (!$.support.transition) return complete.call(this)
    var scrollSize = $.camelCase(['scroll', dimension].join('-'))
    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }
  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return
    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    var dimension = this.dimension()
    this.$element[dimension](this.$element[dimension]())[0].offsetHeight
    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')
    this.transitioning = 1
    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }
    if (!$.support.transition) return complete.call(this)
    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }
  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.collapse
  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse
  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }
  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var href
    var $this   = $(this)
    var target  = $this.attr('data-target')
        || e.preventDefault()
|| (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
    target = target === '#' ? [] : target
    var $target = $(document).find(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)
    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }
    Plugin.call($target, option)
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/dropdown.js */
+function ($) {
  'use strict';
  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }
  Dropdown.VERSION = '3.2.0'
  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)
    if ($this.is('.disabled, :disabled')) return
    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')
    clearMenus()
    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
$('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }
      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')
      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }
    return false
  }
  Dropdown.prototype.keydown = function (e) {
if (!/(38|40|27|32|9)/.test(e.keyCode) || /input|textarea/i.test(e.target.tagName)) return
    if (e.keyCode == 9) {
      clearMenus()
      return
    }
    var $this = $(this)
    e.preventDefault()
    e.stopPropagation()
    if ($this.is('.disabled, :disabled')) return
    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')
    if ((!isActive && e.keyCode != 27) || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
        return $this.trigger('click');
    }
    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)
    if (!$items.length) return
    var index = $items.index($items.filter(':focus'))
if (e.keyCode == 38) {
      if(index > 0) index--
      else if(index == 0) index = $items.length - 1
    }
if (e.keyCode == 40) {
      if(index < $items.length - 1) index++
      else if(index == $items.length - 1) index = 0
    }
    if (!~index)    index = 0
    $items.eq(index).trigger('focus')
  }
  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }
  function getParent($this) {
    var selector = $this.attr('data-target')
    if (!selector) {
      selector = $this.attr('href')
selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '')
    }
    selector = selector === '#' ? [] : selector
    var $parent = selector && $(document).find(selector)
    return $parent && $parent.length ? $parent : $this.parent()
  }
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')
      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }
  var old = $.fn.dropdown
  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown
  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }
  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/tooltip.js */
+function ($) {
  'use strict';
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn']
  var uriAttrs = [
    'background',
    'cite',
    'href',
    'itemtype',
    'longdesc',
    'poster',
    'src',
    'xlink:href'
  ]
var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i
  var DefaultWhitelist = {
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  }
var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi
var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i
  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase()
    if ($.inArray(attrName, allowedAttributeList) !== -1) {
      if ($.inArray(attrName, uriAttrs) !== -1) {
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN))
      }
      return true
    }
    var regExp = $(allowedAttributeList).filter(function (index, value) {
      return value instanceof RegExp
    })
    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true
      }
    }
    return false
  }
  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml
    }
    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml)
    }
    if (!document.implementation || !document.implementation.createHTMLDocument) {
      return unsafeHtml
    }
    var createdDocument = document.implementation.createHTMLDocument('sanitization')
    createdDocument.body.innerHTML = unsafeHtml
    var whitelistKeys = $.map(whiteList, function (el, i) { return i })
    var elements = $(createdDocument.body).find('*')
    for (var i = 0, len = elements.length; i < len; i++) {
      var el = elements[i]
      var elName = el.nodeName.toLowerCase()
      if ($.inArray(elName, whitelistKeys) === -1) {
        el.parentNode.removeChild(el)
        continue
      }
      var attributeList = $.map(el.attributes, function (el) { return el })
      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || [])
      for (var j = 0, len2 = attributeList.length; j < len2; j++) {
        if (!allowedAttribute(attributeList[j], whitelistedAttributes)) {
          el.removeAttribute(attributeList[j].nodeName)
        }
      }
    }
    return createdDocument.body.innerHTML
  }
  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.orphanCheck=
    this.$element   = null
    this.init('tooltip', element, options)
  }
  Tooltip.VERSION  = '3.2.0'
  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    },
    sanitize : false,
    sanitizeFn : null,
    whiteList : DefaultWhitelist
  }
  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    var viewport = this.options.viewport && (this.options.viewport.selector || this.options.viewport)
    viewport = viewport === '#' ? [] : viewport;
    this.$viewport = this.options.viewport && $(document).find(viewport)
    var triggers = this.options.trigger.split(' ')
    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]
      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }
    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }
  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }
  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)
    var dataAttributes = this.$element.data()
    for (var dataAttr in dataAttributes) {
      if (dataAttributes.hasOwnProperty(dataAttr) && $.inArray(dataAttr, DISALLOWED_ATTRIBUTES) !== -1) {
        delete dataAttributes[dataAttr]
      }
    }
    options = $.extend({}, this.getDefaults(), dataAttributes, options)
    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }
    if (options.sanitize) {
      options.template = sanitizeHtml(options.template, options.whiteList, options.sanitizeFn)
    }
    return options
  }
  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()
    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })
    return options
  }
  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }
    clearTimeout(self.timeout)
    clearInterval(self.orphanCheck);
    self.hoverState = 'in'
    if (!self.options.delay || !self.options.delay.show) return self.show()
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }
  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }
    clearTimeout(self.timeout)
    clearInterval(self.orphanCheck);
    self.hoverState = 'out'
    if (!self.options.delay || !self.options.delay.hide) return self.hide()
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }
  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)
    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)
      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this
      var $tip = this.tip()
      var tipId = this.getUID(this.type)
      this.setContent()
      $tip.attr('id', tipId)
      if (this.options.omitAriaDescribedby !== true)
	    this.$element.attr('aria-describedby', tipId)
      if (this.options.animation) $tip.addClass('fade')
      var placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement
var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
      $tip
        .detach()
        .css({ width: '', top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)
      this.options.container ? $tip.appendTo($(document).find(this.options.container === '#' ? [] : this.options.container)) : $tip.insertAfter(this.$element)
      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight
      if (autoPlace) {
        var orgPlacement = placement
        var $container   = this.options.container ? $($(document).find(this.options.container === '#' ? [] : this.options.container)) : this.$element.parent()
        var containerDim = this.getPosition($container)
		  placement = placement == 'bottom' && pos.top   + pos.height          + actualHeight - containerDim.scroll > containerDim.height ? 'top'    :
				  	  placement == 'top'    && pos.top   - containerDim.scroll - actualHeight < containerDim.top                          ? 'bottom' :
				  	  placement == 'right'  && pos.right + actualWidth         > containerDim.width                                       ? 'left'   :
			  		  placement == 'left'   && pos.left  - actualWidth         < containerDim.left										  ? 'right'  :
		  placement
        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }
      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
      this.applyPlacement(calculatedOffset, placement)
      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
        if (prevHoverState == 'out') that.leave(that)
      }
      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
        var self = this;
        self.orphanCheck = setInterval(function() {
            if (self.$element && !self.$element.is(':visible')) {
              console.log('self hide', self.$element[0].ariaLabel);
              self.hide()
              clearInterval(self.orphanCheck)
            }
        }, 1000)
    }
  }
  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0
    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft
	var viewportDimensions = this.getPosition(this.$viewport);
    var innerTip = $tip.find('.tooltip-inner');
    var innerTipPadding = parseInt(innerTip.css('padding'), 10);
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left),
width: width+innerTipPadding
        })
      }
    }, offset), 0)
    $tip.addClass('in')
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight
    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }
    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight, viewportDimensions)
var isVertical = /top|bottom/.test(placement)
    if(isVertical && this.options && this.options.container) {
      var $container = this.$element.closest(this.options.container)
      const isContainerSameAsViewport = this.$viewport && this.$viewport[0] === $container[0]
      if($container.length && !isContainerSameAsViewport) {
        var containerDim = this.getPosition($container)
var tooltipExtraLengthAfterThisEle = (actualWidth - this.getPosition().width)/2
        var deltaRWithRespectToContainer = (this.getPosition().right + tooltipExtraLengthAfterThisEle) - (containerDim.left + containerDim.width)
        var deltaLWithRespectToContainer = (containerDim.left) - (this.getPosition().left - tooltipExtraLengthAfterThisEle)
        if(deltaRWithRespectToContainer > 0) {
          if(delta.left <= 0) {
            if(Math.abs(delta.left) < deltaRWithRespectToContainer) {
              delta.left = -deltaRWithRespectToContainer
            }
}
        }
        if(deltaLWithRespectToContainer > 0) {
          if(delta.left >= 0) {
            if(Math.abs(delta.left) < deltaLWithRespectToContainer) {
              delta.left = deltaLWithRespectToContainer
            }
}
        }
      }
    }
    if (delta.left) offset.left += delta.left
    else offset.top += delta.top
  var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
  var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'
    $tip.offset(offset)
  this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical, viewportDimensions)
  }
  Tooltip.prototype.replaceArrow = function (delta, dimension, isHorizontal, viewportDimensions) {
    var $arrow = this.arrow();
    if ($arrow.length === 0)
      return;
    $arrow
.css(isHorizontal ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isHorizontal ? 'right' : 'bottom', 'auto')
      .css(isHorizontal ? 'top' : 'left', '');
    if (!viewportDimensions) return ;
    var arrPostion = $arrow.position();
    var arrowLeft = arrPostion.left;
    var arrowTop = arrPostion.right;
    var tipWidth = this.$tip[0].offsetWidth;
    var arrowWidth = $arrow[0].offsetWidth;;
    var arrowMarginLeft = parseInt($arrow.css("margin-left"), 10);
    var tipBorderRadius = parseInt(this.$tip.css("border-radius"), 10);
    var arrowRight = arrowLeft + arrowWidth + arrowMarginLeft;
    var scrollBarWidth = viewportDimensions.scrollbarWidth;
    if (isHorizontal && tipWidth > arrowWidth) {
if (arrowLeft < arrowWidth/2 + tipBorderRadius)
arrowLeft = arrowWidth/2 + tipBorderRadius;
else if (arrowRight > tipWidth)
arrowLeft = tipWidth - arrowWidth/2 - tipBorderRadius;
arrowLeft = arrowLeft - (arrowMarginLeft + arrowWidth / 2);
      $arrow
        .css('right', 'auto')
        .css('left', arrowLeft)
        .css('top', arrowTop);
    } else if(isHorizontal && tipWidth < arrowWidth) {
      $arrow
        .css('margin-bottom', tipBorderRadius);
    }
  }
  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()
    if (this.options.html) {
      if (this.options.sanitize) {
        title = sanitizeHtml(title, this.options.whiteList, this.options.sanitizeFn)
      }
      $tip.find('.tooltip-inner').html(title)
    } else {
      $tip.find('.tooltip-inner').text(title)
    }
    $tip.removeClass('fade in top bottom left right')
  }
  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)
    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      callback && callback()
    }
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
    $tip.removeClass('in')
    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()
    this.hoverState = null
    return this
  }
  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }
  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }
  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    var viewPortScrollOffset = document.viewport ? document.viewport.getScrollOffsets() : {left:0, right: 0};
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width: isBody ? document.documentElement.scrollWidth : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset(), {viewPortScrollOffset:viewPortScrollOffset}, { scrollbarWidth: window.innerWidth - document.documentElement.clientWidth})
  }
  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
{ top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }
  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight, viewportDimensions) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta
    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var scrollBarWidth = viewportDimensions.scrollbarWidth;
if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
if (topEdgeOffset < viewportDimensions.top) {
        delta.top = viewportDimensions.top - topEdgeOffset
} else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left;
      var rightEdgeOffset = pos.left + actualWidth;
      var scrollLeft = viewportDimensions.x !== undefined && viewportDimensions.viewPortScrollOffset.left === 0 ? viewportDimensions.x : viewportDimensions.viewPortScrollOffset.left;
      var docWidth = document.documentElement.offsetWidth;
      var scrollbarWidthForRTL = document.dir === 'rtl' ? scrollBarWidth : 0;
      var viewportScrollWidth = 0;
      if(this.$viewport && this.$viewport[0]) {
        viewportScrollWidth =  this.$viewport[0].offsetWidth - this.$viewport[0].clientWidth;
      }
if (leftEdgeOffset < scrollLeft) {
        delta.left = scrollbarWidthForRTL + scrollLeft - leftEdgeOffset;
        if(document.dir === 'rtl') {
          delta.left += viewportScrollWidth;
        }
} else if (rightEdgeOffset > docWidth + scrollLeft) {
        delta.left = docWidth + scrollLeft - rightEdgeOffset + scrollbarWidthForRTL
        if(document.dir === 'ltr') {
          delta.left -= viewportScrollWidth;
        }
      }
    }
    return delta
  }
  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options
    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
    return title
  }
  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }
  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }
  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }
  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }
  Tooltip.prototype.enable = function () {
    this.enabled = true
  }
  Tooltip.prototype.disable = function () {
    this.enabled = false
  }
  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }
  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }
  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
    })
  }
  Tooltip.prototype.sanitizeHtml = function (unsafeHtml) {
    return sanitizeHtml(unsafeHtml, this.options.whiteList, this.options.sanitizeFn)
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option
      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.tooltip
  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip
  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/modal.js */
+function ($) {
  'use strict';
  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0
    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }
  Modal.VERSION  = '3.2.0'
  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }
  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }
  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })
    this.$element.trigger(e)
    if (this.isShown || e.isDefaultPrevented()) return
    this.isShown = true
    this.checkScrollbar()
    this.$body.addClass('modal-open')
    this.setScrollbar()
    this.escape()
    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')
      if (!that.$element.parent().length) {
that.$element.appendTo(that.$body)
      }
      that.$element
        .show()
        .scrollTop(0)
      if (transition) {
that.$element[0].offsetWidth
      }
      that.$element
        .addClass('in')
        .attr('aria-hidden', false)
      that.enforceFocus()
      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })
      transition ?
that.$element.find('.modal-dialog')
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }
  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()
    e = $.Event('hide.bs.modal')
    this.$element.trigger(e)
    if (!this.isShown || e.isDefaultPrevented()) return
    this.isShown = false
    this.$body.removeClass('modal-open')
    this.resetScrollbar()
    this.escape()
    $(document).off('focusin.bs.modal')
    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')
    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }
  Modal.prototype.enforceFocus = function () {
    $(document)
.off('focusin.bs.modal')
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }
  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }
  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$element.trigger('hidden.bs.modal')
    })
  }
  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }
  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''
    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate
this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)
      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))
if (doAnimate) this.$backdrop[0].offsetWidth
      this.$backdrop.addClass('in')
      if (!callback) return
      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(150) :
        callback()
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')
      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(150) :
        callbackRemove()
    } else if (callback) {
      callback()
    }
  }
  Modal.prototype.checkScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) return
    this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
  }
  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }
  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }
Modal.prototype.measureScrollbar = function () {
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }
  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }
  var old = $.fn.modal
  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal
  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }
  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var target  = $this.attr('data-target') ||
(href && href.replace(/.*(?=#[^\s]+$)/, ''))
    target = target === '#' ? [] : target
    var $target = $(document).find(target)
var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())
    if ($this.is('a')) e.preventDefault()
    $target.one('show.bs.modal', function (showEvent) {
if (showEvent.isDefaultPrevented()) return
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/popover.js */
+function ($) {
  'use strict';
  var Popover = function (element, options) {
    this.init('popover', element, options)
  }
  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')
  Popover.VERSION  = '3.2.0'
  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
template: '<div class="popover" role="dialog" aria-labelledby="popover-title"><div class="arrow"></div><h3 class="popover-title" id="popover-title"></h3><div class="popover-content"></div></div>'
  })
  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
  Popover.prototype.constructor = Popover
  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }
  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = ((this.options.title) ? this.options.title : this.getTitle());
    var content = this.getContent()
    if (this.options.html) {
      var typeContent = typeof content
      if (this.options.sanitize) {
        title = this.sanitizeHtml(title)
        if (typeContent === 'string') {
          content = this.sanitizeHtml(content)
        }
      }
      $tip.find('.popover-title').html(title)
      $tip.find('.popover-content').children().detach().end()[
        typeContent === 'string' ? 'html' : 'append'
      ](content)
    } else {
      $tip.find('.popover-title').text(title)
      $tip.find('.popover-content').children().detach().end().text(content)
    }
    $tip.removeClass('fade top bottom left right in')
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }
  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }
  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options
    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }
  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }
  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option
      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.popover
  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover
  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/scrollspy.js */
+function ($) {
  'use strict';
  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this)
    this.$body          = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0
    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }
  ScrollSpy.VERSION  = '3.2.0'
  ScrollSpy.DEFAULTS = {
    offset: 10
  }
  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }
  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset'
    var offsetBase   = 0
    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }
    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()
    var self     = this
    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
var $href = /^#./.test(href) && $(href)
        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }
  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i
    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }
    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }
    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }
    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }
  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'
    var active = $(selector)
      .parents('li')
      .addClass('active')
    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }
    active.trigger('activate.bs.scrollspy')
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.scrollspy
  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy
  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }
  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/transition.js */
+function ($) {
  'use strict';
  function transitionEnd() {
    var el = document.createElement('bootstrap')
    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
return false
  }
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }
  $(function () {
    $.support.transition = transitionEnd()
    if (!$.support.transition) return
    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/prototype.hidefix.js */
(function($) {
	"use strict";
	$.fn.hideFix = function() {
		return this.each(function() {
			if (!window.Prototype)
				return this;
			this.hide = function() {
				if (!jQuery.event.triggered)
					Element.hide(this);
			}
			this.show = function() {
				if (!jQuery.event.triggered)
					Element.show(this);
			}
			return this;
		})
	}
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/collapse.js */
(function($) {
	"use strict";
	var bsCollapse = $.fn.collapse;
	$.fn.collapse = function(options) {
		var $this = this;
		$this.hideFix();
		return bsCollapse.call($this, options);
	};
	$(document).on('click.bs.collapse.data-api', '[data-sn-toggle="collapse"]', function(e) {
		var href
		var $this   = $(this)
		var target  = $this.attr('data-target')
			|| e.preventDefault()
|| (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
		var $target = $(target)
		var data    = $target.data('bs.collapse')
		var option  = data ? 'toggle' : $this.data()
		var parent  = $this.attr('data-parent')
		var $parent = parent && $(parent)
		if (!data || !data.transitioning) {
			if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
			$this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
		}
		$.fn.collapse.call($target, option)
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/dropdowns.js */
(function($) {
	"use strict";
	$(document).on('show.bs.dropdown', function(evt) {
		$(evt.relatedTarget).hideFix()
			.parent().hideFix()
			.closest('.dropup, .dropdown').hideFix();
		$('.dropdown-menu', evt.target).data('menu-trigger', evt.relatedTarget);
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/modals.js */
(function($) {
	"use strict";
	var bsModal = $.fn.modal.Constructor;
	var bsModalShow = bsModal.prototype.show;
	var bsModalHide = bsModal.prototype.hide;
	var visibleModalStack = [];
	var $document = $(document);
	function isMobileSafari() {
return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i);
	}
	function forceRedraw(element) {
		return element.offsetLeft;
	}
	function getFirstTabbableElement(container, depth) {
		if (typeof depth === 'undefined')
			depth = 1;
		if (depth === 3)
			return null;
		var elements = window.tabbable(container, 'input, select, a[href], textarea, button, [tabindex]:not(.focus-trap-boundary-south), iframe');
		if (elements.length === 0) return null;
		var result = null;
		if (elements[0].tagName !== 'IFRAME')
			return elements[0];
		for (var i = 0; i <= elements.length - 1 && result === null; i++) {
			result = elements[i];
			if (result.tagName === 'IFRAME')
				result = getFirstTabbableElement(result.contentDocument, depth + 1);
		}
		return result;
	}
	function getLastTabbableElement(container, depth) {
		if (typeof depth === 'undefined')
			depth = 1;
		if (depth === 3)
			return null;
		var elements = window.tabbable(container, 'input, select, a[href], textarea, button, [tabindex]:not(.focus-trap-boundary-south), iframe');
		if (elements.length === 0) return null;
		if (elements[elements.length - 1].tagName !== 'IFRAME')
			return elements[elements.length - 1];
		var result = null;
		for (var i = elements.length - 1; i >= 0 && result === null; i--) {
			result = elements[i];
			if (result.tagName === 'IFRAME')
				result = getLastTabbableElement(result.contentDocument, depth + 1);
		}
		return result;
	}
	function visibleModalFocusInHandler(event) {
		var $modal = visibleModalStack[visibleModalStack.length - 1];
		if (!$modal || !$modal.$element)
			return;
		$modal = $modal.$element;
		if ($modal.attr('focus-escape') === 'true')
			return;
		var modal = $modal[0];
		var targetIsModal = modal === event.target;
		var modalContainsTarget = $modal.has(event.target).length > 0;
		var targetIsSouthernBoundary = event.target.classList.contains('focus-trap-boundary-south');
		var targetIsIframe = event.target.tagName === "IFRAME";
		var isVTBLoadedForm = modal.classList.contains('vtb-classic-form-modal');
		if (!targetIsModal && !isVTBLoadedForm) {
			if (!modalContainsTarget) {
				var lastTabbableElement = getLastTabbableElement(modal);
				if (lastTabbableElement && typeof lastTabbableElement.focus === 'function')
					lastTabbableElement.focus();
				else
					$modal.trigger('focus');
			}
			else if (targetIsSouthernBoundary){
				var firstTabbableElement = getFirstTabbableElement(modal);
				if (firstTabbableElement && typeof firstTabbableElement.focus === 'function')
					firstTabbableElement.focus();
				else
					$modal.trigger('focus');
			}
			else if (targetIsIframe) {
				var firstTabbableElement = getFirstTabbableElement(event.target.contentDocument);
				if (firstTabbableElement && typeof firstTabbableElement.focus === 'function')
					firstTabbableElement.focus();
			}
		}
	}
	bsModal.prototype.show = function() {
		bsModalShow.apply(this, arguments);
		visibleModalStack.push(this);
		var $backdrop = $('body').find('.modal-backdrop').not('.stacked');
		var zmodal = this.$element.css('z-index');
		var zbackdrop = $backdrop.css('z-index');
		this.$element.css('z-index', (~~zmodal) + (10 * visibleModalStack.length));
		$backdrop.css('z-index', (~~zbackdrop) + (10 * visibleModalStack.length));
		$backdrop.addClass('stacked');
		this.$element[0].setAttribute('tabindex', '-1');
		forceRedraw(this.$element[0]);
	};
	bsModal.prototype.hide = function(e) {
		bsModalHide.apply(this, arguments);
		var modalPosition = visibleModalStack.indexOf(this);
		if (modalPosition !== -1)
			visibleModalStack.splice(modalPosition, 1);
		if (this.isShown) return;
		if (visibleModalStack.length > 0)
			$document.on('focusin.bs.modal', visibleModalFocusInHandler)
		this.$element.css('z-index', '');
		forceRedraw(this.$element[0]);
	};
	$document.on('shown.bs.modal hidden.bs.modal', function() {
		if (window._frameChanged)
			_frameChanged();
	})
	$document.on('shown.bs.modal', function(event) {
		$document.off('focusin.bs.modal');
		$document.on('focusin.bs.modal', visibleModalFocusInHandler);
		var modal = event.target;
		var autoFocus = true;
		if (modal.getAttribute('data-auto-focus') === 'false') {
			autoFocus = false;
		}
		if (autoFocus && window.tabbable) {
			var tabbableElements = window.tabbable(modal);
			if (
				tabbableElements
				&& tabbableElements.length
				&& tabbableElements[0]
			) {
				tabbableElements[0].focus();
			}
		}
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/tooltips.js */
(function($) {
	"use strict";
	var bsTooltip = $.fn.tooltip.Constructor;
	bsTooltip.DEFAULTS.placement = 'auto';
	bsTooltip.DEFAULTS.delay = {
		'show': 500,
		'hide': 100
	};
	var SN_TOOLTIP_SELECTOR = '.sn-tooltip-basic, *[title]:not(.accessibility_no_tooltip), *[data-dynamic-title]:not(.accessibility_no_tooltip), [data-tooltip-overflow-only="true"]';
	$(function() {
		if ('ontouchstart' in document.documentElement)
			return;
		var $tooltips = $(SN_TOOLTIP_SELECTOR);
		(function setupTooltips() {
			$tooltips.each(function() {
				var $this = $(this);
				$this.hideFix();
				if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
					this.setAttribute('data-original-title', this.getAttribute('title'));
			})
		})();
		$(document.body).on('mouseenter focus', SN_TOOLTIP_SELECTOR, function(evt) {
			if (this.tagName == 'IFRAME' || this.tagName == 'OPTION')
				return;
			var $this = $(this);
			$this.hideFix();
			var $target = $(evt.target);
			if ($this.data('bs.tooltip'))
				return;
			if (this.getAttribute('data-tooltip-overflow-only') === 'true' && !this.hasAttribute('title')) {
				var text = $this.find('[data-tooltip-overflow-only-text="true"]')[0];
				if (text && text.offsetWidth < text.scrollWidth) {
					this.setAttribute('title', text.textContent);
				}
			}
			
			if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
				this.setAttribute('data-original-title', this.getAttribute('title'));
			
			$this.tooltip({
				container: $this.attr('data-container') || 'body',
				title: function() {
					return $(this).attr('data-dynamic-title');
				},
				omitAriaDescribedby: $target.data('omit-aria-describedby')
			});
			$this.on('click', function() {
				$this.tooltip('hide');
			});
			var tooltipDuration = 10;
			if (window.g_accessibility && typeof g_accessibility_tooltip_duration !== 'undefined')
				tooltipDuration = g_accessibility_tooltip_duration;
			if (tooltipDuration !== 0) {
				$this.on('shown.bs.tooltip', function() {
					setTimeout(function() {
						$this.tooltip('hide');
					}, tooltipDuration * 1000);
				});
			}
			$this.data('hover', setTimeout(function() {
				$this.tooltip('show');
			}, bsTooltip.DEFAULTS.delay.show));
		});
		$(document.body).on('mouseleave blur', SN_TOOLTIP_SELECTOR, function() {
			var $this = $(this);
			var hover = $this.data('hover');
			if (hover) {
				clearTimeout($this.data('hover'));
				$this.removeData('hover')
			}
		});
		$(document).bind('mouseleave', function(evt) {
			if ($('.tooltip').length === 0)
				return;
			$('.sn-tooltip-basic, *[title]').each(function() {
				if (this.tagName == 'IFRAME')
					return;
				var $this = $(this);
				if ($this.data('bs.tooltip'))
					$this.tooltip('hide');
			})
		})
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/snPopover.js */
(function($) {
	"use strict";
	var Popover = $.fn.popover.Constructor;
	var popoverCount = 0;
	var bsPopoverInit = Popover.prototype.init;
	var bsPopoverShow = Popover.prototype.show;
	var bsPopoverHide = Popover.prototype.hide;
	var bsPopoverFixTitle = Popover.prototype.fixTitle;
	Popover.prototype.init = function (type, element, options) {
		var $e = $(element);
		var $target = $($e.data('target'));
		var popoverId = popoverCount++;
		var wide = !!$e.data('wide');
		$e.hideFix();
		this.$target = $target;
		this.$target.hide();
		this.popoverId = popoverId;
		options = $.extend({}, {
			html: true,
			content: function () {
				if (wide)
					this.tip().addClass('wide');
				var placeholderId = 'popover-placeholder-' + popoverId;
				if (!document.getElementById(placeholderId))
$target.before('<div id="' + placeholderId + '" class="popover-placeholder" />');
				$target.show();
				return $target;
			}.bind(this)
		}, options);
		bsPopoverInit.call(this, type, element, options);
	};
	Popover.prototype.fixTitle = function() {
		var trigger = this.options.trigger;
if (typeof trigger === "undefined" || trigger === "" || /hover/.test(trigger))
			bsPopoverFixTitle.apply(this, arguments);
	};
	Popover.prototype.show = function () {
		var $e = this.$element;
		bsPopoverShow.apply(this, arguments);
		$e.addClass('active');
		this.tip().one('click', '[data-dismiss=popover]', function () {
			$e.popover('hide');
			$e[0].focus();
		});
	};
	Popover.prototype.hide = function () {
		var $e = this.$element;
		var $target = this.$target;
		var $popover = $target.closest('.popover');
		var popoverId = this.popoverId;
		function saveOffContent() {
			$e.removeClass('active');
			var $placeholder = $('#popover-placeholder-' + popoverId);
			if (!$placeholder.length || !$target.length)
				return;
			var $innerContent = $target.detach();
			if ($innerContent.length === 0)
				return;
			$innerContent.hide();
			$placeholder.replaceWith($innerContent);
		}
		if ($.support.transition && $popover.hasClass('fade'))
			$popover.one('bsTransitionEnd', saveOffContent);
		else
			saveOffContent();
		bsPopoverHide.apply(this, arguments);
	};
	Popover.prototype.getTitle = function() {
		var $e = this.$element;
		var title = $e.data('popover-title');
		var expectingHtml = this.options && this.options.html;
		var isHtml = typeof $e.data('popover-title-is-html') !== 'undefined' ? $e.data('popover-title-is-html') : expectingHtml;
		if (expectingHtml && !isHtml) {
title  = $('<div />').text(title).html();
		}
		return title || $.fn.tooltip.Constructor.prototype.getTitle.call(this);
	}
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/popovers.js */
(function($) {
	"use strict";
	$(function() {
		$('.sn-popover-basic').each(function() {
			var $this = $(this);
			if (!$this.data('bs.popover'))
				$(this).popover();
		});
		function hideOpenPopovers() {
			$('.sn-popover-basic').each(function() {
				var $this = $(this);
				if ($this.attr('aria-describedby') !== undefined)
					$this.popover('hide');
			});
		}
		function resetContainer() {
			$('.sn-popover-basic').each(function() {
				var $this = $(this);
				$this.popover({container: $this.data('container')});
			});
		}
		
		function debounce(fn, threshold, fireOnStart) {
			var timeout;
			return function() {
				var obj = this,
					args = arguments;
				threshold = (threshold !== undefined) ? threshold : 500;
				function delayed() {
					if (!fireOnStart)
						fn.apply(obj, args);
					timeout = null;
				}
				if (timeout)
					clearTimeout(timeout);
				else if (fireOnStart)
					fn.apply(obj, args);
				timeout = setTimeout(delayed, threshold);
			};
		}
		function closeOnBlur(e) {
			function eventTargetInElement(elem) {
				return elem.is(e.target) || elem.has(e.target).length !== 0
			}
			$('.sn-popover-basic').each(function() {
				var $popoverButton = $(this);
				var $popoverContent = $($popoverButton.data('target'));
				if (!$popoverButton.hasClass('active'))
					return;
				if (e.target.closest("#tag_form"))
					return;
				if (eventTargetInElement($popoverButton) || eventTargetInElement($popoverContent))
					return;
				if ($popoverButton.data('auto-close') === false && !$(e.target).is('.sn-popover-basic'))
					return;
				$popoverButton.popover('hide');
			});
		}
		var debouncedResetContainer = debounce(resetContainer);
		var debouncedHideOpenPopovers = debounce(hideOpenPopovers, 0, true);
		var debouncedCloseOnBlur = debounce(closeOnBlur, 10);
		$(window).on('resize', function() {
			if ('ontouchstart' in document.documentElement && document.activeElement.type === 'text')
				return;
debouncedHideOpenPopovers();
debouncedResetContainer();
		});
		$('html').on('click', function(e) {
			debouncedCloseOnBlur(e);
		});
		if (CustomEvent && CustomEvent.observe) {
			CustomEvent.observe('body_clicked', function(e) {
				debouncedCloseOnBlur(e);
			});
		}
	});
	$(document).on('show.bs.popover hide.bs.popover', function() {
		if (window._frameChanged)
			_frameChanged();
	})
})(jQuery);
;
/*! RESOURCE: /scripts/select2_doctype/select2.min.js */
!function(e){void 0===e.fn.each2&&e.extend(e.fn,{each2:function(t){for(var s=e([0]),i=-1,n=this.length;++i<n&&(s.context=s[0]=this[i])&&!1!==t.call(s[0],i,s););return this}})}(jQuery),function(e,t){"use strict";if(window.Select2===t){var s,i,n,o,a,r,l,c,h={x:0,y:0},d={TAB:9,ENTER:13,ESC:27,SPACE:32,LEFT:37,UP:38,RIGHT:39,DOWN:40,SHIFT:16,CTRL:17,ALT:18,PAGE_UP:33,PAGE_DOWN:34,HOME:36,END:35,BACKSPACE:8,DELETE:46,isArrow:function(e){switch(e=e.which?e.which:e){case d.LEFT:case d.RIGHT:case d.UP:case d.DOWN:return!0}return!1},isControl:function(e){switch(e.which){case d.SHIFT:case d.CTRL:case d.ALT:return!0}return!!e.metaKey},isFunctionKey:function(e){return(e=e.which?e.which:e)>=112&&e<=123}},u={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"};r=e(document),c=1,o=function(){return c++},s=L(Object,{bind:function(e){var t=this;return function(){e.apply(t,arguments)}},init:function(s){var i,n,a=".select2-results";this.opts=s=this.prepareOpts(s),this.id=s.id,s.element.data("select2")!==t&&null!==s.element.data("select2")&&s.element.data("select2").destroy(),this.container=this.createContainer(),this.liveRegion=e("<span>",{role:"status","aria-live":"polite"}).addClass("select2-hidden-accessible").appendTo(document.body),this.containerId="s2id_"+(s.element.attr("id")||"autogen"+o()),this.containerEventName=this.containerId.replace(/([.])/g,"_").replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g,"\\$1"),this.container.attr("id",this.containerId),this.container.attr("title",s.element.attr("title")),this.body=e("body"),y(this.container,this.opts.element,this.opts.adaptContainerCssClass),this.container.attr("style",s.element.attr("style")),this.container.css(I(s.containerCss,this.opts.element)),this.container.addClass(I(s.containerCssClass,this.opts.element)),this.container.attr("role","none"),this.elementTabIndex=this.opts.element.attr("tabindex"),this.opts.element.data("select2",this).attr("tabindex","-1").before(this.container).on("click.select2",S),this.container.data("select2",this),this.dropdown=this.container.find(".select2-drop"),y(this.dropdown,this.opts.element,this.opts.adaptDropdownCssClass),this.dropdown.addClass(I(s.dropdownCssClass,this.opts.element)),this.dropdown.data("select2",this),this.dropdown.on("click",S),this.results=i=this.container.find(a),this.search=n=this.container.find("input.select2-input"),this.queryCount=0,this.resultsPage=0,this.context=null,this.initContainer(),this.container.on("click",S),this.results.on("mousemove",(function(s){var i=h;i!==t&&i.x===s.pageX&&i.y===s.pageY||e(s.target).trigger("mousemove-filtered",s)})),this.dropdown.on("mousemove-filtered",a,this.bind(this.highlightUnderEvent)),this.dropdown.on("touchstart touchmove touchend",a,this.bind((function(e){this._touchEvent=!0,this.highlightUnderEvent(e)}))),this.dropdown.on("touchmove",a,this.bind(this.touchMoved)),this.dropdown.on("touchstart touchend",a,this.bind(this.clearTouchMoved)),this.dropdown.on("click",this.bind((function(e){this._touchEvent&&(this._touchEvent=!1,this.selectHighlighted())}))),function(e,t){var s=C(e,(function(e){t.trigger("scroll-debounced",e)}));t.on("scroll",(function(e){g(e.target,t.get())>=0&&s(e)}))}(80,this.results),this.dropdown.on("scroll-debounced",a,this.bind(this.loadMoreIfNeeded)),e(this.container).on("change",".select2-input",(function(e){e.stopPropagation()})),e(this.dropdown).on("change",".select2-input",(function(e){e.stopPropagation()})),e.fn.mousewheel&&i.mousewheel((function(e,t,s,n){var o=i.scrollTop();n>0&&o-n<=0?(i.scrollTop(0),S(e)):n<0&&i.get(0).scrollHeight-i.scrollTop()+n<=i.height()&&(i.scrollTop(i.get(0).scrollHeight-i.height()),S(e))})),w(n),n.on("keyup-change input paste",this.bind(this.updateResults)),n.on("focus",(function(){n.addClass("select2-focused")})),n.on("blur",(function(){n.removeClass("select2-focused")})),this.dropdown.on("mouseup",a,this.bind((function(t){e(t.target).closest(".select2-result-selectable").length>0&&(this.highlightUnderEvent(t),this.selectHighlighted(t))}))),this.dropdown.on("click mouseup mousedown touchstart touchend focusin",(function(e){e.stopPropagation()})),this.nextSearchTerm=t,e.isFunction(this.opts.initSelection)&&(this.initSelection(),this.monitorSource()),null!==s.maximumInputLength&&this.search.attr("maxlength",s.maximumInputLength);var r=s.element.prop("disabled");r===t&&(r=!1),this.enable(!r);var c=s.element.prop("readonly");c===t&&(c=!1),this.readonly(c),l=l||function(){var t=e("<div class='select2-measure-scrollbar'></div>");t.appendTo("body");var s={width:t.width()-t[0].clientWidth,height:t.height()-t[0].clientHeight};return t.remove(),s}(),this.autofocus=s.element.prop("autofocus"),s.element.prop("autofocus",!1),this.autofocus&&this.focus(),this.search.attr("placeholder",s.searchInputPlaceholder)},destroy:function(){var e=this.opts.element,s=e.data("select2"),i=this;this.close(),e.length&&e[0].detachEvent&&e.each((function(){this.detachEvent("onpropertychange",i._sync)})),this.propertyObserver&&(this.propertyObserver.disconnect(),this.propertyObserver=null),this._sync=null,s!==t&&(s.container.remove(),s.liveRegion.remove(),s.dropdown.remove(),e.removeClass("select2-offscreen").removeData("select2").off(".select2").prop("autofocus",this.autofocus||!1),this.elementTabIndex?e.attr({tabindex:this.elementTabIndex}):e.removeAttr("tabindex"),e.show()),R.call(this,"container","liveRegion","dropdown","results","search")},optionToData:function(e){return e.is("option")?{id:e.prop("value"),text:e.text(),element:e.get(),css:e.attr("class"),disabled:e.prop("disabled"),locked:m(e.attr("locked"),"locked")||m(e.data("locked"),!0)}:e.is("optgroup")?{text:e.attr("label"),children:[],element:e.get(),css:e.attr("class")}:void 0},sanitizeHtml:function(e){if(!e||"string"!=typeof e)return e;var t=["","background,cite,href,longdesc,src,xlink:href","accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan".toLowerCase(),"abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,style,summary,tabindex,target,title,type,valign,value,vspace,width",""].join(",");function s(e){if(e&&e.nodeType===Node.ELEMENT_NODE){for(var i=[],n=0;n<e.attributes.length;n++){var o=e.attributes[n].nodeName;t.indexOf(","+o.toLowerCase()+",")<0&&i.push(o)}for(n=0;n<i.length;n++)e.removeAttribute(i[n]);for(n=0;n<e.childNodes.length;n++)s(e.childNodes[n])}}e=e.replace(/(<script\b[^>]*>[\s\S]*?<\/script>)/gim,"");for(var i=(new DOMParser).parseFromString(e,"text/html"),n=i.documentElement.childNodes,o=0;o<n.length;o++)s(n[o]);return i.getElementsByTagName("body")[0].innerHTML},prepareOpts:function(s){var i,n,a,r,l=this;if("select"===(i=s.element).get(0).tagName.toLowerCase()&&(this.select=n=s.element),n&&e.each(["id","multiple","ajax","query","createSearchChoice","initSelection","data","tags"],(function(){if(this in s)throw new Error("Option '"+this+"' is not allowed for Select2 when attached to a <select> element.")})),"function"!=typeof(s=e.extend({},{populateResults:function(i,n,a){var r,c=this.opts.id,h=this.liveRegion;r=function(i,n,d){var u,p,f,g,m,v,b,w,C,S,y=[];for(u=0,p=(i=s.sortResults(i,n,a)).length;u<p;u+=1)g=!(m=!0===(f=i[u]).disabled)&&c(f)!==t,v=f.children&&f.children.length>0,(b=e("<li></li>")).addClass("select2-results-dept-"+d),b.addClass("select2-result"),b.addClass(g?"select2-result-selectable":"select2-result-unselectable"),m&&b.addClass("select2-disabled"),v&&b.addClass("select2-result-with-children"),b.addClass(l.opts.formatResultCssClass(f)),b.attr("role","presentation"),(w=e(document.createElement("div"))).addClass("select2-result-label"),w.attr("id","select2-result-label-"+o()),w.attr("role","option"),(S=s.formatResult(f,w,a,l.opts.escapeMarkup))!==t&&(w.html(l.sanitizeHtml(S)),b.append(w)),v&&((C=e("<ul></ul>")).addClass("select2-result-sub"),r(f.children,C,d+1),b.append(C)),b.data("select2-data",f),y.push(b[0]);n.append(y),h.text(s.formatMatches(i.length))},r(n,i,0)}},e.fn.select2.defaults,s)).id&&(a=s.id,s.id=function(e){return e[a]}),e.isArray(s.element.data("select2Tags"))){if("tags"in s)throw"tags specified as both an attribute 'data-select2-tags' and in options of Select2 "+s.element.attr("id");s.tags=s.element.data("select2Tags")}if(n?(s.query=this.bind((function(e){var s,n,o,a={results:[],more:!1},r=e.term;o=function(t,s){var i;t.is("option")?e.matcher(r,t.text(),t)&&s.push(l.optionToData(t)):t.is("optgroup")&&(i=l.optionToData(t),t.children().each2((function(e,t){o(t,i.children)})),i.children.length>0&&s.push(i))},s=i.children(),this.getPlaceholder()!==t&&s.length>0&&(n=this.getPlaceholderOption())&&(s=s.not(n)),s.each2((function(e,t){o(t,a.results)})),e.callback(a)})),s.id=function(e){return e.id}):"query"in s||("ajax"in s?((r=s.element.data("ajax-url"))&&r.length>0&&(s.ajax.url=r),s.query=T.call(s.element,s.ajax)):"data"in s?s.query=k(s.data):"tags"in s&&(s.query=O(s.tags),s.createSearchChoice===t&&(s.createSearchChoice=function(t){return{id:e.trim(t),text:e.trim(t)}}),s.initSelection===t&&(s.initSelection=function(t,i){var n=[];e(v(t.val(),s.separator)).each((function(){var t={id:this,text:this},i=s.tags;e.isFunction(i)&&(i=i()),e(i).each((function(){if(m(this.id,t.id))return t=this,!1})),n.push(t)})),i(n)}))),"function"!=typeof s.query)throw"query function not defined for Select2 "+s.element.attr("id");if("top"===s.createSearchChoicePosition)s.createSearchChoicePosition=function(e,t){e.unshift(t)};else if("bottom"===s.createSearchChoicePosition)s.createSearchChoicePosition=function(e,t){e.push(t)};else if("function"!=typeof s.createSearchChoicePosition)throw"invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";return s},monitorSource:function(){var s,i=this.opts.element,n=this;i.on("change.select2",this.bind((function(e){!0!==this.opts.element.data("select2-change-triggered")&&this.initSelection()}))),this._sync=this.bind((function(){var e=i.prop("disabled");e===t&&(e=!1),this.enable(!e);var s=i.prop("readonly");s===t&&(s=!1),this.readonly(s),y(this.container,this.opts.element,this.opts.adaptContainerCssClass),this.container.addClass(I(this.opts.containerCssClass,this.opts.element)),y(this.dropdown,this.opts.element,this.opts.adaptDropdownCssClass),this.dropdown.addClass(I(this.opts.dropdownCssClass,this.opts.element))})),i.length&&i[0].attachEvent&&i.each((function(){this.attachEvent("onpropertychange",n._sync)})),(s=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver)!==t&&(this.propertyObserver&&(delete this.propertyObserver,this.propertyObserver=null),this.propertyObserver=new s((function(t){e.each(t,n._sync)})),this.propertyObserver.observe(i.get(0),{attributes:!0,subtree:!1}))},triggerSelect:function(t){var s=e.Event("select2-selecting",{val:this.id(t),object:t,choice:t});return this.opts.element.trigger(s),!s.isDefaultPrevented()},triggerChange:function(t){t=t||{},t=e.extend({},t,{type:"change",val:this.val()}),this.opts.element.data("select2-change-triggered",!0),this.opts.element.trigger(t),this.opts.element.data("select2-change-triggered",!1),this.opts.element.click(),this.opts.blurOnChange&&this.opts.element.blur()},isInterfaceEnabled:function(){return!0===this.enabledInterface},enableInterface:function(){var e=this._enabled&&!this._readonly,t=!e;return e!==this.enabledInterface&&(this.container.toggleClass("select2-container-disabled",t),this.close(),this.enabledInterface=e,!0)},enable:function(e){e===t&&(e=!0),this._enabled!==e&&(this._enabled=e,this.opts.element.prop("disabled",!e),this.enableInterface())},disable:function(){this.enable(!1)},readonly:function(e){e===t&&(e=!1),this._readonly!==e&&(this._readonly=e,this.opts.element.prop("readonly",e),this.enableInterface())},opened:function(){return!!this.container&&this.container.hasClass("select2-dropdown-open")},positionDropdown:function(){var t,s,i,n,o,a=this.dropdown,r=this.container.offset(),c=this.container.outerHeight(!1),h=this.container.outerWidth(!1),d=a.outerHeight(!1),u=e(window),p=u.width(),f=u.height(),g=u.scrollLeft()+p,m=u.scrollTop()+f,v=r.top+c,b=r.left,w=v+d<=m,C=r.top-d>=u.scrollTop(),S=a.outerWidth(!1),y=b+S<=g;if(a.hasClass("select2-drop-above")?(s=!0,!C&&w&&(i=!0,s=!1)):(s=!1,!w&&C&&(i=!0,s=!0)),i&&(a.hide(),r=this.container.offset(),c=this.container.outerHeight(!1),h=this.container.outerWidth(!1),d=a.outerHeight(!1),g=u.scrollLeft()+p,m=u.scrollTop()+f,v=r.top+c,y=(b=r.left)+(S=a.outerWidth(!1))<=g,a.show(),this.focusSearch()),this.opts.dropdownAutoWidth?(o=e(".select2-results",a)[0],a.addClass("select2-drop-auto-width"),a.css("width",""),(S=a.outerWidth(!1)+(o.scrollHeight===o.clientHeight?0:l.width))>h?h=S:S=h,d=a.outerHeight(!1),y=b+S<=g):this.container.removeClass("select2-drop-auto-width"),"static"!==this.body.css("position")&&(v-=(t=this.body.offset()).top,b-=t.left),y||(b=r.left+this.container.outerWidth(!1)-S),n={left:b,width:h},s){n.top=r.top-d;if(n.top<5){var x=a.find(".select2-results"),E=x.height()+n.top-5;x.css("max-height",E+"px"),n.top=5}n.bottom="auto",this.container.addClass("select2-drop-above"),a.addClass("select2-drop-above")}else n.top=v,n.bottom="auto",this.container.removeClass("select2-drop-above"),a.removeClass("select2-drop-above");n=e.extend(n,I(this.opts.dropdownCss,this.opts.element)),a.css(n)},shouldOpen:function(){var t;return!this.opened()&&(!1!==this._enabled&&!0!==this._readonly&&(t=e.Event("select2-opening"),this.opts.element.trigger(t),!t.isDefaultPrevented()))},clearDropdownAlignmentPreference:function(){this.container.removeClass("select2-drop-above"),this.dropdown.removeClass("select2-drop-above")},open:function(){return!!this.shouldOpen()&&(this.opening(),r.on("mousemove.select2Event",(function(e){h.x=e.pageX,h.y=e.pageY})),!0)},opening:function(){var t,s=this.containerEventName,i="scroll."+s,n="resize."+s,o="orientationchange."+s;this.container.addClass("select2-dropdown-open").addClass("select2-container-active"),this.clearDropdownAlignmentPreference(),this.dropdown[0]!==this.body.children().last()[0]&&this.dropdown.detach().appendTo(this.body),0==(t=e("#select2-drop-mask")).length&&((t=e(document.createElement("div"))).attr("id","select2-drop-mask").attr("class","select2-drop-mask"),t.hide(),t.appendTo(this.body),t.on("mousedown touchstart click",(function(s){p(t);var i,n=e("#select2-drop");n.length>0&&((i=n.data("select2")).opts.selectOnBlur&&i.selectHighlighted({noFocus:!0}),i.close(),s.preventDefault(),s.stopPropagation())}))),this.dropdown.prev()[0]!==t[0]&&this.dropdown.before(t),e("#select2-drop").removeAttr("id"),this.dropdown.attr("id","select2-drop"),t.show(),this.positionDropdown(),this.dropdown.show(),this.positionDropdown(),this.dropdown.addClass("select2-drop-active");var a=this;this.container.parents().add(window).each((function(){e(this).on(n+" "+i+" "+o,(function(e){a.opened()&&a.positionDropdown()}))}))},close:function(){if(this.opened()){var t=this.containerEventName,s="scroll."+t,i="resize."+t,n="orientationchange."+t;this.container.parents().add(window).each((function(){e(this).off(s).off(i).off(n)})),this.clearDropdownAlignmentPreference(),e("#select2-drop-mask").hide(),this.dropdown.removeAttr("id"),this.dropdown.hide(),this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active"),this.results.empty(),r.off("mousemove.select2Event"),this.clearSearch(),this.search.removeClass("select2-active"),this.opts.element.trigger(e.Event("select2-close"))}},externalSearch:function(e){this.open(),this.search.val(e),this.updateResults(!1)},clearSearch:function(){},getMaximumSelectionSize:function(){return I(this.opts.maximumSelectionSize,this.opts.element)},ensureHighlightVisible:function(){var t,s,i,n,o,a,r,l,c=this.results;(s=this.highlight())<0||(0!=s?(t=this.findHighlightableChoices().find(".select2-result-label"),n=(l=((i=e(t[s])).offset()||{}).top||0)+i.outerHeight(!0),s===t.length-1&&(r=c.find("li.select2-more-results")).length>0&&(n=r.offset().top+r.outerHeight(!0)),n>(o=c.offset().top+c.outerHeight(!0))&&c.scrollTop(c.scrollTop()+(n-o)),(a=l-c.offset().top)<0&&"none"!=i.css("display")&&c.scrollTop(c.scrollTop()+a)):c.scrollTop(0))},findHighlightableChoices:function(){return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)")},moveHighlight:function(t){for(var s=this.findHighlightableChoices(),i=this.highlight();i>-1&&i<s.length;){var n=e(s[i+=t]);if(n.hasClass("select2-result-selectable")&&!n.hasClass("select2-disabled")&&!n.hasClass("select2-selected")){this.highlight(i);break}}},highlight:function(t){var s,i,n=this.findHighlightableChoices();if(0===arguments.length)return g(n.filter(".select2-highlighted")[0],n.get());t>=n.length&&(t=n.length-1),t<0&&(t=0),this.removeHighlight(),(s=e(n[t])).addClass("select2-highlighted"),this.search.attr("aria-activedescendant",s.find(".select2-result-label").attr("id")),this.ensureHighlightVisible(),this.liveRegion.text(""),(i=s.data("select2-data"))&&this.opts.element.trigger({type:"select2-highlight",val:this.id(i),choice:i})},removeHighlight:function(){this.results.find(".select2-highlighted").removeClass("select2-highlighted")},touchMoved:function(){this._touchMoved=!0},clearTouchMoved:function(){this._touchMoved=!1},countSelectableResults:function(){return this.findHighlightableChoices().length},highlightUnderEvent:function(t){var s=e(t.target).closest(".select2-result-selectable");if(s.length>0&&!s.is(".select2-highlighted")){var i=this.findHighlightableChoices();this.highlight(i.index(s))}else 0==s.length&&this.removeHighlight()},loadMoreIfNeeded:function(){var e=this.results,t=e.find("li.select2-more-results"),s=this.resultsPage+1,i=this,n=this.search.val(),o=this.context;0!==t.length&&t.offset().top-e.offset().top-e.height()<=this.opts.loadMorePadding&&(t.addClass("select2-active"),this.opts.query({element:this.opts.element,term:n,page:s,context:o,matcher:this.opts.matcher,callback:this.bind((function(a){i.opened()&&(i.opts.populateResults.call(this,e,a.results,{term:n,page:s,context:o}),i.postprocessResults(a,!1,!1),!0===a.more?(t.detach().appendTo(e).text(I(i.opts.formatLoadMore,i.opts.element,s+1)),window.setTimeout((function(){i.loadMoreIfNeeded()}),10)):t.remove(),i.positionDropdown(),i.resultsPage=s,i.context=a.context,this.opts.element.trigger({type:"select2-loaded",items:a}))}))}))},tokenize:function(){},updateResults:function(s){var i,n,o,a=this.search,r=this.results,l=this.opts,c=this,h=a.val(),d=e.data(this.container,"select2-last-term");if((!0===s||!d||!m(h,d))&&(e.data(this.container,"select2-last-term",h),!0===s||!1!==this.showSearchInput&&this.opened())){o=++this.queryCount;var u=this.getMaximumSelectionSize();if(!(u>=1&&(i=this.data(),e.isArray(i)&&i.length>=u&&P(l.formatSelectionTooBig,"formatSelectionTooBig"))))return a.val().length<l.minimumInputLength?(P(l.formatInputTooShort,"formatInputTooShort")?f("<li class='select2-no-results'>"+I(l.formatInputTooShort,l.element,a.val(),l.minimumInputLength)+"</li>"):f(""),void(s&&this.showSearch&&this.showSearch(!0))):void(l.maximumInputLength&&a.val().length>l.maximumInputLength?P(l.formatInputTooLong,"formatInputTooLong")?f("<li class='select2-no-results'>"+I(l.formatInputTooLong,l.element,a.val(),l.maximumInputLength)+"</li>"):f(""):(l.formatSearching&&0===this.findHighlightableChoices().length&&f("<li class='select2-searching'>"+I(l.formatSearching,l.element)+"</li>"),a.addClass("select2-active"),this.removeHighlight(),(n=this.tokenize())!=t&&null!=n&&a.val(n),this.resultsPage=1,l.query({element:l.element,term:a.val(),page:this.resultsPage,context:null,matcher:l.matcher,callback:this.bind((function(i){var n;o==this.queryCount&&(this.opened()?i.hasError!==t&&P(l.formatAjaxError,"formatAjaxError")?f("<li class='select2-ajax-error'>"+I(l.formatAjaxError,l.element,i.jqXHR,i.textStatus,i.errorThrown)+"</li>"):(this.context=i.context===t?null:i.context,this.opts.createSearchChoice&&""!==a.val()&&(n=this.opts.createSearchChoice.call(c,a.val(),i.results))!==t&&null!==n&&c.id(n)!==t&&null!==c.id(n)&&0===e(i.results).filter((function(){return m(c.id(this),c.id(n))})).length&&this.opts.createSearchChoicePosition(i.results,n),0===i.results.length&&P(l.formatNoMatches,"formatNoMatches")?f("<li class='select2-no-results'>"+I(l.formatNoMatches,l.element,a.val())+"</li>"):(r.empty(),c.opts.populateResults.call(this,r,i.results,{term:a.val(),page:this.resultsPage,context:null}),!0===i.more&&P(l.formatLoadMore,"formatLoadMore")&&(r.append("<li class='select2-more-results'>"+l.escapeMarkup(I(l.formatLoadMore,l.element,this.resultsPage))+"</li>"),window.setTimeout((function(){c.loadMoreIfNeeded()}),10)),this.postprocessResults(i,s),p(),this.opts.element.trigger({type:"select2-loaded",items:i}))):this.search.removeClass("select2-active"))}))})));f("<li class='select2-selection-limit'>"+I(l.formatSelectionTooBig,l.element,u)+"</li>")}function p(){a.removeClass("select2-active"),c.positionDropdown(),r.find(".select2-no-results,.select2-selection-limit,.select2-searching").length?c.liveRegion.text(r.text()):c.liveRegion.text(c.opts.formatMatches(r.find(".select2-result-selectable").length))}function f(e){r.html(e),p()}},cancel:function(){this.close()},blur:function(){this.opts.selectOnBlur&&this.selectHighlighted({noFocus:!0}),this.close(),this.container.removeClass("select2-container-active"),this.search[0]===document.activeElement&&this.search.blur(),this.clearSearch(),this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus")},focusSearch:function(){var e;(e=this.search)[0]!==document.activeElement&&window.setTimeout((function(){var t,s=e[0],i=e.val().length;e.focus(),(s.offsetWidth>0||s.offsetHeight>0)&&s===document.activeElement&&(s.setSelectionRange?s.setSelectionRange(i,i):s.createTextRange&&((t=s.createTextRange()).collapse(!1),t.select()))}),0)},selectHighlighted:function(e){if(this._touchMoved)this.clearTouchMoved();else{var t=this.highlight(),s=this.results.find(".select2-highlighted").closest(".select2-result").data("select2-data");s?(this.highlight(t),this.onSelect(s,e)):e&&e.noFocus&&this.close()}},getPlaceholder:function(){var e;return this.opts.element.attr("placeholder")||this.opts.element.attr("data-placeholder")||this.opts.element.data("placeholder")||this.opts.placeholder||((e=this.getPlaceholderOption())!==t?e.text():t)},getPlaceholderOption:function(){if(this.select){var s=this.select.children("option").first();if(this.opts.placeholderOption!==t)return"first"===this.opts.placeholderOption&&s||"function"==typeof this.opts.placeholderOption&&this.opts.placeholderOption(this.select);if(""===e.trim(s.text())&&""===s.val())return s}},initContainerWidth:function(){var s=function(){var s,i,n,o,a;if("off"===this.opts.width)return null;if("element"===this.opts.width)return 0===this.opts.element.outerWidth(!1)?"auto":this.opts.element.outerWidth(!1)+"px";if("copy"===this.opts.width||"resolve"===this.opts.width){if((s=this.opts.element.attr("style"))!==t)for(o=0,a=(i=s.split(";")).length;o<a;o+=1)if(null!==(n=i[o].replace(/\s/g,"").match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i))&&n.length>=1)return n[1];return"resolve"===this.opts.width?(s=this.opts.element.css("width")).indexOf("%")>0?s:0===this.opts.element.outerWidth(!1)?"auto":this.opts.element.outerWidth(!1)+"px":null}return e.isFunction(this.opts.width)?this.opts.width():this.opts.width}.call(this);null!==s&&this.container.css("width",s)}}),i=L(s,{createContainer:function(){var t=this.opts.element.attr("aria-label");return e(document.createElement("div")).attr({class:"select2-container"}).html(["<input class='select2-focusser select2-offscreen' type='text' role='combobox' aria-expanded='false' aria-controls='select2-drop'/>","<a href='javascript:void(0)' class='select2-choice' tabindex='-1' aria-hidden='true' role='button'>","   <span class='select2-chosen'>&#160;</span>","   <span class='select2-arrow' aria-hidden='true'><b></b></span>","</a>","<abbr role='button' class='select2-search-choice-close' tabindex='0' "+(this.opts.clearAriaLabel?"aria-label='"+this.opts.clearAriaLabel+"'":"")+"></abbr>","<div class='select2-drop select2-display-none'>","   <div class='select2-search'>","       <label for='' class='select2-offscreen'",t?"aria-label='"+t+"'":"","></label>","       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'","       aria-autocomplete='list' />","   </div>","   <ul class='select2-results' role='listbox' aria-label='select2-results'>","   </ul>","</div>"].join(""))},enableInterface:function(){this.parent.enableInterface.apply(this,arguments)&&this.focusser.prop("disabled",!this.isInterfaceEnabled())},opening:function(){var s,i,n;this.opts.minimumResultsForSearch>=0&&this.showSearch(!0),this.parent.opening.apply(this,arguments),!1!==this.showSearchInput&&this.search.val(this.focusser.val()),this.opts.shouldFocusInput(this)&&(this.search.focus(),(s=this.search.get(0)).createTextRange?((i=s.createTextRange()).collapse(!1),i.select()):s.setSelectionRange&&(n=this.search.val().length,s.setSelectionRange(n,n))),""===this.search.val()&&this.nextSearchTerm!=t&&(this.search.val(this.nextSearchTerm),this.search.select()),this.focusser.prop("disabled",!0).val(""),this.updateResults(!0),this.opts.element.trigger(e.Event("select2-open")),this.container.find("input")[0].ariaExpanded=!0},close:function(){this.opened()&&(this.parent.close.apply(this,arguments),this.focusser.prop("disabled",!1),this.opts.shouldFocusInput(this)&&this.focusser.focus(),this.container.find("input")[0].ariaExpanded=!1)},focus:function(){this.opened()?this.close():(this.focusser.prop("disabled",!1),this.opts.shouldFocusInput(this)&&this.focusser.focus())},isFocused:function(){return this.container.hasClass("select2-container-active")},cancel:function(){this.parent.cancel.apply(this,arguments),this.focusser.prop("disabled",!1),this.opts.shouldFocusInput(this)&&this.focusser.focus()},destroy:function(){e("label[for='"+this.focusser.attr("id")+"']").attr("for",this.opts.element.attr("id")),this.parent.destroy.apply(this,arguments),R.call(this,"selection","focusser")},initContainer:function(){var t,s=this.container,i=this.dropdown,n=o();if(this.opts.minimumResultsForSearch<0?this.showSearch(!1):this.showSearch(!0),this.selection=t=s.find(".select2-choice"),this.focusser=s.find(".select2-focusser"),t.find(".select2-chosen").attr("id","select2-chosen-"+n),this.focusser.attr("aria-labelledby","select2-chosen-"+n),this.results.attr("id","select2-results-"+n),this.search.attr("aria-owns","select2-results-"+n),this.opts.element.attr("aria-required")&&this.focusser.attr("aria-required",this.opts.element.attr("aria-required")),this.focusser.attr("id","s2id_autogen"+n),this.originalLabel=e("label[for='"+this.opts.element.attr("id")+"']"),this.originalLabel.length){this.originalLabel.attr("for",this.focusser.attr("id"));var a=this.originalLabel.attr("id")||this.focusser.attr("id")+"-label";this.originalLabel.attr("id",a),this.focusser.attr("aria-labelledby",this.focusser.attr("aria-labelledby")+" "+this.originalLabel.attr("id"))}var r=this.opts.element.attr("title");this.opts.element.attr("title",r||this.originalLabel.text()),this.focusser.attr("tabindex",this.elementTabIndex),this.search.attr("id",this.focusser.attr("id")+"_search"),this.search.prev().text(e("label[for='"+this.focusser.attr("id")+"']").text()).attr("for",this.search.attr("id")),this.search.on("keydown",this.bind((function(e){if(this.isInterfaceEnabled()&&229!=e.keyCode)if(e.which!==d.PAGE_UP&&e.which!==d.PAGE_DOWN)switch(e.which){case d.UP:case d.DOWN:return this.moveHighlight(e.which===d.UP?-1:1),void S(e);case d.ENTER:return this.selectHighlighted(),void S(e);case d.TAB:return void this.selectHighlighted({noFocus:!0});case d.ESC:return this.cancel(e),void S(e)}else S(e)}))),this.search.on("blur",this.bind((function(e){document.activeElement===this.body.get(0)&&e.relatedTarget&&window.setTimeout(this.bind((function(){this.opened()&&this.search.focus()})),0)}))),this.focusser.on("keydown",this.bind((function(e){if(this.isInterfaceEnabled()&&e.which!==d.TAB&&!d.isControl(e)&&!d.isFunctionKey(e)&&e.which!==d.ESC){if(!1!==this.opts.openOnEnter||e.which!==d.ENTER){if(e.which==d.DOWN||e.which==d.ENTER&&this.opts.openOnEnter){if(e.altKey||e.ctrlKey||e.shiftKey||e.metaKey)return;return this.open(),void S(e)}return e.which==d.DELETE||e.which==d.BACKSPACE?(this.opts.allowClear&&this.clear(),void S(e)):void 0}S(e)}}))),w(this.focusser),this.focusser.on("keyup-change input",this.bind((function(e){if(this.opts.minimumResultsForSearch>=0){if(e.stopPropagation(),this.opened())return;this.open()}})));var l=this.bind((function(e){var t;this.isInterfaceEnabled()&&(this.clear(),(t=e).preventDefault(),t.stopImmediatePropagation(),this.close(),this.selection.focus())}));s.on("mousedown touchstart","abbr",l).on("keydown","abbr",(function(e){switch(e.which){case d.ENTER:case d.SPACE:l(e)}})),t.on("mousedown touchstart",this.bind((function(s){p(t),this.container.hasClass("select2-container-active")||this.opts.element.trigger(e.Event("select2-focus")),this.opened()?this.close():this.isInterfaceEnabled()&&this.open(),S(s)}))),i.on("mousedown touchstart",this.bind((function(){this.opts.shouldFocusInput(this)&&this.search.focus()}))),t.on("focus",this.bind((function(e){S(e)}))),this.focusser.on("focus",this.bind((function(){this.container.hasClass("select2-container-active")||this.opts.element.trigger(e.Event("select2-focus")),this.container.addClass("select2-container-active")}))).on("blur",this.bind((function(){this.opened()||(this.container.removeClass("select2-container-active"),this.opts.element.trigger(e.Event("select2-blur")))}))),this.search.on("focus",this.bind((function(){this.container.hasClass("select2-container-active")||this.opts.element.trigger(e.Event("select2-focus")),this.container.addClass("select2-container-active")}))),this.initContainerWidth(),this.opts.element.addClass("select2-offscreen"),this.opts.element.attr("aria-hidden","true"),this.setPlaceholder()},clear:function(t){var s=this.selection.data("select2-data");if(s){var i=e.Event("select2-clearing");if(this.opts.element.trigger(i),i.isDefaultPrevented())return;var n=this.getPlaceholderOption();this.opts.element.val(n?n.val():""),this.selection.find(".select2-chosen").empty(),this.selection.removeData("select2-data"),this.setPlaceholder(),!1!==t&&(this.opts.element.trigger({type:"select2-removed",val:this.id(s),choice:s}),this.triggerChange({removed:s}))}},initSelection:function(){if(this.isPlaceholderOptionSelected())this.updateSelection(null),this.close(),this.setPlaceholder();else{var e=this;this.opts.initSelection.call(null,this.opts.element,(function(s){s!==t&&null!==s&&(e.updateSelection(s),e.close(),e.setPlaceholder(),e.nextSearchTerm=e.opts.nextSearchTerm(s,e.search.val()))}))}},isPlaceholderOptionSelected:function(){var e;return this.getPlaceholder()!==t&&((e=this.getPlaceholderOption())!==t&&e.prop("selected")||""===this.opts.element.val()||this.opts.element.val()===t||null===this.opts.element.val())},prepareOpts:function(){var t=this.parent.prepareOpts.apply(this,arguments),s=this;return"select"===t.element.get(0).tagName.toLowerCase()?t.initSelection=function(e,t){var i=e.find("option").filter((function(){return this.selected&&!this.disabled}));t(s.optionToData(i))}:"data"in t&&(t.initSelection=t.initSelection||function(s,i){var n=s.val(),o=null;t.query({matcher:function(e,s,i){var a=m(n,t.id(i));return a&&(o=i),a},callback:e.isFunction(i)?function(){i(o)}:e.noop})}),t},getPlaceholder:function(){return this.select&&this.getPlaceholderOption()===t?t:this.parent.getPlaceholder.apply(this,arguments)},setPlaceholder:function(){var e=this.getPlaceholder();if(this.isPlaceholderOptionSelected()&&e!==t){if(this.select&&this.getPlaceholderOption()===t)return;this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(e)),this.selection.addClass("select2-default"),this.container.removeClass("select2-allowclear")}},postprocessResults:function(e,t,s){var i=0,n=this;if(this.findHighlightableChoices().each2((function(e,t){if(m(n.id(t.data("select2-data")),n.opts.element.val()))return i=e,!1})),!1!==s&&(!0===t&&i>=0?this.highlight(i):this.highlight(0)),!0===t){var o=this.opts.minimumResultsForSearch;o>=0&&this.showSearch(A(e.results)>=o)}},showSearch:function(t){this.showSearchInput!==t&&(this.showSearchInput=t,this.dropdown.find(".select2-search").toggleClass("select2-search-hidden",!t),this.dropdown.find(".select2-search").toggleClass("select2-offscreen",!t),e(this.dropdown,this.container).toggleClass("select2-with-searchbox",t))},onSelect:function(e,t){if(this.triggerSelect(e)){var s=this.opts.element.val(),i=this.data();this.opts.element.val(this.id(e)),this.updateSelection(e),this.opts.element.trigger({type:"select2-selected",val:this.id(e),choice:e}),this.nextSearchTerm=this.opts.nextSearchTerm(e,this.search.val()),this.close(),t&&t.noFocus||!this.opts.shouldFocusInput(this)||this.focusser.focus(),m(s,this.id(e))||this.triggerChange({added:e,removed:i})}},updateSelection:function(e){var s,i,n=this.selection.find(".select2-chosen");this.selection.data("select2-data",e),n.empty(),null!==e&&(s=this.opts.formatSelection(e,n,this.opts.escapeMarkup)),s!==t&&n.append(s),(i=this.opts.formatSelectionCssClass(e,n))!==t&&n.addClass(i),this.selection.removeClass("select2-default"),this.opts.allowClear&&this.getPlaceholder()!==t&&this.container.addClass("select2-allowclear")},val:function(){var e,s=!1,i=null,n=this,o=this.data();if(0===arguments.length)return this.opts.element.val();if(e=arguments[0],arguments.length>1&&(s=arguments[1]),this.select)this.select.val(e).find("option").filter((function(){return this.selected})).each2((function(e,t){return i=n.optionToData(t),!1})),this.updateSelection(i),this.setPlaceholder(),s&&this.triggerChange({added:i,removed:o});else{if(!e&&0!==e)return void this.clear(s);if(this.opts.initSelection===t)throw new Error("cannot call val() if initSelection() is not defined");this.opts.element.val(e),this.opts.initSelection(this.opts.element,(function(e){n.opts.element.val(e?n.id(e):""),n.updateSelection(e),n.setPlaceholder(),s&&n.triggerChange({added:e,removed:o})}))}},clearSearch:function(){this.search.val(""),this.focusser.val("")},data:function(e){var s,i=!1;if(0===arguments.length)return(s=this.selection.data("select2-data"))==t&&(s=null),s;arguments.length>1&&(i=arguments[1]),e?(s=this.data(),this.opts.element.val(e?this.id(e):""),this.updateSelection(e),i&&this.triggerChange({added:e,removed:s})):this.clear(i)}}),n=L(s,{createContainer:function(){var t=this.opts.element.attr("aria-label");return e(document.createElement("div")).attr({class:"select2-container select2-container-multi"}).html(["<ul class='select2-choices' role='presentation'>","  <li class='select2-search-field'>","    <label for='' class='select2-offscreen' ",t?"aria-label='"+t+"'":"","></label>","    <input type='text' role='combobox' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' aria-autocomplete='list' aria-controls='select2-drop'/>","  </li>","</ul>","<div class='select2-drop select2-drop-multi select2-display-none'>","   <ul class='select2-results' role='listbox' aria-label='select2-results'>","   </ul>","</div>"].join(""))},prepareOpts:function(){var t=this.parent.prepareOpts.apply(this,arguments),s=this;return"select"===t.element.get(0).tagName.toLowerCase()?t.initSelection=function(e,t){var i=[];e.find("option").filter((function(){return this.selected&&!this.disabled})).each2((function(e,t){i.push(s.optionToData(t))})),t(i)}:"data"in t&&(t.initSelection=t.initSelection||function(s,i){var n=v(s.val(),t.separator),o=[];t.query({matcher:function(s,i,a){var r=e.grep(n,(function(e){return m(e,t.id(a))})).length;return r&&o.push(a),r},callback:e.isFunction(i)?function(){for(var e=[],s=0;s<n.length;s++)for(var a=n[s],r=0;r<o.length;r++){var l=o[r];if(m(a,t.id(l))){e.push(l),o.splice(r,1);break}}i(e)}:e.noop})}),t},selectChoice:function(e){var t=this.container.find(".select2-search-choice-focus");t.length&&e&&e[0]==t[0]||(t.length&&this.opts.element.trigger("choice-deselected",t),t.removeClass("select2-search-choice-focus"),e&&e.length&&(this.close(),e.addClass("select2-search-choice-focus"),this.opts.element.trigger("choice-selected",e),this.liveRegion.text(e.text())))},destroy:function(){e("label[for='"+this.search.attr("id")+"']").attr("for",this.opts.element.attr("id")),this.parent.destroy.apply(this,arguments),R.call(this,"searchContainer","selection")},initContainer:function(){var t,s=".select2-choices";this.searchContainer=this.container.find(".select2-search-field"),this.selection=t=this.container.find(s);var i=this;this.selection.on("click",".select2-search-choice:not(.select2-locked)",(function(t){i.search[0].focus(),i.selectChoice(e(this))})),this.search.attr("id","s2id_autogen"+o()),this.results.attr("id",this.search.attr("id")+"_results"),this.search.attr("aria-owns",this.results.attr("id")),this.originalLabel=e("label[for='"+this.opts.element.attr("id")+"']"),this.originalLabel.length&&this.originalLabel.attr("for",this.search.attr("id")),this.opts.element.attr("aria-required")&&this.search.attr("aria-required",this.opts.element.attr("aria-required")),this.search.on("input paste",this.bind((function(){this.search.attr("placeholder")&&0==this.search.val().length||this.isInterfaceEnabled()&&(this.opened()||this.open())}))),this.search.attr("tabindex",this.elementTabIndex),this.keydowns=0,this.search.on("keydown",this.bind((function(s){if(this.isInterfaceEnabled()){++this.keydowns;var i=t.find(".select2-search-choice-focus"),n=i.prev(".select2-search-choice:not(.select2-locked)"),o=i.next(".select2-search-choice:not(.select2-locked)"),a=function(t){var s=0,i=0;if("selectionStart"in(t=e(t)[0]))s=t.selectionStart,i=t.selectionEnd-s;else if("selection"in document){t.focus();var n=document.selection.createRange();i=document.selection.createRange().text.length,n.moveStart("character",-t.value.length),s=n.text.length-i}return{offset:s,length:i}}(this.search);if(i.length&&(s.which==d.LEFT||s.which==d.RIGHT||s.which==d.BACKSPACE||s.which==d.DELETE||s.which==d.ENTER)){var r=i;return s.which==d.LEFT&&n.length?r=n:s.which==d.RIGHT?r=o.length?o:null:s.which===d.BACKSPACE?this.unselect(i.first())&&(this.search.width(10),r=n.length?n:o):s.which==d.DELETE?this.unselect(i.first())&&(this.search.width(10),r=o.length?o:null):s.which==d.ENTER&&(r=null),this.selectChoice(r),S(s),void(r&&r.length||this.open())}if((s.which===d.BACKSPACE&&1==this.keydowns||s.which==d.LEFT)&&0==a.offset&&!a.length)return this.selectChoice(t.find(".select2-search-choice:not(.select2-locked)").last()),void S(s);if(this.selectChoice(null),this.opened())switch(s.which){case d.UP:case d.DOWN:return this.moveHighlight(s.which===d.UP?-1:1),void S(s);case d.ENTER:return this.selectHighlighted(),void S(s);case d.TAB:return this.selectHighlighted({noFocus:!0}),void this.close();case d.ESC:return this.cancel(s),void S(s)}if(s.which!==d.TAB&&!d.isControl(s)&&!d.isFunctionKey(s)&&s.which!==d.BACKSPACE&&s.which!==d.ESC){if(s.which===d.ENTER){if(!1===this.opts.openOnEnter)return;if(s.altKey||s.ctrlKey||s.shiftKey||s.metaKey)return}this.open(),s.which!==d.PAGE_UP&&s.which!==d.PAGE_DOWN||S(s),s.which===d.ENTER&&S(s)}}}))),this.search.on("keyup",this.bind((function(e){this.keydowns=0,this.resizeSearch()}))),this.search.on("blur",this.bind((function(t){this.container.removeClass("select2-container-active"),this.search.removeClass("select2-focused"),this.selectChoice(null),this.opened()||this.clearSearch(),t.stopImmediatePropagation(),this.opts.element.trigger(e.Event("select2-blur"))}))),this.container.on("click",s,this.bind((function(t){this.isInterfaceEnabled()&&(e(t.target).closest(".select2-search-choice").length>0||(this.selectChoice(null),this.clearPlaceholder(),this.container.hasClass("select2-container-active")||this.opts.element.trigger(e.Event("select2-focus")),this.open(),this.focusSearch(),t.preventDefault()))}))),this.container.on("focus",s,this.bind((function(){this.isInterfaceEnabled()&&(this.container.hasClass("select2-container-active")||this.opts.element.trigger(e.Event("select2-focus")),this.container.addClass("select2-container-active"),this.dropdown.addClass("select2-drop-active"),this.clearPlaceholder())}))),this.initContainerWidth(),this.opts.element.addClass("select2-offscreen"),this.clearSearch()},enableInterface:function(){this.parent.enableInterface.apply(this,arguments)&&this.search.prop("disabled",!this.isInterfaceEnabled())},initSelection:function(){if(""===this.opts.element.val()&&""===this.opts.element.text()&&(this.updateSelection([]),this.close(),this.clearSearch()),this.select||""!==this.opts.element.val()){var e=this;this.opts.initSelection.call(null,this.opts.element,(function(s){s!==t&&null!==s&&(e.updateSelection(s),e.close(),e.clearSearch())}))}},clearSearch:function(){var e=this.getPlaceholder(),s=this.getMaxSearchWidth();e!==t&&0===this.getVal().length&&!1===this.search.hasClass("select2-focused")?(this.search.val(e).addClass("select2-default"),this.search.width(s>0?s:this.container.css("width"))):this.search.val("").width(10)},clearPlaceholder:function(){this.search.hasClass("select2-default")&&this.search.val("").removeClass("select2-default")},opening:function(){this.clearPlaceholder(),this.resizeSearch(),this.parent.opening.apply(this,arguments),this.focusSearch(),""===this.search.val()&&this.nextSearchTerm!=t&&(this.search.val(this.nextSearchTerm),this.search.select()),this.updateResults(!0),this.opts.shouldFocusInput(this)&&this.search.focus(),this.opts.element.trigger(e.Event("select2-open"))},close:function(){this.opened()&&this.parent.close.apply(this,arguments)},focus:function(){this.close(),this.search.focus()},isFocused:function(){return this.search.hasClass("select2-focused")},updateSelection:function(t){var s=[],i=[],n=this;e(t).each((function(){g(n.id(this),s)<0&&(s.push(n.id(this)),i.push(this))})),t=i,this.selection.find(".select2-search-choice").remove(),e(t).each((function(){n.addSelectedChoice(this)})),n.postprocessResults()},tokenize:function(){var e=this.search.val();null!=(e=this.opts.tokenizer.call(this,e,this.data(),this.bind(this.onSelect),this.opts))&&e!=t&&(this.search.val(e),e.length>0&&this.open())},onSelect:function(e,s){if(this.triggerSelect(e)&&""!==e.text){this.addSelectedChoice(e),this.opts.element.trigger({type:"selected",val:this.id(e),choice:e}),this.nextSearchTerm=this.opts.nextSearchTerm(e,this.search.val()),this.clearSearch(),this.updateResults();var i=this.getVal().map((function(e){return this.search.attr("id")+"_choice_"+e}),this).join(" ");this.search.attr("aria-describedby",i),!this.select&&this.opts.closeOnSelect||this.postprocessResults(e,!1,!0===this.opts.closeOnSelect),this.opts.closeOnSelect?(this.close(),this.search.width(10)):this.countSelectableResults()>0?(this.search.width(10),this.resizeSearch(),this.getMaximumSelectionSize()>0&&this.val().length>=this.getMaximumSelectionSize()?this.updateResults(!0):this.nextSearchTerm!=t&&(this.search.val(this.nextSearchTerm),this.updateResults(),this.search.select()),this.positionDropdown()):(this.close(),this.search.width(10)),this.triggerChange({added:e}),s&&s.noFocus||this.focusSearch()}},cancel:function(){this.close(),this.focusSearch()},addSelectedChoice:function(s){var i,n,o=!s.locked,a=e("<li class='select2-search-choice'>    <div></div>    <a href='#' role='button' class='select2-search-choice-close' tabindex='-1'></a></li>"),r=e("<li class='select2-search-choice select2-locked'><div></div></li>"),l=o?a:r,c=this.id(s),h=this.getVal();l.attr("id",this.search.attr("id")+"_choice_"+c),(i=this.opts.formatSelection(s,l.find("div"),this.opts.escapeMarkup))!=t&&l.find("div").replaceWith("<div>"+i+"</div>"),(n=this.opts.formatSelectionCssClass(s,l.find("div")))!=t&&l.addClass(n),o&&l.find(".select2-search-choice-close").on("mousedown",S).on("click dblclick",this.bind((function(t){this.isInterfaceEnabled()&&(this.unselect(e(t.target)),this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus"),S(t),this.close(),this.focusSearch())}))).on("focus",this.bind((function(){this.isInterfaceEnabled()&&(this.container.addClass("select2-container-active"),this.dropdown.addClass("select2-drop-active"))}))),l.data("select2-data",s),l.insertBefore(this.searchContainer),h.push(c),this.setVal(h)},unselect:function(t){var s,i,n=this.getVal();if(0===(t=t.closest(".select2-search-choice")).length)throw"Invalid argument: "+t+". Must be .select2-search-choice";if(s=t.data("select2-data")){var o=e.Event("select2-removing");if(o.val=this.id(s),o.choice=s,this.opts.element.trigger(o),o.isDefaultPrevented())return!1;for(;(i=g(this.id(s),n))>=0;)n.splice(i,1),this.setVal(n),this.select&&this.postprocessResults();return t.remove(),this.opts.element.trigger({type:"select2-removed",val:this.id(s),choice:s}),this.triggerChange({removed:s}),!0}},postprocessResults:function(e,t,s){var i=this.getVal(),n=this.results.find(".select2-result"),o=this.results.find(".select2-result-with-children"),a=this;n.each2((function(e,t){g(a.id(t.data("select2-data")),i)>=0&&(t.addClass("select2-selected"),t.find(".select2-result-selectable").addClass("select2-selected"))})),o.each2((function(e,t){t.is(".select2-result-selectable")||0!==t.find(".select2-result-selectable:not(.select2-selected)").length||t.addClass("select2-selected")})),-1==this.highlight()&&!1!==s&&a.highlight(0),!this.opts.createSearchChoice&&!n.filter(".select2-result:not(.select2-selected)").length>0&&(!e||e&&!e.more&&0===this.results.find(".select2-no-results").length)&&P(a.opts.formatNoMatches,"formatNoMatches")&&this.results.append("<li class='select2-no-results'>"+I(a.opts.formatNoMatches,a.opts.element,a.search.val())+"</li>")},getMaxSearchWidth:function(){return this.selection.width()-b(this.search)},resizeSearch:function(){var t,s,i,n,o=b(this.search);t=function(t){if(!a){var s=t[0].currentStyle||window.getComputedStyle(t[0],null);(a=e(document.createElement("div")).css({position:"absolute",left:"-10000px",top:"-10000px",display:"none",fontSize:s.fontSize,fontFamily:s.fontFamily,fontStyle:s.fontStyle,fontWeight:s.fontWeight,letterSpacing:s.letterSpacing,textTransform:s.textTransform,whiteSpace:"nowrap"})).attr("class","select2-sizer"),e("body").append(a)}return a.text(t.val()),a.width()}(this.search)+10,s=this.search.offset().left,(n=(i=this.selection.width())-(s-this.selection.offset().left)-o)<t&&(n=i-o),n<40&&(n=i-o),n<=0&&(n=t),this.search.width(Math.floor(n))},getVal:function(){var e;return this.select?null===(e=this.select.val())?[]:e:v(e=this.opts.element.val(),this.opts.separator)},setVal:function(t){var s;this.select?this.select.val(t):(s=[],e(t).each((function(){g(this,s)<0&&s.push(this)})),this.opts.element.val(0===s.length?"":s.join(this.opts.separator)))},buildChangeDetails:function(e,t){t=t.slice(0),e=e.slice(0);for(var s=0;s<t.length;s++)for(var i=0;i<e.length;i++)m(this.opts.id(t[s]),this.opts.id(e[i]))&&(t.splice(s,1),s>0&&s--,e.splice(i,1),i--);return{added:t,removed:e}},val:function(s,i){var n,o=this;if(0===arguments.length)return this.getVal();if((n=this.data()).length||(n=[]),!s&&0!==s)return this.opts.element.val(""),this.updateSelection([]),this.clearSearch(),void(i&&this.triggerChange({added:this.data(),removed:n}));if(this.setVal(s),this.select)this.opts.initSelection(this.select,this.bind(this.updateSelection)),i&&this.triggerChange(this.buildChangeDetails(n,this.data()));else{if(this.opts.initSelection===t)throw new Error("val() cannot be called if initSelection() is not defined");this.opts.initSelection(this.opts.element,(function(t){var s=e.map(t,o.id);o.setVal(s),o.updateSelection(t),o.clearSearch(),i&&o.triggerChange(o.buildChangeDetails(n,o.data()))}))}this.clearSearch()},onSortStart:function(){if(this.select)throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");this.search.width(0),this.searchContainer.hide()},onSortEnd:function(){var t=[],s=this;this.searchContainer.show(),this.searchContainer.appendTo(this.searchContainer.parent()),this.resizeSearch(),this.selection.find(".select2-search-choice").each((function(){t.push(s.opts.id(e(this).data("select2-data")))})),this.setVal(t),this.triggerChange()},data:function(t,s){var i,n,o=this;if(0===arguments.length)return this.selection.children(".select2-search-choice").map((function(){return e(this).data("select2-data")})).get();n=this.data(),t||(t=[]),i=e.map(t,(function(e){return o.opts.id(e)})),this.setVal(i),this.updateSelection(t),this.clearSearch(),s&&this.triggerChange(this.buildChangeDetails(n,this.data()))}}),e.fn.select2=function(){var s,i,n,o,a,r=Array.prototype.slice.call(arguments,0),l=["val","destroy","opened","open","close","focus","isFocused","container","dropdown","onSortStart","onSortEnd","enable","disable","readonly","positionDropdown","data","search"],c=["opened","isFocused","container","dropdown"],h=["val","data"],d={search:"externalSearch"};return this.each((function(){if(0===r.length||"object"==typeof r[0])(s=0===r.length?{}:e.extend({},r[0])).element=e(this),"select"===s.element.get(0).tagName.toLowerCase()?a=s.element.prop("multiple"):(a=s.multiple||!1,"tags"in s&&(s.multiple=a=!0)),(i=a?new window.Select2.class.multi:new window.Select2.class.single).init(s);else{if("string"!=typeof r[0])throw"Invalid arguments to select2 plugin: "+r;if(g(r[0],l)<0)throw"Unknown method: "+r[0];if(o=t,(i=e(this).data("select2"))===t)return;if("container"===(n=r[0])?o=i.container:"dropdown"===n?o=i.dropdown:(d[n]&&(n=d[n]),o=i[n].apply(i,r.slice(1))),g(r[0],c)>=0||g(r[0],h)>=0&&1==r.length)return!1}})),o===t?this:o},e.fn.select2.defaults={width:"copy",loadMorePadding:0,closeOnSelect:!0,openOnEnter:!0,containerCss:{},dropdownCss:{},containerCssClass:"",dropdownCssClass:"",formatResult:function(e,t,s,i){var n=[];return x(e.text,s.term,n,i),n.join("")},formatSelection:function(e,s,i){return e?i(e.text):t},sortResults:function(e,t,s){return e},formatResultCssClass:function(e){return e.css},formatSelectionCssClass:function(e,s){return t},minimumResultsForSearch:0,minimumInputLength:0,maximumInputLength:null,maximumSelectionSize:0,id:function(e){return e==t?null:e.id},matcher:function(e,t){return f(""+t).toUpperCase().indexOf(f(""+e).toUpperCase())>=0},separator:",",tokenSeparators:[],tokenizer:function(e,s,i,n){var o,a,r,l,c,h=e,d=!1;if(!n.createSearchChoice||!n.tokenSeparators||n.tokenSeparators.length<1)return t;for(;;){for(a=-1,r=0,l=n.tokenSeparators.length;r<l&&(c=n.tokenSeparators[r],!((a=e.indexOf(c))>=0));r++);if(a<0)break;if(o=e.substring(0,a),e=e.substring(a+c.length),o.length>0&&(o=n.createSearchChoice.call(this,o,s))!==t&&null!==o&&n.id(o)!==t&&null!==n.id(o)){for(d=!1,r=0,l=s.length;r<l;r++)if(m(n.id(o),n.id(s[r]))){d=!0;break}d||i(o)}}return h!==e?e:void 0},escapeMarkup:E,blurOnChange:!1,selectOnBlur:!1,adaptContainerCssClass:function(e){return e},adaptDropdownCssClass:function(e){return null},nextSearchTerm:function(e,s){return t},searchInputPlaceholder:"",createSearchChoicePosition:"top",shouldFocusInput:function(e){return!("ontouchstart"in window||navigator.msMaxTouchPoints>0)||!(e.opts.minimumResultsForSearch<0)}},e.fn.select2.locales=[],e.fn.select2.locales.en={formatMatches:function(e){return 1===e?"One result is available, press enter to select it.":e+" results are available, use up and down arrow keys to navigate."},formatNoMatches:function(){return"No matches found"},formatAjaxError:function(e,t,s){return"Loading failed"},formatInputTooShort:function(e,t){var s=t-e.length;return"Please enter "+s+" or more character"+(1==s?"":"s")},formatInputTooLong:function(e,t){var s=e.length-t;return"Please delete "+s+" character"+(1==s?"":"s")},formatSelectionTooBig:function(e){return"You can only select "+e+" item"+(1==e?"":"s")},formatLoadMore:function(e){return"Loading more results…"},formatSearching:function(){return"Searching…"}},e.extend(e.fn.select2.defaults,e.fn.select2.locales.en),e.fn.select2.ajaxDefaults={transport:e.ajax,params:{type:"GET",cache:!1,dataType:"json"}},window.Select2={query:{ajax:T,local:k,tags:O},util:{debounce:C,markMatch:x,escapeMarkup:E,stripDiacritics:f},class:{abstract:s,single:i,multi:n}}}function p(t){var s=e(document.createTextNode(""));t.before(s),s.before(t),s.remove()}function f(e){return e.replace(/[^\u0000-\u007E]/g,(function(e){return u[e]||e}))}function g(e,t){for(var s=0,i=t.length;s<i;s+=1)if(m(e,t[s]))return s;return-1}function m(e,s){return e===s||e!==t&&s!==t&&(null!==e&&null!==s&&(e.constructor===String?e+""==s+"":s.constructor===String&&s+""==e+""))}function v(t,s){var i,n,o;if(null===t||t.length<1)return[];for(n=0,o=(i=t.split(s)).length;n<o;n+=1)i[n]=e.trim(i[n]);return i}function b(e){return e.outerWidth(!1)-e.width()}function w(s){var i="keyup-change-value";s.on("keydown",(function(){e.data(s,i)===t&&e.data(s,i,s.val())})),s.on("keyup",(function(){var n=e.data(s,i);n!==t&&s.val()!==n&&(e.removeData(s,i),s.trigger("keyup-change"))}))}function C(e,s,i){var n;return i=i||t,function(){var t=arguments;window.clearTimeout(n),n=window.setTimeout((function(){s.apply(i,t)}),e)}}function S(e){e.preventDefault(),e.stopPropagation()}function y(t,s,i){var n,o,a=[];(n=e.trim(t.attr("class")))&&e((n=""+n).split(/\s+/)).each2((function(){0===this.indexOf("select2-")&&a.push(this)})),(n=e.trim(s.attr("class")))&&e((n=""+n).split(/\s+/)).each2((function(){0!==this.indexOf("select2-")&&(o=i(this))&&a.push(o)})),t.attr("class",a.join(" ")),a.indexOf("hidden-select2")>-1&&t.attr("aria-hidden","true")}function x(e,t,s,i){var n=f(e.toUpperCase()).indexOf(f(t.toUpperCase())),o=t.length;n<0?s.push(i(e)):(s.push(i(e.substring(0,n))),s.push("<span class='select2-match'>"),s.push(i(e.substring(n,n+o))),s.push("</span>"),s.push(i(e.substring(n+o,e.length))))}function E(e){var t={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return String(e).replace(/[&<>"'\/\\]/g,(function(e){return t[e]}))}function T(s){var i,n=null,o=s.quietMillis||100,a=s.url,r=this;return function(l){window.clearTimeout(i),i=window.setTimeout((function(){var i=s.data,o=a,c=s.transport||e.fn.select2.ajaxDefaults.transport,h={type:s.type||"GET",cache:s.cache||!1,jsonpCallback:s.jsonpCallback||t,dataType:s.dataType||"json"},d=e.extend({},e.fn.select2.ajaxDefaults.params,h);i=i?i.call(r,l.term,l.page,l.context):null,o="function"==typeof o?o.call(r,l.term,l.page,l.context):o,n&&"function"==typeof n.abort&&n.abort(),s.params&&(e.isFunction(s.params)?e.extend(d,s.params.call(r)):e.extend(d,s.params)),e.extend(d,{url:o,dataType:s.dataType,data:i,success:function(e){var t=s.results(e,l.page,l);l.callback(t)},error:function(e,t,s){var i={hasError:!0,jqXHR:e,textStatus:t,errorThrown:s};l.callback(i)}}),n=c.call(r,d)}),o)}}function k(t){var s,i,n=t,o=function(e){return""+e.text};e.isArray(n)&&(n={results:i=n}),!1===e.isFunction(n)&&(i=n,n=function(){return i});var a=n();return a.text&&(o=a.text,e.isFunction(o)||(s=a.text,o=function(e){return e[s]})),function(t){var s,i=t.term,a={results:[]};""!==i?(s=function(n,a){var r,l;if((n=n[0]).children){for(l in r={},n)n.hasOwnProperty(l)&&(r[l]=n[l]);r.children=[],e(n.children).each2((function(e,t){s(t,r.children)})),(r.children.length||t.matcher(i,o(r),n))&&a.push(r)}else t.matcher(i,o(n),n)&&a.push(n)},e(n().results).each2((function(e,t){s(t,a.results)})),t.callback(a)):t.callback(n())}}function O(s){var i=e.isFunction(s);return function(n){var o=n.term,a={results:[]},r=i?s(n):s;e.isArray(r)&&(e(r).each((function(){var e=this.text!==t,s=e?this.text:this;(""===o||n.matcher(o,s))&&a.results.push(e?this:{id:this,text:this})})),n.callback(a))}}function P(t,s){if(e.isFunction(t))return!0;if(!t)return!1;if("string"==typeof t)return!0;throw new Error(s+" must be a string, function, or falsy value")}function I(t,s){if(e.isFunction(t)){var i=Array.prototype.slice.call(arguments,2);return t.apply(s,i)}return t}function A(t){var s=0;return e.each(t,(function(e,t){t.children?s+=A(t.children):s++})),s}function R(){var t=this;e.each(arguments,(function(e,s){t[s].remove(),t[s]=null}))}function L(t,s){var i=function(){};return(i.prototype=new t).constructor=i,i.prototype.parent=t.prototype,i.prototype=e.extend(i.prototype,s),i}}(jQuery);
/*! RESOURCE: /scripts/select2_translations.js */
(function($) {
  if (!$ || !window.GwtMessage) {
    return;
  }
  function getMessage() {
    var gwt = new GwtMessage();
    return gwt.getMessage.apply(gwt, arguments);
  }
  $.extend($.fn.select2.defaults, {
    formatMatches: function(matches) {
      return getMessage("{0} result(s) available, use up and down arrow keys to navigate and enter to select", matches);
    },
    formatNoMatches: function() {
      return getMessage("No matches found");
    },
    formatAjaxError: function(jqXHR, textStatus, errorThrown) {
      return getMessage("Loading failed");
    },
    formatInputTooShort: function(input, min) {
      var n = min - input.length;
      return getMessage("Please enter {0} or more character(s)", n);
    },
    formatInputTooLong: function(input, max) {
      var n = input.length - max;
      return getMessage("Please delete {0} character(s)", n);
    },
    formatSelectionTooBig: function(limit) {
      return getMessage("You can only select {0} item(s)", limit);
    },
    formatLoadMore: function(pageNumber) {
      return getMessage("Loading more results…");
    },
    formatSearching: function() {
      return getMessage("Searching…");
    }
  });
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/selects.js */
jQuery(function($) {
	"use strict";
	window.NOW = window.NOW || {};
	var $select2 = $('select.select2, select.sn-select-basic').not('select[readonly]');
	$select2
		.each(function() {
			var required = $(this).prop('required');
			if (required)
				$(this).addClass('required');
		})
		.select2();
	$(window).bind('blur', function() {
		$select2.select2('close');
	});
});
;
/*! RESOURCE: /scripts/heisenberg/custom/tabs.js */
(function($) {
	"use strict";
	$.fn.tabs = (function() {
		return function() {
			var $elem = this;
			var api = {};
			$elem.data('sn.tabs', api);
			attachTabClickHandler($elem);
			attachFocusHandler($elem);
		};
		function attachTabClickHandler($elem) {
			$elem.on('click', 'li, [data-toggle=tab], [data-toggle=segmented]', function (e) {
				var $el = $(this);
				var $tabLi, $tabTrigger;
				if ($el.is('li')) {
					$tabLi = $el;
					$tabTrigger = $el.find('[data-toggle]').first();
				} else {
					$tabTrigger = $el;
					$tabLi = $el.closest('li');
				}
				if ($tabLi.hasClass('disabled'))
					return;
				var $selectedTab = $tabLi.siblings('.active');
				var $selectedTabTrigger = $selectedTab.find('[data-toggle]').first();
				setTabDisplay($selectedTab, $selectedTabTrigger, false);
				setTabDisplay($tabLi, $tabTrigger, true);
				e.preventDefault();
			})
		}
		function attachFocusHandler($elem) {
			$elem.on('focusin focusout', '[data-toggle=tab], [data-toggle=segmented]', function(e) {
				var $el = $(this).closest('li');
				switch (e.type) {
					case 'focusin':
						$el.addClass('focus');
						break;
					case 'focusout':
						$el.removeClass('focus');
						break;
				}
			})
		}
		function setTabDisplay($tabLi, $tabTrigger, display) {
			$tabTrigger.attr('aria-selected', display ? 'true' : 'false');
			var selector = $tabTrigger.data('tab-target') || $tabTrigger.attr('href');
selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
			var $tabpanel = $(selector);
			$tabpanel.attr('aria-hidden', display ? 'false' : 'true');
			if (display) {
				$tabLi.addClass('active justselected');
				$tabpanel.addClass('active');
				$tabLi.one('focusout', function () {
					$tabLi.removeClass('justselected');
				})
			} else {
				$tabLi.removeClass('active');
				$tabpanel.removeClass('active');
			}
		}
	})();
	$(function() {
		$('.sn-tabs-basic').each(function() {
			var $this = $(this);
			if (!$this.data('sn.tabs'))
				$this.tabs();
		});
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/tables.js */
(function($) {
	"use strict";
	$.fn.tableDetailRowHover = function() {
		this.each(function() {
			$(this)
				.on('mouseenter mouseleave', 'tr', function(evt) {
					var row = getTargetAdjRow($(this));
					evt.type == 'mouseenter'
						? row.addClass('hover') : row.removeClass('hover');
				});
		})
	}
	function getTargetAdjRow(row) {
		return row.hasClass('detail-row') ? row.prev() : row.next();
	}
})(jQuery);
jQuery(function($) {
	"use strict";
	$('.detail-row:nth-child(2)').closest('table.table').addClass('table-detail-row');
	$('.table-hover.table-detail-row').tableDetailRowHover();
});
;
/*! RESOURCE: /scripts/lib/tabbable/tabbable.js */
(function() {
	window.tabbable = function(el, selectorList) {
		var basicTabbables = [];
		var orderedTabbables = [];
		var isHidden = createIsHidden();
		var candidates = el.querySelectorAll(selectorList || 'input, select, a[href], textarea, button, [tabindex], [contenteditable]:not([contenteditable="false"])');
		var candidate, candidateIndex;
		for (var i = 0, l = candidates.length; i < l; i++) {
			candidate = candidates[i];
			candidateIndex = getTabindex(candidate);
			if (
				candidateIndex < 0
				|| (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
				|| candidate.disabled
				|| isHidden(candidate)
			) {
				continue;
			}
			if (candidateIndex === 0) {
				basicTabbables.push(candidate);
			} else {
				orderedTabbables.push({
					tabIndex: candidateIndex,
					node: candidate,
				});
			}
		}
		var tabbableNodes = orderedTabbables
			.sort(function(a, b) {
				return a.tabIndex - b.tabIndex;
			})
			.map(function(a) {
				return a.node
			});
		Array.prototype.push.apply(tabbableNodes, basicTabbables);
		return tabbableNodes;
	}
	function isContentEditable(node) {
		return node.contentEditable === "true";
	}
	function getTabindex(node) {
		var tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);
		if (!isNaN(tabindexAttr)) return tabindexAttr;
		if (isContentEditable(node)) return 0;
		return node.tabIndex; 
	}
	function createIsHidden() {
		var nodeCache = [];
		return function isHidden(node) {
			if (node === document.documentElement || !node.tagName) return false;
			for (var i = 0, length = nodeCache.length; i < length; i++) {
				if (nodeCache[i][0] === node) return nodeCache[i][1];
			}
			var result = false;
			var style = window.getComputedStyle(node);
			if (style.visibility === 'hidden' || style.display === 'none') {
				result = true;
			} else if (node.parentNode) {
				result = isHidden(node.parentNode);
			}
			nodeCache.push([node, result]);
			return result;
		}
	}
})();
;
/*! RESOURCE: /scripts/lib/focus-trap/focus-trap.js */
(function() {
	var listeningFocusTrap = null;
	function focusTrap(element, userOptions) {
		var tabbableNodes = [];
		var nodeFocusedBeforeActivation = null;
		var active = false;
		var container = (typeof element === 'string')
			? document.querySelector(element)
			: element;
		var config = userOptions || {};
		config.returnFocusOnDeactivate = (userOptions && userOptions.returnFocusOnDeactivate != undefined)
			? userOptions.returnFocusOnDeactivate
			: true;
		config.escapeDeactivates = (userOptions && userOptions.escapeDeactivates != undefined)
			? userOptions.escapeDeactivates
			: true;
		var trap = {
			activate: activate,
			deactivate: deactivate,
			pause: removeListeners,
			unpause: addListeners
		};
		return trap;
		function activate(activateOptions) {
			var defaultedActivateOptions = {
				onActivate: (activateOptions && activateOptions.onActivate !== undefined)
					? activateOptions.onActivate
					: config.onActivate,
			};
			active = true;
			nodeFocusedBeforeActivation = getFocusedElement();
			if (defaultedActivateOptions.onActivate) {
				defaultedActivateOptions.onActivate();
			}
			addListeners();
			return trap;
		}
		function deactivate(deactivateOptions) {
			var defaultedDeactivateOptions = {
				returnFocus: (deactivateOptions && deactivateOptions.returnFocus != undefined)
					? deactivateOptions.returnFocus
					: config.returnFocusOnDeactivate,
				returnFocusTo: deactivateOptions && deactivateOptions.returnFocusTo,	
				onDeactivate: (deactivateOptions && deactivateOptions.onDeactivate !== undefined)
					? deactivateOptions.onDeactivate
					: config.onDeactivate,
			};
			removeListeners();
			if (defaultedDeactivateOptions.onDeactivate) {
				defaultedDeactivateOptions.onDeactivate();
			}
			if (defaultedDeactivateOptions.returnFocus) {
				setTimeout(function() {
					tryFocus(defaultedDeactivateOptions.returnFocusTo || nodeFocusedBeforeActivation);
				}, 0);
			}
			active = false;
			return this;
		}
		function addListeners() {
			if (!active) return;
			if (listeningFocusTrap) {
				listeningFocusTrap.pause();
			}
			listeningFocusTrap = trap;
			updateTabbableNodes();
			tryFocus(firstFocusNode());
			document.addEventListener('focus', checkFocus, true);
			document.addEventListener('click', checkClick, true);
			document.addEventListener('mousedown', checkPointerDown, true);
			document.addEventListener('touchstart', checkPointerDown, true);
			document.addEventListener('keydown', checkKey, true);
			return trap;
		}
		function removeListeners() {
			if (!active || !listeningFocusTrap) return;
			document.removeEventListener('focus', checkFocus, true);
			document.removeEventListener('click', checkClick, true);
			document.removeEventListener('mousedown', checkPointerDown, true);
			document.removeEventListener('touchstart', checkPointerDown, true);
			document.removeEventListener('keydown', checkKey, true);
			listeningFocusTrap = null;
			return trap;
		}
		function firstFocusNode() {
			var node;
			if (!config.initialFocus) {
				node = tabbableNodes[0];
				if (!node) {
					throw new Error('You can\'t have a focus-trap without at least one focusable element');
				}
				return node;
			}
			node = (typeof config.initialFocus === 'string')
				? document.querySelector(config.initialFocus)
				: config.initialFocus;
			if (!node) {
				throw new Error('`initialFocus` refers to no known node');
			}
			return node;
		}
		function checkPointerDown(e) {
			if (config.clickOutsideDeactivates) {
				deactivate({ returnFocus: false });
			}
		}
		function checkClick(e) {
			if (config.clickOutsideDeactivates) return;
			var composedPath = getEventPath(e);
			if (composedPath.indexOf(container) >= 0) return;
			e.preventDefault();
			e.stopImmediatePropagation();
		}
		function checkFocus(e) {
			if (config.focusOutsideDeactivates === false) return;
			var composedPath = getEventPath(e);
			var target = composedPath[0];
			if (composedPath.indexOf(container) >= 0) return;
			e.preventDefault();
			e.stopImmediatePropagation();
			target.blur();
		}
		function checkKey(e) {
			if (e.key === 'Tab' || e.keyCode === 9) {
				handleTab(e);
			}
			if (config.escapeDeactivates !== false && isEscapeEvent(e)) {
				deactivate();
			}
		}
		function handleTab(e) {
			e.preventDefault();
			updateTabbableNodes();
			var target = getEventPath(e)[0];
			var currentFocusIndex = tabbableNodes.indexOf(target);
			var lastTabbableNode = tabbableNodes[tabbableNodes.length - 1];
			var firstTabbableNode = tabbableNodes[0];
			if (e.shiftKey) {
				if (target === firstTabbableNode || tabbableNodes.indexOf(target) === -1) {
					return tryFocus(lastTabbableNode);
				}
				return tryFocus(tabbableNodes[currentFocusIndex - 1]);
			}
			if (target === lastTabbableNode) return tryFocus(firstTabbableNode);
			tryFocus(tabbableNodes[currentFocusIndex + 1]);
		}
		function updateTabbableNodes() {
			tabbableNodes = tabbable(container);
		}
	}
	function isEscapeEvent(e) {
		return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
	}
	function tryFocus(node) {
		if (!node || !node.focus) return;
		node.focus();
		if (node.tagName.toLowerCase() === 'input') {
			node.select();
		}
	}
	function getFocusedElement() {
		var activeElement = document.activeElement;
		if (!activeElement || activeElement === document.body) {
			return;
		}
		var getShadowActiveElement = function(element) {
			if (element.shadowRoot && element.shadowRoot.activeElement) {
				element = getShadowActiveElement(element.shadowRoot.activeElement);
			}
			return element;
		};
		return getShadowActiveElement(activeElement);
	}
	function getEventPath(evt) {
		return evt.path || (evt.composedPath && evt.composedPath()) || composedPath(evt.target);
	}
	
	function composedPath(el) {
		var path = [];
		while (el) {
			if (el.shadowRoot) {
				if (el.shadowRoot.activeElement) {
					path.push(el.shadowRoot.activeElement);
				}
				path.push(el.shadowRoot);
			}
			path.push(el);
			if (el.tagName === 'HTML') {
				path.push(document);
				path.push(window);
				break;
			}
			el = el.parentElement;
		}
		return path;
	}
	window.focusTrap = focusTrap;
})();
;
/*! RESOURCE: /scripts/heisenberg/custom/accessibility.js */
jQuery(function($) {
	if (!window.WeakMap)
		return;
	window.NOW = window.NOW || {};
	if (window.NOW.accessibilityJSLoaded) {
		return;
	}
	window.NOW.accessibilityJSLoaded = true;
	var $document = $(document),
		store = new WeakMap();
	$document.on('show.bs.modal', function(evt) {
		var modal = evt.target,
			previouslyFocusedElement = document.activeElement;
		if (hasOptions(modal))
			return;
		createOptions(modal);
		rememberTrigger(modal, previouslyFocusedElement);
	});
	$document.on('hidden.bs.modal', function(evt) {
		var modal = evt.target;
		restoreTriggerFocus(modal);
		destroyOptions(modal);
	});
	function createOptions(modal) {
		store.set(modal, {});
	}
	function hasOptions(modal) {
		return !!store.get(modal);
	}
	function destroyOptions(modal) {
		store.delete(modal);
	}
	function getOption(modal, key) {
		var options = store.get(modal);
		return options && options[key];
	}
	function setOption(modal, key, value) {
		var options = store.get(modal);
		if (options) {
			options[key] = value;
		}
	}
	function rememberTrigger(modal, triggerElement) {
		setOption(modal, 'trigger-element', triggerElement);
	}
	function restoreTriggerFocus(modal) {
		var $target = $(getOption(modal, 'trigger-element'));
		var isFocusable = function($el) {
			if ($el.filter(':visible').length > 0) {
				return $el[0].tabIndex > -1;
			}
			return false;
		}
		var tryFocus = function(el) {
			var $el = $(el);
			if (isFocusable($el)) {
				$el.focus();
				return true;
			}
			return false;
		}
		do {
			if (tryFocus($target) || tryFocus($target.data('menu-trigger'))) {
				return;
			}
			$target = $target.parent();
		} while ($target.length > 0);
	}
});
;
;
/*! RESOURCE: /scripts/heisenberg/heisenberg_all.js */
