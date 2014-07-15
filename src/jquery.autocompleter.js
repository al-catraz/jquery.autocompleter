/* jslint evil: true */

(function($) {
    /**
     * jQuery definition to anchor JsDoc comments.
     *
     * @see http://jquery.com/
     * @name jQuery
     * @class jQuery Library
     */

    /**
     * jQuery 'fn' definition to anchor JsDoc comments.
     *
     * @see http://jquery.com/
     * @name fn
     * @class jQuery Library
     * @memberOf jQuery
     */

    'use strict';

    var instance = {
            $autocompleter: null,
            $itemsList:     null,
            $item:          null,
            $input:         null,
            $inputMirror:   null,
            options:        null,
            keyTimeout:     null,
            itemFocusIndex: -1
        },

        templates = {
            $autocompleter: $('<section></section>').addClass('jquery-autocompleter')
                                                    .append($('<ul></ul>').addClass('items-list')
                                                                          .append($('<li></li>').addClass('input')
                                                                                                .append($('<input/>').attr({
                                                                                                                          type: 'text',
                                                                                                                          autocomplete: 'off'
                                                                                                                      }))))
                                                    .append($('<span></span>').addClass('input-mirror')),

            $item:          $('<li></li>').addClass('item')
                                          .append($('<span></span>').addClass('label'))
                                          .append($('<a></a>').addClass('remove'))
                                          .append($('<input/>').addClass('value')
                                                               .attr('type', 'hidden'))
        },

        keyMap = {
            8:  'BACKSPACE',
            9:  'TAB',
            13: 'ENTER',
            27: 'ESC',
            37: 'LEFT-ARROW',
            38: 'UP-ARROW',
            39: 'RIGHT-ARROW',
            40: 'DOWN-ARROW',
            46: 'DELETE'
        },

        privates = {
            /**
             * Creates an instance of plugin for each autocompleter
             *
             * @private
             * @method init
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            init: function() {
                $.each(this, function() {
                    var $input = $(this);

                    publics.build.call($input);
                });

                $(document).on('click', privates.documentClickHandler)
                           .on('keydown', privates.documentKeydownHandler);

                return this;
            },

            documentClickHandler: function(event) {
                var $target = $(event.target);

                if (!$target.is('.jquery-autocompleter') && !$target.parents('.jquery-autocompleter').length) {
                    privates.autocompleterBlurHandler();
                }

                return this;
            },

            documentKeydownHandler: function(event) {
                var key = keyMap[event.keyCode];

                if (!instance.$input.is('.focus')) {
                    switch (key) {
                        case 'DELETE':
                        case 'BACKSPACE':   privates.itemKeydownDelete(event);
                                            break;

                        case 'LEFT-ARROW':  privates.itemFocus.call('PREV');
                                            break;

                        case 'RIGHT-ARROW': privates.itemFocus.call('NEXT');
                                            break;

                        default:            break;
                    }
                }

                return this;
            },

            setStyles: function() {
                var $originalInput          = $(this),
                    $item                   = instance.$item.clone(),
                    originalInputWidth      = $originalInput.outerWidth(),
                    originalInputHeight     = $originalInput.outerHeight(),
                    originalInputFontSize   = parseInt($originalInput.css('font-size').replace('px', ''), 10),
                    originalInputFontFamily = $originalInput.css('font-family'),
                    originalInputBorder     = parseInt($originalInput.css('border-width').replace('px', ''), 10),
                    itemsListPaddingTop     = parseInt(instance.$itemsList.css('padding-top').replace('px', ''), 10),
                    itemPaddingBottom       = 0,
                    lineHeight              = 0,
                    fontSizeRatio           = 0.5;

                $item.insertBefore(instance.$input);

                itemPaddingBottom = parseInt($item.css('margin-bottom').replace('px', ''), 10);
                lineHeight = originalInputHeight - itemsListPaddingTop - itemPaddingBottom - (originalInputBorder * 2);

                $item.remove();

                instance.$autocompleter.css({
                    width: originalInputWidth,
                    minHeight: originalInputHeight
                });

                instance.$item.css({
                    fontSize: Math.round(lineHeight * fontSizeRatio),
                    lineHeight: lineHeight + 'px'
                });

                instance.$input.children().css({
                    lineHeight: lineHeight + 'px'
                });

                instance.$input.children().add(instance.$inputMirror).css({
                    fontFamily: originalInputFontFamily,
                    fontSize: originalInputFontSize
                });

                return this;
            },

            setOptions: function() {
                instance.options = instance.$autocompleter.data('original-input').data();

                return this;
            },

            setInputWidth: function() {
                var inputWidth          = 0,
                    inputPadding        = parseInt(instance.$input.children().css('padding-left').replace('px', ''), 10),
                    itemsListPadding    = parseInt(instance.$itemsList.css('padding-left').replace('px', ''), 10),
                    minWidth            = parseInt(instance.$input.children().css('font-size').replace('px', ''), 10),
                    maxWidth            = instance.$autocompleter.outerWidth() - (inputPadding * 2);

                instance.$input.children().width(0);

                inputWidth = maxWidth - instance.$input.position().left - (itemsListPadding * 2) - (inputPadding * 2);

                if (inputWidth < minWidth) {
                    inputWidth = minWidth;
                }

                if (instance.$inputMirror.text() !== '') {
                    inputWidth = instance.$inputMirror.width() + minWidth;
                }

                if (inputWidth > maxWidth) {
                    inputWidth = maxWidth;
                }

                instance.$input.children().width(Math.round(inputWidth));

                return this;
            },

            autocompleterClickHandler: function(event) {
                var $target = $(event.target),
                    targetIsInput = ($target.parents('.jquery-autocompleter').length && $target.is('input:text'));

                if (!instance.$autocompleter.is('.disabled') && ($target.is('.jquery-autocompleter') ||
                    $target.parents('.jquery-autocompleter').length || targetIsInput)) {
                    instance.$autocompleter.addClass('focus');

                    if (!targetIsInput) {
                        if (!$target.is('.item') && !$target.parents('.item').length) {
                            instance.$input.children().trigger('focus');
                        }
                    }
                    else if (targetIsInput || $target.is('.jquery-autocompleter')) {
                        privates.inputListBlur.call(this);
                    }
                }

                return this;
            },

            autocompleterBlurHandler: function() {
                instance.$autocompleter.removeClass('focus');
                privates.inputListBlur.call(this);
                privates.inputClear.call(this);

                return this;
            },

            inputListBlur: function() {
                instance.$itemsList.children('.focus:not(.input)').removeClass('focus');

                return this;
            },

            inputBlurHandler: function() {
                instance.$input.removeClass('focus');
                privates.autocompleterBlurHandler.call(this);

                return this;
            },

            inputFocusHandler: function() {
                instance.itemFocusIndex = instance.$itemsList.children(':not(.input)').length;

                instance.$autocompleter.add(instance.$input).addClass('focus');
                privates.inputListBlur.call(this);

                return this;
            },

            inputKeydownHandler: function(event) {
                var key     = keyMap[event.keyCode],
                    value   = null,
                    item    = {
                        label: 'label',
                        value: 'value'
                    }; // TODO wstawic prawidlowy item z listy sugestii albo to co ktos ma wpisane w polu jest jest taka opcja wlaczona

                if (key === 'ENTER' || key === 'TAB') {
                    event.preventDefault();
                }

                setTimeout(function() {
                    value = instance.$input.children().val();

                    instance.$inputMirror.text(value);
                    privates.setInputWidth.call(this);

                    if (instance.options.customItems) {
                        item = {
                            label: value,
                            value: value
                        };
                    }

                    switch (key) {
                        case 'TAB':
                        case 'ENTER':       publics.itemAdd(item);
                                            break;

                        case 'LEFT-ARROW':  privates.itemFocus.call('PREV', true);
                                            break;

                        default:            break;
                    }
                }, 0);

                return this;
            },

            inputClear: function() {
                instance.$input.children().val('');
                instance.$inputMirror.empty();
                privates.setInputWidth.call(this);

                return this;
            },

            itemKeydownDelete: function(event) {
                var $item = instance.$itemsList.find('.focus');

                if ($item.length) {
                    event.preventDefault();
                    publics.itemRemove($item);
                }

                return this;
            },

            itemClickHandler: function() {
                var $item = $(this);

                instance.itemFocusIndex = $item.index();

                privates.itemFocus.call(this);

                return this;
            },

            itemFocus: function() {
                var $item           = null,
                    minIndex        = 0,
                    maxIndex        = instance.$itemsList.children(':not(.input)').length,
                    focusTriggered  = false;

                if (typeof(this) === 'string') {
                    if (this === 'PREV') {
                        instance.itemFocusIndex--;
                    }
                    else if (this === 'NEXT') {
                        instance.itemFocusIndex++;
                    }

                    if (instance.itemFocusIndex < minIndex) {
                        instance.itemFocusIndex = minIndex;
                    }

                    if (instance.itemFocusIndex >= maxIndex) {
                        focusTriggered = true;

                        instance.$input.children().trigger('focus');
                    }

                    if (instance.itemFocusIndex > maxIndex) {
                        instance.itemFocusIndex = maxIndex;
                    }

                    $item = instance.$itemsList.children().eq(instance.itemFocusIndex);
                }
                else {
                    $item = $(this);
                }

                if (!focusTriggered) {
                    instance.$input.children().trigger('blur');
                    instance.$autocompleter.addClass('focus');
                }

                privates.inputListBlur.call(this);

                if ($item.is('.item')) {
                    $item.addClass('focus');
                }

                return this;
            },

            removeClickHandler: function() {
                var $trigger = $(this),
                    $item = $trigger.parents('.item');

                publics.itemRemove($item);

                return this;
            }
        },

        publics = {
            /**
             * Builds particular widget instance
             *
             * @method build
             * @memberOf jQuery.fn.autocompleter
             * @return {jquery} Chainable jQuery object
             */
            build: function() {
                var $originalElement    = $(this),
                    $autocompleter      = templates.$autocompleter.clone(),
                    classes             = $originalElement.attr('class');

                if ($originalElement.length && $originalElement.is('input')) {
                    $autocompleter.addClass(classes)
                                  .on('click', privates.autocompleterClickHandler);

                    $originalElement.after($autocompleter);

                    instance.$autocompleter = $autocompleter;
                    instance.$itemsList = instance.$autocompleter.find('.items-list');
                    instance.$item = templates.$item.clone();
                    instance.$input = instance.$autocompleter.find('.input');
                    instance.$inputMirror = instance.$autocompleter.find('.input-mirror');

                    instance.$autocompleter.data('original-input', $originalElement);

                    privates.setOptions.call(this);
                    privates.setStyles.call(this);
                    privates.setInputWidth.call(this);

                    instance.$input.children().attr('placeholder', $originalElement.attr('placeholder'))
                                              .on('blur', privates.inputBlurHandler)
                                              .on('focus', privates.inputFocusHandler)
                                              .on('keydown', privates.inputKeydownHandler);

                    if ($originalElement.is(':disabled')) {
                        publics.disable.call(this);
                    }

                    if (instance.options.singleItem) {
                        instance.$autocompleter.addClass('single');
                    }

                    $originalElement.remove();
                }

                return this;
            },

            /**
             * Rebuilds particular widget instance
             *
             * @method refresh
             * @memberOf jQuery.fn.autocompleter
             * @return {jquery} Chainable jQuery object
             */
            refresh: function() {
                var $input = $(this).data('original-input');

                publics.destroy.call(this);
                publics.build.call($input.get(0));

                return this;
            },

            /**
             * Destroys particular widget instance
             *
             * @method destroy
             * @memberOf jQuery.fn.autocompleter
             * @return {jquery} Chainable jQuery object
             */
            destroy: function() {
                var $input = instance.$autocompleter.data('original-input');

                instance.$autocompleter.after($input)
                                       .remove();

                return $input;
            },

            itemAdd: function(item) {
                var $item = instance.$item.clone(),
                    label = null,
                    value = null,
                    itemCanBeAdded = true;

                if (item instanceof $) {
                    // TODO: wyciagac z <li> danej sugestii dane
                }
                else {
                    label = item.label;
                    value = item.value;
                }

                if (instance.options.uniqueItems && instance.$itemsList.find('.item[data-label="' + item.label + '"][data-value="' + item.value + '"]').length) {
                    itemCanBeAdded = false;
                }

                if (label !== '' && value !== '') {
                    $item.attr('data-label', label)
                         .attr('data-value', value)
                         .on('click', privates.itemClickHandler)
                         .find('.label').text(label).end()
                         .find('.value').val(value).end()
                         .find('.remove').on('click', privates.removeClickHandler);

                    if (itemCanBeAdded) {
                        $item.insertBefore(instance.$input);
                        instance.$autocompleter.data('original-input').trigger('item-add.autocompleter', $item);

                        instance.itemFocusIndex = instance.$itemsList.children(':not(.input)').length;
                    }

                    privates.inputClear.call(this);
                }

                return $item;
            },

            itemRemove: function(item) {
                var $item = null;

                if (item instanceof $) {
                    $item = item;
                }
                else {
                    $item = instance.$itemsList.find('.item[data-label="' + item.label + '"][data-value="' + item.value + '"]');
                }

                if ($item.length) {
                    $item.remove();
                    privates.setInputWidth.call(this);
                    instance.$autocompleter.data('original-input').trigger('item-remove.autocompleter', $item);
                    instance.$input.children().trigger('focus');

                    instance.itemFocusIndex = instance.$itemsList.children(':not(.input)').length;
                }

                return $item;
            },

            getValues: function() {
                var values = $.map(instance.$itemsList.children(':not(.input)'), function(item) {
                        var value = $(item).attr('data-value');

                        if (!isNaN(parseInt(value, 10))) {
                            value = parseInt(value, 10);
                        }

                        return value;
                    });

                return values;
            },

            clearItems: function() {
                instance.$itemsList.children(':not(.input)').remove();
                privates.setInputWidth.call(this);

                return this;
            },

            disable: function() {
                instance.$autocompleter.addClass('disabled');
                instance.$input.children().prop('disabled', true);

                return this;
            },

            enable: function() {
                instance.$autocompleter.removeClass('disabled');
                instance.$input.children().prop('disabled', false);

                return this;
            }
        };

    /**
     * jQuery method for transforming default select dropdown lists into a self-styled widgets
     *
     * @name prettySelect
     * @class jQuery prettySelect
     * @memberOf jQuery.fn
     * @param {string} method Public method name
     * @return {jquery} Chainable jQuery object
     */
    $.fn.autocompleter = function(method) {
        if (publics[method]) {
            return publics[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return privates.init.apply(this, arguments);
        }
        else {
            $.error('Method ' +  method + ' does not exist on jQuery.autocompleter');
        }

        return this;
    };
})($);
