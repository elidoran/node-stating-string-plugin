'use strict'

// if (this.input.charCodeAt(this.index + i) !== charCode) {
//   control.fail('input mismatch', {
//     expected: string,
//     actual  : this.input.slice(this.index, this.index + bytes)
//     at      : this.index + i
//   })
// }

var ifBlock = [
  'if (this.input.charCodeAt(this.index', ') !== ', null, ') {',           // 0, 1, 2, 3
  '\n    control.fail(\'input mismatch\', {',                                // 4
  '\n      expected: \'', null, '\',',                                       // 5, 6, 7
  '\n      actual  : this.input.slice(this.index, this.index + ', null, '),',// 8, 9, 10
  '\n      at      : this.index',                                            // 11
  '\n    });', // 12
  '\n  }\n' // 13
]

function iffer(bytes, string, index) {
  var content
  // make a copy we can customize
  content = ifBlock.slice()

  // replace nulls with values
  content[2] = String(string.charCodeAt(index))
  content[6] = string
  content[9] = String(bytes)

  // add indexes and an 'else' if it's after the first one
  if (index > 0) {
    content.splice(12, 0, ' + ' + index)
    content.splice(1, 0, content[12])
    content.unshift('\n  else ')
  } else { // extra space in front of if
    content.unshift('  ')
  }

  // put it all together
  return content.join('')
}

function inner(fn) {
  var string, start, end
  string = fn.toString()
  start = string.indexOf('{')
  end = string.lastIndexOf('}')
  return string.slice(start + 1, end)
}

function string(string, success) {

  var content, i, bytes

  // TODO: check byte length, then use that in loop to support multi-byte chars
  bytes = string.length // Buffer.byteLength(string)

  // create our function and return it
  content = 'return function(control, N, context) {'

  // check if we have enough input
  content += '\nif (this.index + ' + bytes + ' <= this.input.length) {\n'

  // if + else-if chain checking for each character code in string
  for (i = 0; i < string.length; i++) {
    content += iffer(bytes, string, i)
  }

  // else it all matches so increment and next()
  content += '\n  else {'

  if (success) {
    content += inner(success)
  }

  else {
    content += 'control.next();this.index += ' + bytes + ';'
  }

  content += '}'

  // else not enough input so wait
  content += '\n} else {control.wait(\'wait for ' + bytes + ' bytes\');}'

  // our creator function is complete
  content += '}'

  // build the creator function and call it
  return new Function(content)()
}

module.exports = function stringPlugin(options, builder) {
  builder.string = string
}
