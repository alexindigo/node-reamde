# Reamde [![Build Status](https://travis-ci.org/alexindigo/node-reamde.svg?branch=master)](https://travis-ci.org/alexindigo/node-reamde) [![Dependency Status](https://david-dm.org/alexindigo/node-reamde.svg?style=flat)](https://david-dm.org/alexindigo/node-reamde)

Strips javascript code blocks out of README (or any other markdown) files and converts them into function objects.

## Examples

### Basic

```javascript
var fs       = require('fs')
  , reamde   = require('reamde')
  , examples = reamde(fs.readFileSync('./README.md', 'utf-8'))
  ;

console.log(examples);
// -> outputs list of function objects

```

File `README.md` contains following:

    ### Basic:

    ```javascript
    var fs       = require('fs')
      , reamde   = require('reamde')
      , examples = reamde(fs.readFileSync('./README.md', 'utf-8'))
      ;

    console.log(examples);
    // -> outputs list of function objects

    ```


### Non-Runnable Example

```
$ echo "This code block won't be converted into a function"
This code block won't be converted into a function
$
```

File `README.md` contains following:

    ### Not runnable example:

    ```
    $ echo "This code block won't be converted into a function"
    This code block won't be converted into a function
    $
    ```

### Replacements

Reamde accepts list of pattern-replacement pairs that will be converted into global RegExps and run against function body. Replacement could be string or object, in the latter case randomly generated id will be used as replacement within function body and the object will be passed as function call argument.

```javascript
var fs      = require('fs')
  , reamde  = require('reamde')
  , content = fs.readFileSync('./README.md', 'utf-8')
  , examples
  ;

examples = reamde(content, {replace:
{
  'require(\'reamde\')' : reamde,
  'console.log('        : 'callback('
}});

console.log(examples);
// -> outputs list of function objects

```

### Runtime Arguments

Also Reamde accepts array of runtime-populated arguments, which will be listed after replacement referenced arguments.

```javascript
var fs      = require('fs')
  , reamde  = require('reamde')
  , content = fs.readFileSync('./README.md', 'utf-8')
  , examples
  ;

function customLog(data)
{
  console.log({'data': data});
}

examples = reamde(content, {runtime: ['console'], replace: {'\'reamde\'': '\'./\''}});

// run first example with custom object,
// to get assert call instead of console.log
examples[0]({log: customLog});

```

### Require Mapping

Allows to substitute required modules from example with custom functions. Each mapping member should be a function that returns required module or its substitute. Optionally accepts `require` function as first argument, in case you have provided custom require for the examples.

```javascript
var fs      = require('fs')
  , reamde  = require('reamde')
  , content = fs.readFileSync('./README.md', 'utf-8')
  , examples
  , options
  ;

// prepare option
options =
{
  mapping: {'reamde': function(require) { return require('./'); }}
};

examples = reamde(content, options);

console.log(examples);

```

## TODO

- Don't strip 4+ spaces indentation with runnable examples.

## License

Licensed under the MIT license.
