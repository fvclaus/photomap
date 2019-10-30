
"use strict"

define(["../model/Model"],
  function (Model) {
    var model = null

    console.log("Inside ModelTest")
    describe("ModelTest", function () {
      model = new Model({ title: "fancy title", id: -1, type: "Person" })

      it("should throw error in setter", function () {
        expect(function () { model.set("id", 2) }).toThrow()
        expect(function () { model.set("type", "BeautifulTree") }).toThrow()
        expect(function () { model.set("prototype", null) }).toThrow()
      })
      it("should store value from setter", function () {
        // Set title
        model.set("title", "new")
        expect(model.title).toBe("new")
        model.setTitle("newnew")
        expect(model.title).toBe("newnew")
        expect(model.getTitle()).toBe("newnew")
        // Set description
        model.set("description", "new")
        expect(model.description).toBe("new")
        model.setDescription("newnew")
        expect(model.description).toBe("newnew")
        expect(model.getDescription()).toBe("newnew")
      })

      it("should return initial values", function () {
        // Type
        expect(model.getType()).toBe("Person")
        // Id
        console.log(model.getId())
        console.log(expect.toString())
        try {
          expect(model.getId()).toEqual(-1)
        } catch (e) {
          console.error(e)
        }
      })
    })
  })
