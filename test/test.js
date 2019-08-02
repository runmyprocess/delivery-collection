/*
Master test suite file that will include all tests in the specified directory.

var context = require.context('./test', true, /\.js$/);
context.keys().forEach(context);
module.exports = context;
*/

/*
let expect = chai.expect
let should = chai.should()
let assert = chai.assert
*/

import chai from 'chai'
import * as date from '../src/js/mod/date'
import * as string from '../src/js/mod/string'

// http://www.albertgao.xyz/2016/12/09/testing-via-mocha-and-chai-in-es5-and-es6/

describe('string', function () {
  describe('isEmpty', function () {
    it('should return true when the value is undefined', function () {
      chai.assert.equal(true, string.isEmpty(undefined))
    })
    it('should return true when the value is null', function () {
      chai.assert.equal(true, string.isEmpty(null))
    })
    it('should return true when the value is NaN', function () {
      chai.assert.equal(true, string.isEmpty(NaN))
    })
    it('should return true when the value is false', function () {
      chai.assert.equal(true, string.isEmpty(false))
    })
    it('should return true when the value is 0', function () {
      chai.assert.equal(true, string.isEmpty(0))
    })
    it('should return true when the value is ""', function () {
      chai.assert.equal(true, string.isEmpty(''))
    })
    it('should return false when the value is "Hello"', function () {
      chai.assert.equal(false, string.isEmpty('Hello'))
    })
    it('should return false when the value is 25', function () {
      chai.assert.equal(false, string.isEmpty(25))
    })
  })
})

describe('date', function () {
  describe('isFuture', function () {
    it('should return true when the value is 2050-11-31', function () {
      chai.assert.equal(true, date.isFuture(new Date(2050, 12, 31)))
    })
    it('should return false when the value is 2014-01-01', function () {
      chai.assert.equal(false, date.isFuture(new Date(2014, 1, 1)))
    })
  })
})
