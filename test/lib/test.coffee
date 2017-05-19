assert = require 'assert'

plugin = require '../../lib/index.js'
target = {}

describe 'test plugin', ->

  it 'should set string() on target', ->
    plugin null, target
    assert target.string
    assert.equal typeof(target.string), 'function'

  it 'should set test() on target', ->
    target.test = target.string 'test'
    assert target.test
    assert.equal typeof(target.test), 'function'

  [
    ['', 'wait']
    ['t', 'wait']
    ['te', 'wait']
    ['tes', 'wait']
    ['test', 'next']
    ['testing', 'next']
    ['tesX', 'fail', 3]
    ['teXt', 'fail', 2]
    ['tXst', 'fail', 1]
    ['Xest', 'fail', 0]
  ].forEach (test) ->

    [string, resultType, index] = test

    called = calledError = calledDetails = null
    control =
      next: -> called = 'next'
      wait: -> called = 'wait'
      fail: (error, details) ->
        calledError = error
        calledDetails = details
        called = 'fail'

    switch resultType

      when 'wait'
        it 'should wait for more bytes: \'' + string + '\'', ->

          context = input: string, index: 0

          result = target.test.call context, control

          assert.equal context.index, 0, 'shouldnt increment'
          assert.equal called, 'wait'

      when 'next'
        it 'should call next for: \'' + string + '\'', ->

          context = input: string, index: 0

          result = target.test.call context, control

          assert.equal context.index, 4, 'should increment'
          assert.equal called, 'next'

      when 'fail'
        it 'should call fail for: \'' + string + '\'', ->

          context = input: string, index: 0

          result = target.test.call context, control

          assert.equal context.index, 0, 'shouldnt increment'
          assert.equal called, 'fail'
          assert.equal calledError, 'input mismatch'
          assert.deepEqual calledDetails,
            expected: 'test'
            actual: string
            at: index


  it 'should use success function\'s code upon success', ->

    thing = {}
    plugin {}, thing

    # this will be parsed and placed into the generated node function
    # in the success block after `control.next()`
    success = (control) ->
      @to @index + 4
      @value = true
      control.next()
      return

    node = thing.string 'true', success

    context =
      input: 'a true test'
      index: 2
      to: (n) -> @index = n

    next = false
    control = next: -> next = true

    node.call context, control

    assert.equal context.index, 6
    assert.equal context.value, true
    assert.equal next, true
