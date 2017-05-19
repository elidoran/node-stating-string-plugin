# @stating/string-plugin
[![Build Status](https://travis-ci.org/elidoran/node-stating-string-plugin.svg?branch=master)](https://travis-ci.org/elidoran/node-stating-string-plugin)
[![Dependency Status](https://gemnasium.com/elidoran/node-stating-string-plugin.png)](https://gemnasium.com/elidoran/node-stating-string-plugin)
[![npm version](https://badge.fury.io/js/%40stating%2Fstring-plugin.svg)](http://badge.fury.io/js/%40stating%2Fstring-plugin)
[![Coverage Status](https://coveralls.io/repos/github/elidoran/node-stating-string-plugin/badge.svg?branch=master)](https://coveralls.io/github/elidoran/node-stating-string-plugin?branch=master)

Build nodes for [stating](https://www.npmjs.com/package/stating) which match an exact string


## Install

```sh
npm install --save @stating/string-plugin
```


## Usage

```javascript
// returns a builder function
var buildBuilder = require('@stating/builder')

// build a new builder to add plugins to and use
var builder = buildBuilder()

// add this plugin
builder.use('@stating/string-plugin')

// now build a node to match the word "true"
var trueNode = builder.string('true')

// trueNode is a function which will wait for 4 bytes of input
// and then test if the next 4 bytes equals 'true'.
// it will control.fail() if it's not.
// it will control.next() if it is.

// add it to your stating instance:
stating.add('true', trueNode)

// create others and add them...
```


## Custom Success

When the node matches it increments `index` and calls `control.next()`.

Customize what it does by providing a function:

```javascript
var trueNode = builder.string('true', function() {
  this.someContextFunction()
  this.index = this.index + 4
  control.next(N.someNode, N.anotherNode)
})

stating.add('true', trueNode)
```

The contents of your function are inserted into the generated node function's "else" statement reached upon a successful match. Use the usual stating node args `control`, `N`, `context`.

Note, you must call `control.next()` with or without nodes to properly advance.

If you're going to test your success function then specify the standard stating parameters in the function declaration: `function(control, N, context)`. Up to you. The code is placed into another function so, for example, `control` is already defined there.


## Debugging Breakpoint

To add a debugging breakpoint simply wrap the function and set a breakpoint.

```javascript
function wrappedTrueNode(control, N, context) {
  // set a breakpoint here... then step into trueNode.
  trueNode.call(context, control, N, context)  
}
```


# [MIT License](LICENSE)
