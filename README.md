# jQuery.autocompleter

Easy-to-use jquery plugin for autocompletion.

### Usage example

jQuery.autocompleter can be attached to any text input and it clones most of styles from source input.

```html
<input type="text" id="company-autocompleter" name="data_array[]" placeholder="Company name..." />
```
```js
$('#company-autocompleter').autocompleter();
```

### Options

Each option should be defined as HTML attribute of input element, on which autocompleter is initialized. Options can be mixed freely.

##### data-ajax-url (default: false)

Url to AJAX data provider, which is used for suggestions generation.

```html
<input type="text" name="data_array[]" id="company-autocompleter" data-ajax-url="data_provider.json?query=" />
```

Expected output data format is:

```json
[
    {
        "label": "GoldenLine Sp. z o.o.",
        "value":"1"
    }, {
        "label":"GoldenSubmarine Sp. z o.o.",
        "value":"2"
    }
]
```

##### data-custom-items (default: false)

Allows selecting custom suggestions (outside of AJAX suggestions list).

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-custom-items="true" />
````

##### data-custom-content-prefix (default: false)

Prepends any string before custom item label.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-custom-content-prefix="Add new item - " />
````

##### data-custom-content-prefix (default: false)

Appends any string after custom item label.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-custom-content-sufix=" - add new item" />
````

##### data-unique-items (default: false)

Prevents selected items from duplicating.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-unique-items="true" />
````

##### data-single-item (default: false)

Allows only one item to be selected at a time.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-single-item="true" />
````

##### data-min-characters (default: 2)

Minimum amount of characters needed to be provided to input to initialize AJAX request.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-min-characters="5" />
````

##### data-max-suggestions (default: 10)

Maximum amount of suggestions displayed on a list.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-max-suggestions="5" />
````

##### data-max-items (default: false)

Maximum amount of chosen items.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-max-items="3" />
````

##### data-separators (default: [])

Array of characters which when pressed makes focused suggestion selected.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-separators="[',', ' ']" />
````

##### data-force-capitalize (default: false)

Forces items to be capitalized when chosen.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-force-capitalize="true" />
````

##### data-selected-items (default: false)

Array of objects which are inserted into autocompleter when initialized.

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-selected-items="[{label: 'Item 1', value: 'item_1'}, {label: 'Item 2', value: 'item_2'}]" />
````

##### data-sortable (default: false)

Allows drag & drop of chosen items. Requires `$.fn.sortable()` - https://github.com/farhadi/html5sortable

````html
<input type="text" id="company-autocompleter" name="data_array[]" data-sortable="true" />
````

### Events

Each event is triggered on HTML input element, on which autocompleter is initialized.

##### json-update.autocompleter (event, json)

Triggered when AJAX request is finished with 200 status. Can be used for response JSON parsing.

````js
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

##### item-add.autocompleter (event, $item)

Triggered when item is added to selected items list.

````js
function itemAddHandler(event, $item) {
    console.log('Item was added: ' + $item.data('label'))
}

$('#company-autocompleter').on('item-add.autocompleter', itemAddHandler);
````

##### item-remove.autocompleter (event, $item)

Triggered when item is removed from selected items list.

````js
function itemRemoveHandler(event, $item) {
    console.log('Item was removed: ' + $item.data('label'))
}

$('#company-autocompleter').on('item-remove.autocompleter', itemRemoveHandler);
````

##### item-focus.autocompleter (event, $item)

Triggered when item on selected items list is focused.

````js
function itemFocusHandler(event, $item) {
    console.log('Item was focused: ' + $item.data('label'))
}

$('#company-autocompleter').on('item-focus.autocompleter', itemFocusHandler);
````

##### input-blur.autocompleter (event)

Triggered when autocompleter widget is blurred.

````js
function inputBlurHandler(event, $item) {
    console.log('Autocompleter was blurred')
}

$('#company-autocompleter').on('input-blur.autocompleter', inputBlurHandler);
````

##### input-clear.autocompleter (event)

Triggered when autocompleter input is cleared.

````js
function inputClearHandler(event) {
    console.log('Input was cleared')
}

$('#company-autocompleter').on('input-clear.autocompleter', inputClearHandler);
````

##### item-redundant.autocompleter (event)

Triggered when chosen items max amount is exceeded.

````js
function itemRedundant() {
    console.log('You can add maximum 5 items');
}

$('#company-autocompleter').on('item-redundant.autocompleter', itemRedundantHandler);
````

### Methods

Each method should be called on HTML input element, on which autocompleter is initialized.

##### build()

Builds particular widget instance

````js
$('#company-autocompleter').autocompleter('build');
````

##### refresh()

Rebuilds particular widget instance.

````js
$('#company-autocompleter').autocompleter('refresh');
````

##### destroy()

Destroys particular widget instance.

````js
$('#company-autocompleter').autocompleter('destroy');
````

##### setInputWidth()

Recalculates autocompleter inner input width

````js
$('#company-autocompleter').autocompleter('setInputWidth');
````

##### itemAdd(item)

Add specified item to the items list.

````js
$('#company-autocompleter').autocompleter('itemAdd', {label: 'Item 1', value: 'item_1'});
````

##### itemRemove(item)

Remove specified item from the items list.

````js
$('#company-autocompleter').autocompleter('itemRemove', {label: 'Item 1', value: 'item_1'});
````

##### getValues()

Get values of chosen items.

````js
$('#company-autocompleter').autocompleter('getValues');
````

##### getTypedText()

Get text typed into text input field.

````js
$('#company-autocompleter').autocompleter('getTypedText');
````

##### clear()

Clear autocompleter widget from chosen items.

````js
$('#company-autocompleter').autocompleter('clear');
````

##### disable()

Disable autocompleter widget

````js
$('#company-autocompleter').autocompleter('disable');
````

##### enable()

Enable autocompleter widget

````js
$('#company-autocompleter').autocompleter('enable');
````
.
