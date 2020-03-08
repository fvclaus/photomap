"use strict"

define(["./RouterState"],
  function (RouterState) {
    describe("RouterState", function () {
      var routerState

      afterEach(function () {
        if (routerState) {
          routerState.destroy()
        }
      });

      [
        ["#!foo=2&bar=2", {
          foo: "2",
          bar: "2"
        }],
        ["", {

        }]
      ].forEach(function (testDefinition) {
        it("should parse '" + testDefinition[0] + "'", function () {
          routerState = new RouterState(null)
          var state = routerState._parseState(testDefinition[0])
          expect(state).toEqual(testDefinition[1])
        })
      });

      [
        [{
          foo: 2,
          bar: 2
        }, "#!foo=2&bar=2"],
        [{}, "#!"]
      ].forEach(function (testDefinition) {
        it("should serialize '" + JSON.stringify(testDefinition[0], null, 2) + "'", function () {
          routerState = new RouterState(null)
          var serializedState = routerState._serializeState(testDefinition[0])
          expect(serializedState).toEqual(testDefinition[1])
        })
      })

      it("should replace window state", function (done) {
        routerState = new RouterState(null)
        var replaceState = window.history.replaceState
        try {
          // eslint-disable-next-line no-unused-vars
          window.history.replaceState = function (state, title, hash) {
            expect(state).toEqual({
              foo: 2
            })
            expect(hash).toEqual("#!foo=2")
            done()
          }
          routerState.update({
            foo: 2
          })
        } finally {
          window.history.repace = replaceState
        }
      })

      it("should trigger state update", function (done) {
        routerState = new RouterState({
          foo: function (foo) {
            expect(foo).toEqual(2)
            done()
          }
        })
        routerState.loadState({
          foo: 2
        })
      })
    })
  })
