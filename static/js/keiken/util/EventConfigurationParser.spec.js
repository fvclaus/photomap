"use strict"

define([
  "./EventConfigurationParser"
],
function (EventConfigurationParser) {
  describe("EventConfigurationParser", function () {
    var parser = new EventConfigurationParser()

    function noop () {};

    [
      {
        args: ["click:Gallery"],
        expected: /InvalidInputError/
      },
      {
        args: ["click:Gallery", "Wrong type"],
        expected: /InvalidInputError/
      },
      {
        args: [":Gallery", noop],
        expected: /InvalidEventSyntax/
      },
      {
        args: ["click", noop],
        expected: /InvalidEventSyntax/
      },
      {
        args: ["clickGallery", noop],
        expected: /InvalidEventSyntax/
      },
      {
        args: ["click:Gal:lery", noop],
        expected: /InvalidEventSyntax/
      },
      {
        args: ["click:", noop],
        expected: /InvalidEventSyntax/
      },
      {
        args: [{
          click: noop
        }, "Galle:ry"],
        expected: /InvalidEventSyntax/
      },
      {
        args: [{
          "cl:ck": noop
        }, "Gallery"],
        expected: /InvalidEventSyntax/
      },
      {
        args: [{
          click: "Wrong handler type"
        }, "Gallery"],
        expected: /InvalidInputError/
      },
      {
        args: [{
          click: "Wrong handler type"
        }, "Gallery"],
        expected: /InvalidInputError/
      },
      {
        args: [{
          click: noop
        }],
        expected: /InvalidEventSyntax/
      }
    ].forEach(function (testDefinition) {
      var argsAsString = testDefinition.args
        .map(function (arg) {
          if (typeof arg === "object") {
            return "{" + Object.keys(arg).join(",") + "}"
          } else {
            return arg.toString()
          }
        })
        .join(",")
      it("should reject [" + argsAsString + "]", function () {
        expect(function () {
          parser.parse.apply(parser, testDefinition.args)
        }).toThrowError(testDefinition.expected)
      })
    })
  })
})
