/* global LEGACY */

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

    if (typeof LEGACY !== 'undefined' && LEGACY && 'autocompleter' in $.fn) {
        return false;
    }

    var specialCharsMap = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&apos;',
            '\\': ''
        },

        sortableOptions = {
            placeholderClass: 'item',
            placeholderInnerClass: 'jquery-autocompleter-label'
        },

        keyMap = {
            8: 'BACKSPACE',
            9: 'TAB',
            13: 'ENTER',
            27: 'ESC',
            37: 'LEFT-ARROW',
            38: 'UP-ARROW',
            39: 'RIGHT-ARROW',
            40: 'DOWN-ARROW',
            46: 'DELETE'
        },

        excludedKeys = [ 16, 17, 18, 20, 27, 37, 38, 39, 40, 91, 93 ],

        semaphore = true,

        keyLag = 200,

        privates = {
            /**
             * Create an instance of plugin for each autocompleter
             *
             * @private
             * @method init
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            init: function() {
                $.each(this, function() {
                    var $input = $(this),

                        instance = {
                            $originalInput: null,
                            $autocompleter: null,
                            $widget: null,
                            $suggestionsList: null,
                            $itemsList: null,
                            $item: null,
                            $input: null,
                            $inputMirror: null,
                            options: {
                                name: null,
                                minCharacters: 2,
                                maxSuggestions: 10,
                                maxItems: false,
                                separators: [],
                                readonly: false,
                                forceCapitalize: false
                            },
                            keyTimeout: null,
                            xhr: null,
                            suggestions: [],
                            itemFocusIndex: 0,
                            suggestionFocusIndex: 0,
                            inputCaretIndex: 0
                        },

                        templates = {
                            $autocompleter: $('<section></section>').addClass('jquery-autocompleter')
                                .append($('<section></section>').addClass('widget')
                                    .append($('<ul></ul>').addClass('items-list')
                                        .append($('<li></li>').addClass('input')
                                            .append($('<input/>').attr({
                                                'type': 'text',
                                                'autocomplete': 'off',
                                                'class': 'jquery-autocompleter-input'
                                            })
                                        )
                                    )
                                )
                            )
                            .append($('<ul></ul>').addClass('suggestions-list hide'))
                            .append($('<span></span>').addClass('input-mirror')),

                            $item: $('<li></li>').addClass('item')
                                .append($('<span></span>').addClass('jquery-autocompleter-label'))
                                .append($('<a></a>').addClass('remove'))
                                .append($('<input/>').addClass('value').attr('type', 'hidden')),

                            $suggestion: $('<li></li>').addClass('suggestion')
                                .append($('<span></span>').addClass('custom-content-prefix'))
                                .append($('<span></span>').addClass('jquery-autocompleter-label'))
                                .append($('<span></span>').addClass('custom-content-sufix'))
                        };

                    $input.data({
                        instance: instance,
                        templates: templates
                    });

                    publics.build.call($input);
                });

                $(document).on({
                    'click.autocompleter': privates.documentClickHandler.bind(this),
                    'keydown.autocompleter': privates.documentKeydownHandler
                });

                return this;
            },

            /**
             * Handler for click event on a whole document, it handles autocompleter element blur & focus by clicking
             * on particular label
             *
             * @private
             * @method documentClickHandler
             * @memberOf jQuery.fn.autocompleter
             * @param {object} event [Click event]
             * @return {html} Original element HTML
             */
            documentClickHandler: function(event) {
                var $target = $(event.target),
                    $targetOriginalInput = [],
                    $autocompleter = $('.jquery-autocompleter.last-active'),
                    $originalInput = $(),
                    instance = null,
                    $suggestion = null;

                if ($autocompleter.length) {
                    $originalInput = $autocompleter.prev();
                    instance = $originalInput.data('instance');
                    $suggestion = instance.$suggestionsList.children('.focus');

                    if ($suggestion.length) {
                        publics.itemAdd.call($originalInput, {
                            label: $suggestion.attr('data-label'),
                            value: $suggestion.attr('data-value'),
                            data: $suggestion.data()
                        });

                        privates.suggestionsHide.call($originalInput);
                    }
                }

                if (!$target.is('.jquery-autocompleter') && !$target.parents('.jquery-autocompleter').length && $originalInput.length ||
                    $autocompleter.is('.single') && $target.parents('.suggestions-list').length || $target.is('.jquery-autocompleter-input')) {
                    privates.autocompleterBlurHandler.call($originalInput);
                }

                if ($target.is('label') && $target.attr('for')) {
                    $targetOriginalInput = $('#' + $target.attr('for'));

                    if ($targetOriginalInput.length) {
                        $targetOriginalInput.next().find('.input input').trigger('focus');
                    }
                }

                return this;
            },


            /**
             * Handler for keydown event on a whole document, it handles items deletion and traversing
             *
             * @private
             * @method documentKeydownHandler
             * @memberOf jQuery.fn.autocompleter
             * @param {object} event [Keydown event]
             * @return {html} Original element HTML
             */
            documentKeydownHandler: function(event) {
                var $autocompleter = $('.jquery-autocompleter.focus'),
                    $originalInput = $autocompleter.prev(),
                    instance = $originalInput.data('instance'),
                    key = keyMap[event.keyCode];

                if ($originalInput.length) {
                    switch (key) {
                        case 'ENTER':
                            privates.formSubmitHandler.call($originalInput);
                            break;

                        case 'DELETE':
                        case 'BACKSPACE':
                            privates.itemKeydownDelete.call($originalInput, event);
                            break;

                        case 'LEFT-ARROW':
                            if (!instance.$input.is('.focus')) {
                                privates.itemFocus.call($originalInput, 'PREV');
                            }
                            break;

                        case 'RIGHT-ARROW':
                            if (!instance.$input.is('.focus')) {
                                privates.itemFocus.call($originalInput, 'NEXT');
                            }
                            break;

                        default:
                            break;
                    }
                }

                return this;
            },

            /**
             * Clone styles from original text input to a newly created autocompleter element
             *
             * @private
             * @method setStyles
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            setStyles: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $item = instance.$item.clone(),
                    originalInputWidth = instance.$originalInput.outerWidth(),
                    originalInputHeight = instance.$originalInput.outerHeight(),
                    originalInputFontSize = parseInt(instance.$originalInput.css('font-size').replace('px', ''), 10),
                    originalInputFontFamily = instance.$originalInput.css('font-family'),
                    originalInputBorder = parseInt(instance.$originalInput.css('border-top-width').replace('px', ''), 10),
                    itemsListPaddingTop = parseInt(instance.$itemsList.css('padding-top').replace('px', ''), 10),
                    itemPaddingBottom = 0,
                    lineHeight = 0;

                $item.insertBefore(instance.$input);

                itemPaddingBottom = parseInt($item.css('margin-bottom').replace('px', ''), 10);
                lineHeight = Math.round(originalInputHeight - itemsListPaddingTop - itemPaddingBottom - originalInputBorder * 2);

                $item.remove();

                instance.$widget.css({
                    width: originalInputWidth,
                    minHeight: originalInputHeight,
                    maxHeight: (lineHeight + itemPaddingBottom) * 3 + itemPaddingBottom * 2
                });

                instance.$suggestionsList.css({
                    fontSize: originalInputFontSize
                });

                instance.$item.css({
                    fontSize: originalInputFontSize,
                    lineHeight: lineHeight + 'px'
                });

                instance.$input.children().css({
                    lineHeight: lineHeight + itemPaddingBottom + 'px'
                });

                instance.$input.children().add(instance.$inputMirror).css({
                    fontFamily: originalInputFontFamily,
                    fontSize: originalInputFontSize
                });

                return this;
            },

            /**
             * Set autocompleter settings by HTML attributes
             *
             * @private
             * @method setOptions
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            setOptions: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.options.name = instance.$originalInput.attr('name');
                instance.options.separators = instance.$originalInput.attr('data-separators');

                instance.$originalInput.removeAttr('name')
                                       .attr('data-name', instance.options.name);

                $.extend(instance.options, instance.$originalInput.data());

                if (typeof instance.options.name !== 'undefined' && !instance.options.singleItem) {
                    if (!instance.options.name.match(/\[\]$/)) {
                        instance.options.name += '[]';
                    }
                }

                if (typeof instance.options.separators !== 'undefined') {
                    instance.options.separators = JSON.parse(instance.options.separators.replace(/'/g, '"'));
                }

                return this;
            },

            /**
             * Handler for click event on autocompleter widget
             *
             * @private
             * @method autocompleterClickHandler
             * @memberOf jQuery.fn.autocompleter
             * @param {object} event [Click event]
             * @return {html} Original element HTML
             */
            autocompleterClickHandler: function(event) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $target = $(event.target),
                    targetIsInput = $target.parents('.jquery-autocompleter').length && $target.is('input:text');

                if (!instance.$autocompleter.is('.disabled') && !instance.$autocompleter.is('.readonly') && ($target.is('.jquery-autocompleter') ||
                    $target.parents('.jquery-autocompleter').length || targetIsInput)) {
                    instance.$autocompleter.addClass('focus');

                    if (!targetIsInput) {
                        if (!$target.is('.item') && !$target.parents('.item').length) {
                            instance.$input.children().trigger('focus');
                        }
                    } else if (targetIsInput || $target.is('.jquery-autocompleter')) {
                        privates.inputListBlur.call($originalInput);
                    }
                }

                return this;
            },

            /**
             * Handler for blur out of the autocompleter widget
             *
             * @private
             * @method autocompleterBlurHandler
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            autocompleterBlurHandler: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                if (typeof instance === 'undefined') {
                    return false;
                }

                $('.jquery-autocompleter.last-active').removeClass('last-active').removeClass('focus').find('.focus').removeClass('focus');

                instance.$autocompleter.add(instance.$itemsList.find('.focus')).removeClass('focus');
                instance.$autocompleter.addClass('last-active');

                if (!instance.$suggestionsList.is('.mouseover') && !instance.$autocompleter.is('.mouseover')) {
                    privates.inputListBlur.call($originalInput);
                    privates.inputClear.call($originalInput);
                    privates.xhrAbort.call($originalInput);
                }

                instance.$originalInput.trigger('input-blur.autocompleter');

                return this;
            },

            /**
             * Handler for mouse events on autocompleter widget
             *
             * @private
             * @method autocompleterMouseHandler
             * @memberOf jQuery.fn.autocompleter
             * @param {object} event [Mouse event]
             * @return {html} Autocompleter widget HTML
             */
            autocompleterMouseHandler: function(event) {
                var $autocompleter = $(this),
                    $originalInput = $autocompleter.prev(),
                    instance = $originalInput.data('instance');

                if (event.type === 'mouseenter') {
                    instance.$autocompleter.addClass('mouseover');
                } else {
                    instance.$autocompleter.removeClass('mouseover');
                }

                return this;
            },

            /**
             * Remove focus from suggestions list items
             *
             * @private
             * @method inputListBlur
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            inputListBlur: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.$itemsList.children('.focus:not(.input)').removeClass('focus');

                return this;
            },

            /**
             * Handler for blur out of the autocompleter inner input
             *
             * @private
             * @method inputBlurHandler
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            inputBlurHandler: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.$input.removeClass('focus');
                privates.autocompleterBlurHandler.call($originalInput);

                return this;
            },

            /**
             * Handler for focus on the autocompleter inner input
             *
             * @private
             * @method inputFocusHandler
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            inputFocusHandler: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.itemFocusIndex = instance.$itemsList.children(':not(.input)').length;

                instance.$autocompleter.add(instance.$input).addClass('focus');
                privates.inputListBlur.call($originalInput);

                return this;
            },

            /**
             * Handler for pasting text to the autocompleter inner input
             *
             * @private
             * @method inputPasteHandler
             * @memberOf jQuery.fn.autocompleter
             * @param {object} event [Keydown event]
             * @return {html} Original element HTML
             */
            inputPasteHandler: function(event) {
                event.preventDefault();

                return this;
            },

            /**
             * Handler for keydown on the autocompleter inner input
             *
             * @private
             * @method inputKeydownHandler
             * @memberOf jQuery.fn.autocompleter
             * @param {object} event [Keydown event]
             * @return {html} Original element HTML
             */
            inputKeydownHandler: function(event) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $suggestion = instance.$suggestionsList.children('.focus'),
                    key = keyMap[event.keyCode],
                    value = $.trim(instance.$input.children().val());

                if (event.type === 'paste') {
                    instance.$originalInput.trigger('paste.autocompleter');
                }

                if (key === 'ENTER' && instance.$suggestionsList.is(':visible') || key === 'TAB' && value !== '' && !instance.options.singleItem && publics.getValues.call(this).length) {
                    event.preventDefault();
                }

                instance.inputCaretIndex = instance.$input.children().caret().begin;

                if (key === 'BACKSPACE') {
                    privates.suggestionsHide.call($originalInput);
                }

                setTimeout(function() {
                    value = $.trim(instance.$input.children().val());

                    instance.$inputMirror.html(value);
                    publics.setInputWidth.call($originalInput);

                    switch (key) {
                        case 'TAB':
                        case 'ENTER':
                            if (instance.$suggestionsList.is(':visible')) {
                                privates.suggestionChoose.call($suggestion);
                            }
                            break;

                        case 'ESC':
                            privates.inputClear.call($originalInput);
                            break;

                        case 'DELETE':
                        case 'BACKSPACE':
                            privates.suggestionsGet.call($originalInput);
                            if (instance.inputCaretIndex === 0) {
                                privates.itemFocus.call($originalInput, 'PREV');
                            }
                            break;

                        case 'LEFT-ARROW':
                            if (instance.inputCaretIndex === 0) {
                                privates.itemFocus.call($originalInput, 'PREV');
                            }
                            break;

                        case 'RIGHT-ARROW':
                            break;

                        case 'UP-ARROW':
                            privates.suggestionFocus.call($originalInput, 'PREV');
                            break;

                        case 'DOWN-ARROW':
                            privates.suggestionFocus.call($originalInput, 'NEXT');
                            break;

                        default:
                            if ($.inArray(event.keyCode, excludedKeys) === -1) {
                                privates.suggestionsGet.call($originalInput);
                            }
                            break;
                    }
                }, 0);

                return this;
            },

            /**
             * Clear autocompleter inner input
             *
             * @private
             * @method inputClear
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            inputClear: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.$input.children().val('');
                instance.$inputMirror.empty();
                publics.setInputWidth.call($originalInput);
                privates.suggestionsHide.call($originalInput);
                privates.xhrAbort.call($originalInput);
                instance.$originalInput.trigger('input-clear.autocompleter');

                return this;
            },

            /**
             * Remove item from items list by pressing delete key
             *
             * @private
             * @method itemKeydownDelete
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            itemKeydownDelete: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $item = instance.$itemsList.find('.focus:not(.input)');

                if ($item.length) {
                    publics.itemRemove.call($originalInput, $item);
                }

                return this;
            },

            /**
             * Handler for click on item within autocompleter widget
             *
             * @private
             * @method itemClickHandler
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Clicked item HTML
             */
            itemClickHandler: function() {
                var $item = $(this),
                    $autocompleter = $item.parents('.jquery-autocompleter'),
                    $originalInput = $autocompleter.prev(),
                    instance = $originalInput.data('instance');

                instance.itemFocusIndex = $item.index();

                privates.itemFocus.call($originalInput, $item);

                return this;
            },

            /**
             * Handler for mouse enter/leave events on item within autocompleter widget
             *
             * @private
             * @method suggestionMouseHandler
             * @memberOf jQuery.fn.autocompleter
             * @param {object} event [Mouse event]
             * @return {html} Moused suggestion HTML
             */
            suggestionMouseHandler: function(event) {
                var $suggestion = $(this),
                    $autocompleter = $suggestion.parents('.jquery-autocompleter'),
                    $originalInput = $autocompleter.prev(),
                    instance = $originalInput.data('instance');

                instance.suggestionFocusIndex = $suggestion.index();

                privates.suggestionFocus.call($originalInput);

                if (event.type === 'mouseenter') {
                    instance.$suggestionsList.addClass('mouseover');
                } else {
                    instance.$suggestionsList.removeClass('mouseover');
                }

                return this;
            },

            /**
             * Check is suggestion on items list within autocompleter widget
             *
             * @private
             * @method suggestionIsChosen
             * @memberOf jQuery.fn.autocompleter
             * @param {object} suggestion [Suggestion]
             * @return {boolean}
             */
            suggestionIsChosen: function(suggestion) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    label = suggestion.label,
                    value = suggestion.value;

                if (typeof label === 'string') {
                    label = label.replace(/\\/g, '&#92;').replace(/\"/g, '&#34;');
                }

                if (typeof value === 'string') {
                    value = value.replace(/\\/g, '&#92;').replace(/\"/g, '&#34;');
                }

                return instance.$itemsList.find('.item[data-label="' + label + '"][data-value="' + value + '"]').length ? true : false;
            },

            /**
             * Focus on a particular item within autocompleter widget
             *
             * @private
             * @method itemFocus
             * @memberOf jQuery.fn.autocompleter
             * @param {string/object} directionOrItem [Direction or item]
             * @return {html} Original element HTML
             */
            itemFocus: function(directionOrItem) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $item = null,
                    minIndex = 0,
                    maxIndex = instance.$itemsList.children(':not(.input)').length,
                    focusTriggered = false;

                if (typeof directionOrItem === 'string') {
                    if (directionOrItem === 'PREV') {
                        instance.itemFocusIndex--;
                    } else if (directionOrItem === 'NEXT') {
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
                } else {
                    $item = directionOrItem;
                }

                if (!focusTriggered && !instance.$autocompleter.is('.disabled') && !instance.$autocompleter.is('.readonly')) {
                    instance.$input.children().trigger('blur');
                    instance.$autocompleter.addClass('focus');
                }

                privates.inputListBlur.call($originalInput);

                if ($item.is('.item') && !instance.$autocompleter.is('.disabled') && !instance.$autocompleter.is('.readonly')) {
                    $item.addClass('focus');
                    instance.$originalInput.trigger('item-focus.autocompleter', [ $item ]);
                }

                return this;
            },

            /**
             * Remove item by clicking on "x" button
             *
             * @private
             * @method itemRemoveClickHandler
             * @memberOf jQuery.fn.autocompleter
             * @return {html} "x" button HTML
             */
            itemRemoveClickHandler: function() {
                var $trigger = $(this),
                    $item = $trigger.parents('.item'),
                    $autocompleter = $item.parents('.jquery-autocompleter'),
                    $originalInput = $autocompleter.prev();

                publics.itemRemove.call($originalInput, $item);

                return this;
            },

            /**
             * Get suggestions from AJAX request
             *
             * @private
             * @method suggestionsGet
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            suggestionsGet: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    value = $.trim(instance.$input.children().val()),
                    encodedValue = encodeURIComponent(value),
                    url = $originalInput.attr('data-ajax-url');

                if (!semaphore) {
                    return false;
                }

                if ($.inArray(value.substr(value.length - 1), instance.options.separators) !== -1) {
                    privates.separatorsListener.call(this);
                }

                instance.$suggestionsList.empty();

                if (url) {
                    if (value.length >= instance.options.minCharacters) {
                        clearTimeout(instance.keyTimeout);

                        privates.xhrAbort.call(this);

                        instance.keyTimeout = setTimeout(function() {
                            instance.xhr = $.ajax({
                                type: 'get',
                                url: url + encodedValue,
                                dataType: 'json',
                                crossDomain: true,
                                xhrFields: {
                                    withCredentials: true
                                },
                                beforeSend: function() {
                                    semaphore = false;

                                    instance.suggestions = [];

                                    instance.$autocompleter.addClass('loading');
                                }
                            }).done(function(json) {
                                privates.jsonParse.call($originalInput, json);
                            }).always(function() {
                                instance.$autocompleter.removeClass('loading');

                                if ($.trim(instance.$input.children().val()).length >= instance.options.minCharacters) {
                                    privates.suggestionsBuild.call($originalInput);
                                    privates.suggestionsShow.call($originalInput);
                                }

                                semaphore = true;
                            });
                        }, keyLag);
                    }
                } else {
                    privates.suggestionsBuild.call($originalInput);
                    privates.suggestionsShow.call($originalInput);
                }

                return this;
            },

            /**
             * Build suggestions list
             *
             * @private
             * @method suggestionsBuild
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            suggestionsBuild: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    maxSuggestions = instance.options.maxSuggestions,
                    label = $.trim(instance.$input.children().val()),
                    value = $.trim(instance.$input.children().val()),
                    item = {},
                    labels = [];

                if (instance.options.customItems) {
                    --maxSuggestions;
                }

                if (instance.options.forceCapitalize) {
                    label = label.charAt(0).toUpperCase() + label.slice(1);
                    value = value.charAt(0).toUpperCase() + value.slice(1);
                }

                instance.suggestions = instance.suggestions.slice(0, maxSuggestions);

                for (var i = 0; i < instance.suggestions.length; i++) {
                    var suggestion = instance.suggestions[i],
                        item = {};

                    if (suggestion) {
                        item = {
                            label: suggestion.label,
                            value: suggestion.value,
                            data: suggestion.data
                        };

                        labels.push(suggestion.label.toLowerCase());

                        privates.suggestionAdd.call($originalInput, item);
                    }
                }

                if (instance.options.customItems && labels.indexOf(label.toLowerCase()) === -1) {
                    item = {
                        label: label,
                        value: value,
                        data: {
                            customItem: true,
                            customContentSufix: instance.options.customContentSufix || '',
                            customContentPrefix: instance.options.customContentPrefix || ''
                        }
                    };

                    privates.suggestionAdd.call($originalInput, item);
                }

                return this;
            },

            /**
             * Show suggestions list
             *
             * @private
             * @method suggestionsShow
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            suggestionsShow: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    autocompleterHeight = instance.$autocompleter.height();

                if (instance.$suggestionsList.children().length) {
                    instance.$suggestionsList.removeClass('hide')
                                             .css({
                                                 top: autocompleterHeight
                                             });

                    privates.suggestionFocus.call($originalInput);
                } else {
                    privates.suggestionsHide.call($originalInput);
                }

                return this;
            },

            /**
             * Hide suggestions list
             *
             * @private
             * @method suggestionsHide
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            suggestionsHide: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.suggestionFocusIndex = 0;

                instance.$suggestionsList.addClass('hide');

                return this;
            },

            /**
             * Add suggestion to a suggestions list
             *
             * @private
             * @method suggestionAdd
             * @memberOf jQuery.fn.autocompleter
             * @param {object} suggestion [Suggestion]
             * @return {html} Original element HTML
             */
            suggestionAdd: function(suggestion) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    templates = $originalInput.data('templates'),
                    $suggestion = templates.$suggestion.clone(),
                    escapedSuggestion = {
                        label: suggestion.label + '',
                        value: suggestion.value + ''
                    };

                if (typeof suggestion.data !== 'undefined' && 'customItem' in suggestion.data) {
                    $suggestion.addClass('custom-item');
                }

                for (var key in specialCharsMap) {
                    escapedSuggestion.label = escapedSuggestion.label.split(key).join(specialCharsMap[key]);
                    escapedSuggestion.value = escapedSuggestion.value.split(key).join(specialCharsMap[key]);
                }

                if ((!instance.options.uniqueItems || instance.options.uniqueItems && !privates.suggestionIsChosen.call(this, escapedSuggestion))
                    && escapedSuggestion.label !== '' && escapedSuggestion.value !== '') {
                    $suggestion.on({
                        click: privates.suggestionChoose,
                        mouseenter: privates.suggestionMouseHandler,
                        mouseleave: privates.suggestionMouseHandler
                    }).attr({
                        title: suggestion.label,
                        'data-label': escapedSuggestion.label,
                        'data-value': escapedSuggestion.value
                    }).find('.jquery-autocompleter-label').html(suggestion.label);

                    if (typeof suggestion.data !== 'undefined') {
                        if ('customContentPrefix' in suggestion.data) {
                            $suggestion.find('.custom-content-prefix').html(suggestion.data.customContentPrefix);
                        }

                        if ('customContentSufix' in suggestion.data) {
                            $suggestion.find('.custom-content-sufix').html(suggestion.data.customContentSufix);
                        }

                        $suggestion.data(suggestion.data);
                    }

                    instance.$suggestionsList.append($suggestion);
                }

                return this;
            },

            /**
             * Focus on a particular suggestion
             *
             * @private
             * @method suggestionFocus
             * @memberOf jQuery.fn.autocompleter
             * @param {string} direction [Direction]
             * @return {html} Original element HTML
             */
            suggestionFocus: function(direction) {
                var $originalInput = $(this),
                    $suggestion = null,
                    instance = $originalInput.data('instance'),
                    minIndex = 0,
                    maxIndex = instance.$suggestionsList.children().length - 1;

                if (direction === 'PREV') {
                    instance.suggestionFocusIndex--;
                } else if (direction === 'NEXT') {
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

            /**
             * Choose a particular suggestion
             *
             * @private
             * @method suggestionChoose
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Suggestion HTML
             */
            suggestionChoose: function() {
                var $suggestion = $(this),
                    $autocompleter = $suggestion.parents('.jquery-autocompleter'),
                    $originalInput = $autocompleter.prev(),
                    instance = $originalInput.data('instance');

                if (instance.$suggestionsList.is(':visible')) {
                    publics.itemAdd.call($originalInput, {
                        label: $suggestion.attr('data-label'),
                        value: $suggestion.attr('data-value'),
                        data: $suggestion.data()
                    });

                    privates.suggestionsHide.call($originalInput);
                }

                return $suggestion;
            },

            /**
             * Parse JSON data to a required format
             *
             * @private
             * @method jsonParse
             * @memberOf jQuery.fn.autocompleter
             * @param {object} json [JSON to parse]
             * @return {html} Original element HTML
             */
            jsonParse: function(json) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    suggestions = [];

                if (typeof json === 'object' && json) {
                    suggestions = json;
                }

                instance.$originalInput.trigger('json-update.autocompleter', [ json ]);

                if (instance.$originalInput.data('suggestions')) {
                    suggestions = instance.$originalInput.data('suggestions');
                }

                instance.suggestions = suggestions;

                return this;
            },

            /**
             * Abort AJAX request
             *
             * @private
             * @method xhrAbort
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            xhrAbort: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                setTimeout(function() {
                    if (instance.xhr) {
                        instance.xhr.abort();
                    }
                }, 0);

                return this;
            },

            /**
             * Listen for typing separators defined in data attribute
             *
             * @private
             * @method separatorsListener
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            separatorsListener: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $suggestion = instance.$suggestionsList.children('.focus'),
                    value = $.trim(instance.$input.children().val());

                if ($.inArray(value.substr(value.length - 1), instance.options.separators) !== -1 && $suggestion.length) {
                    privates.suggestionChoose.call($suggestion);
                }

                return this;
            },

            /**
             * @private
             * @method formSubmitHandler
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            formSubmitHandler: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $form = $originalInput.parents('form:first');

                if (!instance.$suggestionsList.is(':visible') && !instance.$input.is('.focus')) {
                    $form.trigger('submit');
                }
            }
        },

        publics = {
            /**
             * Builds particular widget instance
             *
             * @method build
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            build: function() {
                var $originalInput = $(this),
                    templates = $originalInput.data('templates'),
                    instance = $originalInput.data('instance'),
                    $autocompleter = templates.$autocompleter.clone(),
                    classes = $originalInput.attr('class'),
                    placeholder = $originalInput.attr('placeholder'),
                    maxlength = $originalInput.attr('maxlength');

                if ($originalInput.length && !$originalInput.is('.jquery-autocompleter-attached')) {
                    if (!$originalInput.is('input')) {
                        $.error('You are trying to attach autocompleter to a non-input element');
                    }

                    $autocompleter.on({
                        click: privates.autocompleterClickHandler.bind($originalInput),
                        mouseenter: privates.autocompleterMouseHandler,
                        mouseleave: privates.autocompleterMouseHandler
                    });

                    $originalInput.after($autocompleter);

                    instance.$originalInput = $originalInput;
                    instance.$autocompleter = $autocompleter;
                    instance.$widget = instance.$autocompleter.find('.widget');
                    instance.$suggestionsList = instance.$autocompleter.find('.suggestions-list');
                    instance.$itemsList = instance.$autocompleter.find('.items-list');
                    instance.$item = templates.$item.clone();
                    instance.$input = instance.$autocompleter.find('.input');
                    instance.$inputMirror = instance.$autocompleter.find('.input-mirror');

                    privates.setOptions.call($originalInput);
                    privates.setStyles.call($originalInput);
                    publics.setInputWidth.call($originalInput);

                    instance.$originalInput.addClass('jquery-autocompleter-attached');
                    instance.$widget.addClass(classes);

                    instance.$input.children().attr({
                        maxlength: maxlength,
                        placeholder: placeholder
                    }).on({
                        blur: privates.inputBlurHandler.bind($originalInput),
                        focus: privates.inputFocusHandler.bind($originalInput),
                        keydown: privates.inputKeydownHandler.bind($originalInput),
                        paste: privates.inputPasteHandler.bind($originalInput)
                    });

                    if (instance.$originalInput.is(':disabled')) {
                        publics.disable.call(this);
                    }

                    if (instance.$originalInput.is('[readonly]')) {
                        instance.$autocompleter.addClass('readonly');
                    }

                    if (instance.options.singleItem) {
                        instance.$autocompleter.addClass('single');
                    }

                    if (instance.options.sortable && typeof $.fn.sortable === 'function') {
                        instance.$autocompleter.addClass('sortable');
                        instance.$itemsList.sortable(sortableOptions);
                    }

                    if (instance.options.selectedItems && instance.options.selectedItems instanceof Object) {
                        for (var i = 0; i < instance.options.selectedItems.length; i++) {
                            var item = {
                                label: instance.options.selectedItems[i].label || instance.options.selectedItems[i].name, // ac.js hack start
                                value: instance.options.selectedItems[i].value,
                                data: instance.options.selectedItems[i].data
                            };

                            publics.itemAdd.call(instance.$originalInput, item, true);
                        }
                    }

                    instance.$originalInput.trigger('build.autocompleter');
                }

                return this;
            },

            /**
             * Rebuilds particular widget instance
             *
             * @method refresh
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            refresh: function() {
                var $originalInput = $(this);

                if ($originalInput.length) {
                    publics.destroy.call($originalInput);
                    publics.build.call($originalInput.get(0));
                }

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
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                if (typeof instance === 'undefined') {
                    instance = {
                        $originalInput: $originalInput,
                        $autocompleter: $originalInput.next(),
                        options: {
                            name: $originalInput.attr('data-name')
                        }
                    };
                }

                instance.$autocompleter.remove();
                instance.$originalInput.removeClass('jquery-autocompleter-attached');
                instance.$originalInput.attr('name', instance.options.name)
                                       .removeAttr('data-name');

                return this;
            },

            /**
             * Set autocompleter inner input width
             *
             * @method setInputWidth
             * @memberOf jQuery.fn.autocompleter
             * @return {html} Original element HTML
             */
            setInputWidth: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    inputWidth = 0,
                    inputPadding = parseInt(instance.$input.children().css('padding-left').replace('px', ''), 10),
                    itemsListPadding = parseInt(instance.$itemsList.css('padding-left').replace('px', ''), 10),
                    minWidth = parseInt(instance.$input.children().css('font-size').replace('px', ''), 10),
                    maxWidth = instance.$autocompleter.outerWidth() - inputPadding * 2;

                instance.$input.children().width(0);

                inputWidth = maxWidth - instance.$input.position().left - itemsListPadding * 2 - inputPadding * 2;

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

            clearSelectedItems: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.$originalInput.removeAttr('data-selected-items')
                                       .removeData('selectedItems');

                delete instance.$originalInput.data('instance').options.selectedItems;

                return this;
            },

            /**
             * Add specified item to the items list
             *
             * @method itemAdd
             * @memberOf jQuery.fn.autocompleter
             * @param {object} item [Item]
             * @param {boolean} programmatic [Is item added programmatic (data-selected-items context)]
             * @return {jquery} Chainable jQuery object
             */
            itemAdd: function(item, programmatic) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $item = instance.$item.clone(),
                    itemCanBeAdded = true;

                if (!item) {
                    privates.inputClear.call(this);
                    privates.xhrAbort.call(this);

                    return false;
                }

                if (item instanceof Array) {
                    for (var i = 0; i < item.length; i++) {
                        publics.itemAdd.call($originalInput, item[i]);
                    }

                    return false;
                }

                if (!item.hasOwnProperty('label') || !item.hasOwnProperty('value')) {
                    $.error('There\'s something wrong with added item');
                }

                if (
                    instance.options.uniqueItems && privates.suggestionIsChosen.call(this, item) ||
                    instance.options.singleItem && publics.getValues.call(this).length
                ) {
                    itemCanBeAdded = false;
                }

                if (instance.options.maxItems && publics.getValues.call(this).length >= instance.options.maxItems) {
                    itemCanBeAdded = false;

                    instance.$originalInput.trigger('item-redundant.autocompleter', [ $item ]);
                }

                if (item.label !== '' && item.value !== '') {
                    $item.attr({
                        'data-label': item.label,
                        'data-value': item.value
                    })
                    .on('click', privates.itemClickHandler)
                    .find('.jquery-autocompleter-label').html(item.label).end()
                    .find('.value').attr('name', instance.options.name)
                    .val(item.value).end()
                    .find('.remove').on('click', privates.itemRemoveClickHandler);

                    if (typeof item.data !== 'undefined') {
                        $item.data(item.data);
                    }

                    if (itemCanBeAdded) {
                        $item.insertBefore(instance.$input);

                        if (instance.options.sortable && typeof $.fn.sortable === 'function') {
                            instance.$itemsList.sortable('destroy').sortable(sortableOptions);

                            instance.$itemsList.on('dragstart.h5s', '.item', function(event) {
                                var $item = $(event.target);

                                setTimeout(function() {
                                    instance.$itemsList.find('.sortable-placeholder').width($item.outerWidth());
                                }, 50);
                            });
                        }

                        instance.$originalInput.trigger('item-add.autocompleter', [ $item, programmatic ]);

                        instance.itemFocusIndex = instance.$itemsList.children(':not(.input)').length;

                        if (!programmatic) {
                            instance.$input.children().trigger('focus');
                        }
                    }
                }

                privates.inputClear.call(this);
                privates.xhrAbort.call(this);
                instance.$suggestionsList.empty();

                return $item;
            },

            /**
             * Remove specified item from the items list
             *
             * @method itemRemove
             * @memberOf jQuery.fn.autocompleter
             * @param {object} item [Item]
             * @return {jquery} Chainable jQuery object
             */
            itemRemove: function(item) {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance'),
                    $item = [],
                    label = item.label,
                    value = item.value;

                if (typeof label === 'string') {
                    label = label.replace(/\\/g, '&#92;').replace(/\"/g, '&#34;');
                }

                if (typeof value === 'string') {
                    value = value.replace(/\\/g, '&#92;').replace(/\"/g, '&#34;');
                }

                if (!item.hasOwnProperty('label')) {
                    item = $(item);
                }

                if (item instanceof $) {
                    $item = item;
                } else {
                    $item = instance.$itemsList.find('.item[data-label="' + label + '"][data-value="' + value + '"]');
                }

                if ($item.length) {
                    instance.$originalInput.trigger('before-item-remove.autocompleter', [ $item ]);

                    if (!$item.is('.prevent-remove')) {
                        $item.remove();

                        publics.setInputWidth.call(this);
                        instance.$originalInput.trigger('item-remove.autocompleter', [ $item ]);
                        instance.$input.children().trigger('focus');

                        instance.itemFocusIndex = instance.$itemsList.children(':not(.input)').length;
                    }
                }

                return $item;
            },

            /**
             * Get values of chosen items
             *
             * @method getValues
             * @memberOf jQuery.fn.autocompleter
             * @return {object} Array of values
             */
            getValues: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                return $.map(instance.$itemsList.children(':not(.input)'), function(item) {
                    var value = $(item).attr('data-value');

                    if (!isNaN(parseInt(value, 10))) {
                        value = parseInt(value, 10);
                    }

                    return value;
                });
            },

            /**
             * Get text typed into text input field
             *
             * @method getTypedText
             * @memberOf jQuery.fn.autocompleter
             * @return {string} Typed text
             */
            getTypedText: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                return $.trim(instance.$input.children().val());
            },

            /**
             * Clear autocompleter widget from chosen items
             *
             * @method getValues
             * @memberOf jQuery.fn.autocompleter
             * @return {object} Array of values
             */
            clear: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                if (typeof instance !== 'undefined') {
                    instance.$itemsList.children(':not(.input)').remove();
                    publics.setInputWidth.call(this);
                }

                return this;
            },

            disable: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.$autocompleter.addClass('disabled');
                instance.$input.children().prop('disabled', true);

                return this;
            },

            enable: function() {
                var $originalInput = $(this),
                    instance = $originalInput.data('instance');

                instance.$autocompleter.removeClass('disabled');
                instance.$input.children().prop('disabled', false);

                return this;
            }
        };

    /**
     * jQuery method for transforming default text input lists into aan autocompleter
     *
     * @name Autocompleter
     * @memberOf jQuery.fn
     * @param {string} method Public method name
     * @return {jquery} Chainable jQuery object
     */
    $.fn.autocompleter = function(method) {
        if (typeof method === 'undefined') {
            return privates.init.apply(this);
        } else if (typeof method === 'string') {
            if (publics[method]) {
                return publics[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        } else if (typeof method === 'object') {
            return publics[Object.keys(method)[0]].call(this, method[Object.keys(method)[0]]);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.autocompleter');
        }

        return this;
    };

    $.fn.caret = function() {
        var range = {},
            selection = null;

        if (this[0].setSelectionRange) {
            range.begin = this[0].selectionStart;
            range.end = this[0].selectionEnd;
        } else if (document.selection && document.selection.createRange) {
            selection = document.selection.createRange();
            range.begin = 0 - selection.duplicate().moveStart('character', -100000);
            range.end = range.begin + selection.text.length;
        }

        return range;
    };
})($);
