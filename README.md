# jQuery.autocompleter

Easy-to-use jquery plugin for autocompletion.

### Usage example

jQuery.autocompleter can be attached to any text input. It clones most of styles from input (especially it's size). 

````bash
<input type="text" id="company-autocompleter" name="data_array[]" placeholder="Company name..." />

$('#company-autocompleter').autocompleter();
````

### Options

Each option should be defined as HTML attribute of input element, on which autocompleter is initialized. Options are allowed to be mixed.

#####data-ajax-url (default: false)

Url to AJAX data provider, which is used for suggestions generation.

````bash
<input type="text" name="data_array[]" id="company-autocompleter" data-ajax-url="data_provider.json?query=" />
````

#####data-custom-items (default: false)

Allows selecting custom suggestions (outside of AJAX suggestions list).

````bash
<input type="text" id="company-autocompleter" name="data_array[]" data-custom-items="true" />
````

#####data-unique-items (default: false)

Prevents selected items from duplicating.

````bash
<input type="text" id="company-autocompleter" name="data_array[]" data-unique-items="true" />
````

#####data-single-item (default: false)

Allows only one item to be selected at a time.

````bash
<input type="text" id="company-autocompleter" name="data_array[]" data-single-item="true" />
````

#####data-min-characters (default: 2)

Minimum amount of characters needed to be provided to input to initialize AJAX request.

````bash
<input type="text" id="company-autocompleter" name="data_array[]" data-min-characters="5" />
````

#####data-max-suggestions (default: 10)

Maximum amount of suggestions displayed on a list.

````bash
<input type="text" id="company-autocompleter" name="data_array[]" data-max-suggestions="5" />
````

#####data-separators (default: [])

Array of characters which when pressed makes focused suggestion selected.

````bash
<input type="text" id="company-autocompleter" name="data_array[]" data-separators="[',', ' ']" />
````

#####data-selected-items (default: false)

Array of objects which are inserted into autocompleter when initialized.

````bash
<input type="text" id="company-autocompleter" name="data_array[]" data-selected-items="[{label: 'Item 1', value: 'item_1'}, {label: 'Item 2', value: 'item_2'}]" />
````


### Events

Each event is triggered on HTML input element, on which autocompleter is initialized.


#####json-update.autocompleter (event, json)

Triggered when AJAX request is finished with 200 status. Can be used for response JSON parsing.

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
}

$('#company-autocompleter').on('json-update.autocompleter', jsonUpdateHandler);
````

#####item-add.autocompleter (event, $item)

Triggered when item is added to selected items list.

````bash
function itemAddHandler(event, $item) {
    console.log('Item was added: ' + $item.data('label'))
}

$('#company-autocompleter').on('item-add.autocompleter', itemAddHandler);
````

#####item-remove.autocompleter (event, $item)

Triggered when item is removed from selected items list.

````bash
function itemRemoveHandler(event, $item) {
    console.log('Item was removed: ' + $item.data('label'))
}

$('#company-autocompleter').on('item-remove.autocompleter', itemRemoveHandler);
````

#####item-focus.autocompleter (event, $item)

Triggered when item on selected items list is focused.

````bash
function itemFocusHandler(event, $item) {
    console.log('Item was focused: ' + $item.data('label'))
}

$('#company-autocompleter').on('item-focus.autocompleter', itemFocusHandler);
````

#####input-blur.autocompleter (event)

Triggered when autocompleter widget is blurred.

````bash
function inputBlurHandler(event, $item) {
    console.log('Autocompleter was blurred')
}

$('#company-autocompleter').on('input-blur.autocompleter', inputBlurHandler);
````

#####input-clear.autocompleter (event)

Triggered when autocompleter input is cleared.

````bash
function inputClearHandler(event) {
    console.log('Input was cleared')
}

$('#company-autocompleter').on('input-clear.autocompleter', inputClearHandler);
````

### Methods

Each method should be called on HTML input element, on which autocompleter is initialized.


#####build()

Builds particular widget instance

````bash
$('#company-autocompleter').autocompleter('build');
````

#####refresh()

Rebuilds particular widget instance.

````bash
$('#company-autocompleter').autocompleter('refresh');
````

#####destroy()

Destroys particular widget instance.

````bash
$('#company-autocompleter').autocompleter('destroy');
````

#####itemAdd(item)

Add specified item to the items list.

````bash
$('#company-autocompleter').autocompleter('itemAdd', {label: 'Item 1', value: 'item_1'});
````

#####itemRemove(item)

Remove specified item from the items list.

````bash
$('#company-autocompleter').autocompleter('itemRemove', {label: 'Item 1', value: 'item_1'});
````

#####getValues()

Get values of chosen items.

````bash
$('#company-autocompleter').autocompleter('getValues');
````

#####getTypedText()

Get text typed into text input field.

````bash
$('#company-autocompleter').autocompleter('getTypedText');
````

#####clear()

Clear autocompleter widget from chosen items.

````bash
$('#company-autocompleter').autocompleter('clear');
````

#####disable()

Disable autocompleter widget

````bash
$('#company-autocompleter').autocompleter('getTypedText');
````

#####enable()

Enable autocompleter widget

````bash
$('#company-autocompleter').autocompleter('enable');
````