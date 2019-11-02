
"use strict"

define(["../model/Model", "./ModelServerTest"],
  function (Model, ModelServerTest) {
    var model = null
    var modelData = null
    var server = null

    describe("ModelTest", function () {
      beforeEach(function () {
        modelData = {
          title: "Title",
          description: "Description",
          type: "Album"
        }
        model = new Model(modelData)
        server = new ModelServerTest()
      })

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
        expect(model.getType()).toBe("Album")
        // Id
        console.log(model.getId())
        console.log(expect.toString())
        try {
          expect(model.getId()).toEqual(-1)
        } catch (e) {
          console.error(e)
        }
      })

      it("should trigger onInsert", function (done) {
        model.onSuccess(function (data, status, xhr) {
          expect(status).toBe("200")
        })
        model.onInsert(function (data) {
          console.log("data", data)
          expect(data.title).toBe("Title")
          expect(data.description).toBe("Description")
          expect(data.id).toBe(1)
          done()
        })

        server.simulateInsert(model, modelData, "/album/")
      })

      it("should trigger onFailure", function (done) {
        model.onFailure(function (data, status, xhr) {
          expect(status).toBe("200")
          expect(typeof data.success === "boolean" && !data.success).toBeTruthy()
          done()
        })

        server.simulateFailure(model, modelData, "/album/")
      })

      it("should trigger onError", function (done) {
        model.onError(function (xhr, status, error) {
          expect(status).toBe("500")
          expect(error).toBe("Something went wrong.")
          done()
        })

        server.simulateError(model, modelData, "/album/")
      })

      it("should trigger onUpdate", function (done) {
        model.id = 5
        model.onSuccess(function (data, status, xhr) {
          expect(status).toBe("200")
        })
        model.onUpdate(function (data) {
          console.log("data", data)
          expect(data.title).toBe("New Title")
          expect(data.description).toBe("Description")
          expect(data.id).toBe(5)
          done()
        })

        server.simulateInsert(model, {
          title: "New Title"
        }, "/album/5/")
      })
    })
  })
