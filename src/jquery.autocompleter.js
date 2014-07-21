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
            $originalInput:         null,
            $autocompleter:         null,
            $suggestionsList:       null,
            $itemsList:             null,
            $item:                  null,
            $input:                 null,
            $inputMirror:           null,
            options:                {
                name:               null,
                minCharacters:      2,
                maxSuggestions:     10
            },
            keyTimeout:             null,
            xhr:                    null,
            suggestions:            [],
            itemFocusIndex:         0,
            suggestionFocusIndex:   0,
            inputCaretIndex:        0
        },

        templates = {
            $autocompleter: $('<section></section>').addClass('jquery-autocompleter')
                                                    .append($('<ul></ul>').addClass('items-list')
                                                                          .append($('<li></li>').addClass('input')
                                                                                                .append($('<input/>').attr({
                                                                                                                          type: 'text',
                                                                                                                          autocomplete: 'off'
                                                                                                                      }))))
                                                    .append($('<ul></ul>').addClass('suggestions-list hide'))
                                                    .append($('<span></span>').addClass('input-mirror')),

            $item:          $('<li></li>').addClass('item')
                                          .append($('<span></span>').addClass('label'))
                                          .append($('<a></a>').addClass('remove'))
                                          .append($('<input/>').addClass('value')
                                                               .attr('type', 'hidden')),

            $suggestion:    $('<li></li>').addClass('suggestion')
                                          .append($('<span></span>').addClass('label'))
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

        keyLag = 200,

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

                $(document).on('click.autocompleter', privates.documentClickHandler)
                           .on('keydown.autocompleter', privates.documentKeydownHandler);

                return this;
            },

            documentClickHandler: function(event) {
                var $target = $(event.target),
                    $originalInput = [],
                    $input = [];

                if (!$target.is('.jquery-autocompleter') && !$target.parents('.jquery-autocompleter').length) {
                    privates.autocompleterBlurHandler();
                }

                if ($target.is('label')) {
                    if ($target.attr('for')) {
                        $originalInput = $('#' + $target.attr('for'));
                    }
                    else {
                        $originalInput = $target.find('.jquery-autocompleter-attached');
                    }

                    $input = $originalInput.next().find('.input').children();

                    if ($input.length) {
                        setTimeout(function() {
                            $input.trigger('focus');
                        }, 0);
                    }
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
                var $item                   = instance.$item.clone(),
                    originalInputWidth      = instance.$originalInput.outerWidth(),
                    originalInputHeight     = instance.$originalInput.outerHeight(),
                    originalInputFontSize   = parseInt(instance.$originalInput.css('font-size').replace('px', ''), 10),
                    originalInputFontFamily = instance.$originalInput.css('font-family'),
                    originalInputBorder     = parseInt(instance.$originalInput.css('border-width').replace('px', ''), 10),
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

                instance.$suggestionsList.css({
                    fontSize: originalInputFontSize
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
                instance.options.name = instance.$originalInput.attr('name');

                instance.$originalInput.removeAttr('name');
                $.extend(instance.options, instance.$originalInput.data());

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
                privates.xhrAbort.call(this);

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
                    value   = instance.$input.children().val(),
                    item    = null;

                if ((key === 'ENTER' && value !== '') || (key === 'TAB' && value !== '')) {
                    event.preventDefault();
                }

                instance.inputCaretIndex = instance.$input.children().caret().begin;

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

                    if (instance.$suggestionsList.children('.focus').length) {
                        item = {
                            label: instance.$suggestionsList.children('.focus').attr('data-label'),
                            value: instance.$suggestionsList.children('.focus').attr('data-value')
                        }
                    }

                    switch (key) {
                        case 'TAB':
                        case 'ENTER':       publics.itemAdd(item);
                                            break;

                        case 'DELETE':
                        case 'BACKSPACE':   if (instance.inputCaretIndex === 0) {
                                                privates.itemFocus.call('PREV');
                                            }

                                            break;

                        case 'LEFT-ARROW':  if (instance.inputCaretIndex === 0) {
                                                privates.itemFocus.call('PREV', true);
                                            }

                                            break;

                        case 'UP-ARROW':    privates.suggestionFocus.call('PREV');
                                            break;

                        case 'DOWN-ARROW':  privates.suggestionFocus.call('NEXT');
                                            break;

                        default:            privates.suggestionsGet();
                                            break;
                    }
                }, 0);

                return this;
            },

            inputClear: function() {
                instance.$input.children().val('');
                instance.$inputMirror.empty();
                privates.setInputWidth.call(this);
                privates.suggestionsHide.call(this);

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

            itemIsChosen: function(item) {
                return instance.$itemsList.find('.item[data-label="' + item.label + '"][data-value="' + item.value + '"]').length;
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

            itemRemoveClickHandler: function() {
                var $trigger = $(this),
                    $item = $trigger.parents('.item');

                publics.itemRemove($item);

                return this;
            },

            suggestionsGet: function() {
                var value = $.trim(instance.$input.children().val()),
                    url = instance.options.ajaxUrl;

                if (!url) {
                    $.error('No ajax url specified');
                }

                if (value.length >= instance.options.minCharacters) {
                    clearTimeout(instance.keyTimeout);

                    privates.xhrAbort.call(this);

                    instance.keyTimeout = setTimeout(function() {
                        instance.xhr = $.ajax({
                            type: 'get',
                            url: url + value,
                            dataType: 'json',
                            beforeSend: function() {
                                instance.$autocompleter.addClass('loading');
                            }
                        }).done(function(json) {
                            privates.jsonParse.call(json);
                        }).always(function() {
                            instance.$autocompleter.removeClass('loading');
                            privates.suggestionsBuild.call(this);
                            privates.suggestionsShow.call(this);
                        });
                    }, keyLag);
                }
            },

            suggestionsBuild: function() {
                instance.$suggestionsList.empty();

                for (var i = 0; i < instance.options.maxSuggestions; i++) {
                    var $suggestion = templates.$suggestion.clone(),
                        suggestion = instance.suggestions[i],
                        item = {};

                    if (suggestion) {
                        item = {
                            label: suggestion.label,
                                value: suggestion.value
                        };

                        if (!instance.options.uniqueItems || (instance.options.uniqueItems && !privates.itemIsChosen(item))) {
                            $suggestion.on('click', privates.suggestionChoose)
                                       .attr({
                                           title: suggestion.label,
                                           'data-label': suggestion.label,
                                           'data-value': suggestion.value
                                       }).find('.label').text(suggestion.label);

                            instance.$suggestionsList.append($suggestion);
                        }
                    }
                }

                privates.suggestionFocus.call(this);

                return this;
            },

            suggestionsShow: function() {
                var autocompleterHeight = instance.$autocompleter.height();

                if (instance.$suggestionsList.children().length) {
                    instance.$suggestionsList.removeClass('hide')
                                             .css({
                                                 top: autocompleterHeight
                                             });
                }
                else {
                    privates.suggestionsHide.call(this);
                }

                return this;
            },

            suggestionsHide: function() {
                instance.suggestionFocusIndex = 0;

                instance.$suggestionsList.addClass('hide')
                                         .empty();

                return this;
            },

            suggestionFocus: function() {
                var $suggestion = null,
                    minIndex    = 0,
                    maxIndex    = instance.$suggestionsList.children().length - 1;

                if (this === 'PREV') {
                    instance.suggestionFocusIndex--;
                }
                else if (this === 'NEXT') {
                    instance.suggestionFocusIndex++;
                }

                if (instance.suggestionFocusIndex < minIndex) {
                    instance.suggestionFocusIndex = maxIndex;
                }

                if (instance.suggestionFocusIndex > maxIndex) {
                    instance.suggestionFocusIndex = minIndex;
                }

                $suggestion = instance.$suggestionsList.children().eq(instance.suggestionFocusIndex);

                instance.$suggestionsList.children('.focus').removeClass('focus');
                $suggestion.addClass('focus');

                return this;
            },

            suggestionChoose: function() {
                var $suggestion = $(this),
                    label = $suggestion.attr('data-label'),
                    value = $suggestion.attr('data-value');

                publics.itemAdd({
                    label: label,
                    value: value
                });

                privates.suggestionsHide.call(this);

                return $suggestion;
            },

            jsonParse: function() {
                var json = this,
                    suggestions = [];

                if (typeof(json) === 'object' && json) {
                    $.each(json, function() {
                        suggestions.push({
                            label: this,
                            value: this
                        });
                    });
                }

                instance.$originalInput.trigger('json-update.autocompleter', json);

                if (instance.$autocompleter.data('suggestions')) {
                    suggestions = instance.$autocompleter.data('suggestions');
                }

                instance.suggestions = suggestions;

                return this;
            },

            xhrAbort: function() {
                if (instance.xhr) {
                    instance.xhr.abort();
                }
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
                var $originalInput  = $(this),
                    $autocompleter  = templates.$autocompleter.clone(),
                    classes         = $originalInput.attr('class'),
                    placeholder     = $originalInput.attr('placeholder');

                if ($originalInput.length && !$originalInput.is('.jquery-autocompleter-attached')) {
                    if (!$originalInput.is('input')) {
                        $.error('You are trying to attach autocompleter to a non-input element');
                    }

                    $autocompleter.addClass(classes)
                                  .on('click', privates.autocompleterClickHandler);

                    $originalInput.after($autocompleter)
                                  .addClass('jquery-autocompleter-attached');

                    instance.$originalInput = $originalInput;
                    instance.$autocompleter = $autocompleter;
                    instance.$suggestionsList = instance.$autocompleter.find('.suggestions-list');
                    instance.$itemsList = instance.$autocompleter.find('.items-list');
                    instance.$item = templates.$item.clone();
                    instance.$input = instance.$autocompleter.find('.input');
                    instance.$inputMirror = instance.$autocompleter.find('.input-mirror');

                    privates.setOptions.call(this);
                    privates.setStyles.call(this);
                    privates.setInputWidth.call(this);

                    instance.$input.children().attr('placeholder', placeholder)
                                              .on('blur', privates.inputBlurHandler)
                                              .on('focus', privates.inputFocusHandler)
                                              .on('keydown', privates.inputKeydownHandler);

                    if (instance.$originalInput.is(':disabled')) {
                        publics.disable.call(this);
                    }

                    if (instance.options.singleItem) {
                        instance.$autocompleter.addClass('single');
                    }
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
                var $originalInput = instance.$originalInput;

                publics.destroy.call(this);
                publics.build.call($originalInput.get(0));

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
                instance.$autocompleter.remove();
                instance.$originalInput.removeClass('jquery-autocompleter-attached');
                instance.$originalInput.attr('name', instance.options.name);

                return this;
            },

            itemAdd: function(item) {
                var $item = instance.$item.clone(),
                    label = null,
                    value = null,
                    itemCanBeAdded = true;

                if (!item.hasOwnProperty('label') || !item.hasOwnProperty('value')) {
                    $.error('There\'s something wrong with added item');
                }

                label = $.trim(item.label);
                value = $.trim(item.value);

                if (instance.options.uniqueItems && privates.itemIsChosen(item)) {
                    itemCanBeAdded = false;
                }

                if (label !== '' && value !== '') {
                    $item.attr('data-label', label)
                         .attr('data-value', value)
                         .on('click', privates.itemClickHandler)
                         .find('.label').text(label).end()
                         .find('.value').attr('name', instance.options.name)
                                        .val(value).end()
                         .find('.remove').on('click', privates.itemRemoveClickHandler);

                    if (itemCanBeAdded) {
                        $item.insertBefore(instance.$input);
                        instance.$originalInput.trigger('item-add.autocompleter', $item);

                        instance.itemFocusIndex = instance.$itemsList.children(':not(.input)').length;
                    }
                }

                privates.inputClear.call(this);
                privates.xhrAbort.call(this);

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
                    instance.$originalInput.trigger('item-remove.autocompleter', $item);
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

    $.fn.caret = function() {
        var range = {},
            selection = null;

        if (this[0].setSelectionRange) {
            range.begin = this[0].selectionStart;
            range.end = this[0].selectionEnd;
        }
        else if (document.selection && document.selection.createRange) {
            selection = document.selection.createRange();
            range.begin = 0 - selection.duplicate().moveStart('character', -100000);
            range.end = range.begin + selection.text.length;
        }

        return range;
    }
})($);
