"use strict"

define(["./CarouselAnimation",
  "../tests/loadTestEnv!"],
function (CarouselAnimation, TestEnv) {
  [{
    name: " with transform: translate(-50%, -50%)",
    containerId: "-transform"
  }, {
    name: " with display: flex",
    containerId: "-flex"
  }].forEach(function (specDefinition) {
    describe("CarouselAnimation " + specDefinition.name, function () {
      var $item
      var $loader
      var animation
      var interval

      beforeEach(function () {
        var $container = new TestEnv().append($("<div id='CarouselAnimation" + specDefinition.containerId + "'><span class='mp-carousel-animation-loader' /><span class='mp-carousel-animation-item' /></div>"))
        $item = $container.find(".mp-carousel-animation-item")
        $loader = $container.find(".mp-carousel-animation-loader")
        animation = new CarouselAnimation({
          items: $item,
          loader: $loader
        })
      })

      afterEach(function () {
        clearInterval(interval)
      })

      var registerCompInterval = function ($item, valueFn, compareFn) {
        var previousValue = valueFn($item)
        interval = setInterval(function () {
          var currentValue = valueFn($item)
          compareFn(currentValue, previousValue)
          previousValue = currentValue
        }, 0)
        return interval
      }

      var isDecreasing = function (currentValue, previousValue, step) {
        var difference = previousValue - currentValue
        return difference > 0 && difference < step
      }

      var isIncreasing = function (currentValue, previousValue, step) {
        return isDecreasing(previousValue, currentValue, step)
      };

      [{
        animation: "fade",
        animationTime: 500,
        checkAnimationStep: 0.1,
        checkAnimationValueFn: function ($item) {
          return $item.css("opacity")
        }
      },
      {
        animation: "flip",
        animationTime: 500,
        checkAnimationStep: 10,
        checkAnimationValueFn: function ($item) {
          return $item.get(0).getBoundingClientRect().width
        }
      }
      ].forEach(function (testDefinition) {
        [
          {
            name: "in",
            checkAnimationFn: isIncreasing,
            prepareFn: function (animationName, $item) {
              if (animationName === "flip") {
                animation._scaleX($item, 0)
              } else if (animationName === "fade") {
                animation._opacity($item, 0)
              }
              $item
                .removeAttr("src")
                .hide()
            }
          },
          {
            name: "out",
            checkAnimationFn: isDecreasing,
            prepareFn: function (animationName, $item) {
              $item
                .show()
            }
          }
        ].forEach(function (direction) {
          it("should " + testDefinition.animation + " " + direction.name, function (done) {
            animation.options.animationTime = testDefinition.animationTime

            var numberOfTicksAnimated = 0
            var checkAnimationInterval = registerCompInterval($item, testDefinition.checkAnimationValueFn,
              function (currentValue, previousValue) {
              // Check that it is actually animated (interpolated)
                if (direction.checkAnimationFn(currentValue, previousValue, testDefinition.checkAnimationStep)) {
                  numberOfTicksAnimated++
                }
              })
            direction.prepareFn(testDefinition.animation, $item)
            var animationFnName = testDefinition.animation + direction.name[0].toUpperCase() + direction.name.slice(1)
            animation[animationFnName](function () {
              clearInterval(checkAnimationInterval)
              expect(numberOfTicksAnimated).toBeGreaterThan(0)
              if (direction === "in") {
                expect($item).toBeHidden()
                expect($loader).toBeVisible()
              } else if (direction === "out") {
                expect($item).toBeVisible()
                expect($loader).toBeHidden()
              }
              done()
            })
          })
        })
      })
    })
  })
})
