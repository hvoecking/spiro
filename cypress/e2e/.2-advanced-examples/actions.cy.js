
  // xit(".type() - type into a DOM element", () => {
  //   // https://on.cypress.io/type
  //   cy.get(".action-email")
  //     .type("fake@email.com").should("have.value", "fake@email.com")

  //     // .type() with special character sequences
  //     .type("{leftarrow}{rightarrow}{uparrow}{downarrow}")
  //     .type("{del}{selectall}{backspace}")

  //     // .type() with key modifiers
  //     .type("{alt}{option}") //these are equivalent
  //     .type("{ctrl}{control}") //these are equivalent
  //     .type("{meta}{command}{cmd}") //these are equivalent
  //     .type("{shift}")

  //     // Delay each keypress by 0.1 sec
  //     .type("slow.typing@email.com", { delay: 100 })
  //     .should("have.value", "slow.typing@email.com")

  //   cy.get(".action-disabled")
  //     // Ignore error checking prior to type
  //     // like whether the input is visible or disabled
  //     .type("disabled error checking", { force: true })
  //     .should("have.value", "disabled error checking")
  // })

  // xit(".focus() - focus on a DOM element", () => {
  //   // https://on.cypress.io/focus
  //   cy.get(".action-focus").focus()
  //     .should("have.class", "focus")
  //     .prev().should("have.attr", "style", "color: orange;")
  // })

  // xit(".blur() - blur off a DOM element", () => {
  //   // https://on.cypress.io/blur
  //   cy.get(".action-blur").type("About to blur").blur()
  //     .should("have.class", "error")
  //     .prev().should("have.attr", "style", "color: red;")
  // })

  // xit(".clear() - clears an input or textarea element", () => {
  //   // https://on.cypress.io/clear
  //   cy.get(".action-clear").type("Clear this text")
  //     .should("have.value", "Clear this text")
  //     .clear()
  //     .should("have.value", "")
  // })

  // xit(".submit() - submit a form", () => {
  //   // https://on.cypress.io/submit
  //   cy.get(".action-form")
  //     .find("[type='text']").type("HALFOFF")

  //   cy.get(".action-form").submit()
  //     .next().should("contain", "Your form has been submitted!")
  // })

//   xit(".rightclick() - right click on a DOM element", () => {
//     // https://on.cypress.io/rightclick

//     // Our app has a listener on "contextmenu" event in our "scripts.js"
//     // that hides the div and shows an input on right click
//     cy.get(".rightclick-action-div").rightclick().should("not.be.visible")
//     cy.get(".rightclick-action-input-hidden").should("be.visible")
//   })

//   xit(".check() - check a checkbox or radio element", () => {
//     // https://on.cypress.io/check

//     // By default, .check() will check all
//     // matching checkbox or radio elements in succession, one after another
//     cy.get(".action-checkboxes [type='checkbox']").not("[disabled]")
//       .check().should("be.checked")

//     cy.get(".action-radios [type='radio']").not("[disabled]")
//       .check().should("be.checked")

//     // .check() accepts a value argument
//     cy.get(".action-radios [type='radio']")
//       .check("radio1").should("be.checked")

//     // .check() accepts an array of values
//     cy.get(".action-multiple-checkboxes [type='checkbox']")
//       .check(["checkbox1", "checkbox2"]).should("be.checked")

//     // Ignore error checking prior to checking
//     cy.get(".action-checkboxes [disabled]")
//       .check({ force: true }).should("be.checked")

//     cy.get(".action-radios [type='radio']")
//       .check("radio3", { force: true }).should("be.checked")
//   })

//   xit(".uncheck() - uncheck a checkbox element", () => {
//     // https://on.cypress.io/uncheck

//     // By default, .uncheck() will uncheck all matching
//     // checkbox elements in succession, one after another
//     cy.get(".action-check [type='checkbox']")
//       .not("[disabled]")
//       .uncheck().should("not.be.checked")

//     // .uncheck() accepts a value argument
//     cy.get(".action-check [type='checkbox']")
//       .check("checkbox1")
//       .uncheck("checkbox1").should("not.be.checked")

//     // .uncheck() accepts an array of values
//     cy.get(".action-check [type='checkbox']")
//       .check(["checkbox1", "checkbox3"])
//       .uncheck(["checkbox1", "checkbox3"]).should("not.be.checked")

//     // Ignore error checking prior to unchecking
//     cy.get(".action-check [disabled]")
//       .uncheck({ force: true }).should("not.be.checked")
//   })

//   xit(".select() - select an option in a <select> element", () => {
//     // https://on.cypress.io/select

//     // at first, no option should be selected
//     cy.get(".action-select")
//       .should("have.value", "--Select a fruit--")

//     // Select option(s) with matching text content
//     cy.get(".action-select").select("apples")
//     // confirm the apples were selected
//     // note that each value starts with "fr-" in our HTML
//     cy.get(".action-select").should("have.value", "fr-apples")

//     cy.get(".action-select-multiple")
//       .select(["apples", "oranges", "bananas"])
//       // when getting multiple values, invoke "val" method first
//       .invoke("val")
//       .should("deep.equal", ["fr-apples", "fr-oranges", "fr-bananas"])

//     // Select option(s) with matching value
//     cy.get(".action-select").select("fr-bananas")
//       // can attach an assertion right away to the element
//       .should("have.value", "fr-bananas")

//     cy.get(".action-select-multiple")
//       .select(["fr-apples", "fr-oranges", "fr-bananas"])
//       .invoke("val")
//       .should("deep.equal", ["fr-apples", "fr-oranges", "fr-bananas"])

//     // assert the selected values include oranges
//     cy.get(".action-select-multiple")
//       .invoke("val").should("include", "fr-oranges")
//   })

//   xit(".scrollIntoView() - scroll an element into view", () => {
//     // https://on.cypress.io/scrollintoview

//     // normally all of these buttons are hidden,
//     // because they"re not within
//     // the viewable area of their parent
//     // (we need to scroll to see them)
//     cy.get("#scroll-horizontal button")
//       .should("not.be.visible")

//     // scroll the button into view, as if the user had scrolled
//     cy.get("#scroll-horizontal button").scrollIntoView()
//       .should("be.visible")

//     cy.get("#scroll-vertical button")
//       .should("not.be.visible")

//     // Cypress handles the scroll direction needed
//     cy.get("#scroll-vertical button").scrollIntoView()
//       .should("be.visible")

//     cy.get("#scroll-both button")
//       .should("not.be.visible")

//     // Cypress knows to scroll to the right and down
//     cy.get("#scroll-both button").scrollIntoView()
//       .should("be.visible")
//   })

//   xit(".trigger() - trigger an event on a DOM element", () => {
//     // https://on.cypress.io/trigger

//     // To interact with a range input (slider)
//     // we need to set its value & trigger the
//     // event to signal it changed

//     // Here, we invoke jQuery's val() method to set
//     // the value and trigger the "change" event
//     cy.get(".trigger-input-range")
//       .invoke("val", 25)
//       .trigger("change")
//       .get("input[type=range]").siblings("p")
//       .should("have.text", "25")
//   })

//   xit("cy.scrollTo() - scroll the window or element to a position", () => {
//     // https://on.cypress.io/scrollto

//     // You can scroll to 9 specific positions of an element:
//     //  -----------------------------------
//     // | topLeft        top       topRight |
//     // |                                   |
//     // |                                   |
//     // |                                   |
//     // | left          center        right |
//     // |                                   |
//     // |                                   |
//     // |                                   |
//     // | bottomLeft   bottom   bottomRight |
//     //  -----------------------------------

//     // if you chain .scrollTo() off of cy, we will
//     // scroll the entire window
//     cy.scrollTo("bottom")

//     cy.get("#scrollable-horizontal").scrollTo("right")

//     // or you can scroll to a specific coordinate:
//     // (x axis, y axis) in pixels
//     cy.get("#scrollable-vertical").scrollTo(250, 250)

//     // or you can scroll to a specific percentage
//     // of the (width, height) of the element
//     cy.get("#scrollable-both").scrollTo("75%", "25%")

//     // control the easing of the scroll (default is "swing")
//     cy.get("#scrollable-vertical").scrollTo("center", { easing: "linear" })

//     // control the duration of the scroll (in ms)
//     cy.get("#scrollable-both").scrollTo("center", { duration: 2000 })
//   })
