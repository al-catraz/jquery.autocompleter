# jquery.autocompleter

Easy-to-use jquery plugin for autocompletion.

### Simplest example

````bash
<input type="text" name="data_array[]" id="company-autocompleter" placeholder="Company name..." data-autocompleter="true" />

$('input[data-autocompleter="true"]').autocompleter();
````

### HTML options

````bash
data-ajax-url="some_data_service.json"      (default: false)
data-separators="[',', ' ']"                (default: [])
data-custom-items="true"                    (default: false)
data-min-characters="5"                     (default: 2)
data-max-suggestions="20"                   (default: 10)
data-unique-items="true"                    (default: false)
data-single-item="true"                     (default: false)
data-selected-items="[{label: 'Item 1', value: 'item_1'}, {label: 'Item 2', value: 'item_2'}]"                             (default: false)
````

### JavaScript events

````bash
function jsonUpdateHandler(event, json) {
    var $autocompleter = $(event.target).next(),
        suggestions = [];

    for (var i = 0; i < json.length; i++) {
        suggestions.push({
            label: json[i].name,
            value: json[i].id
        });
    }

    $autocompleter.data('suggestions', suggestions);

    console.log('json updated', suggestions);
}

function itemAddHandler(event, item) {
    console.log('item added', item)
}

function itemRemoveHandler(event, item) {
    console.log('item removed', item)
}

function inputBlurHandler(event) {
    console.log('input blurred');
}

function inputClearHandler(event) {
    console.log('input cleared');
}

function itemFocusHandler(event, item) {
    console.log('item focused', item);
}

$('input[data-autocompleter="true"]').on('json-update.autocompleter', jsonUpdateHandler)
                                     .on('item-add.autocompleter', itemAddHandler)
                                     .on('item-remove.autocompleter', itemRemoveHandler)
                                     .on('item-focus.autocompleter', itemFocusHandler)
                                     .on('input-blur.autocompleter', inputBlurHandler)
                                     .on('input-clear.autocompleter', inputClearHandler);
                                
````