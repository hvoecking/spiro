/* eslint-disable no-undef */
/// <reference types="cypress" />

import "cypress-real-events";

context("Actions", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/?test=true");

    cy.window().then((win) => {
      // Override or alter JavaScript functions responsible for delays and animations
      win.someDelayFunction = () => {};

      // Or directly alter CSS properties responsible for animations
      cy.document().then((doc) => {
        const style = doc.createElement("style");
        style.innerHTML = `
          * {
            transition-duration: 0s !important;
            animation-duration: 0s !important;
          }
        `;
        doc.head.appendChild(style);
      });
    });
  });

  afterEach(() => {
    cy.window().then((win) => {
      win.stopAnimation = true;
    });
    cy.get("body").invoke("remove");
  });

  // // https://on.cypress.io/interacting-with-elements

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

  it("should copy with popup on share", () => {
    // Given the simulation is running
    cy.get(".spiro-share-button").should("be.visible");
    cy.get("[data-test-id='primary-share-button-icon']").should("be.visible");
    cy.get("[data-test-id='primary-share-button-popup']").should("not.be.visible");

    // When I click on the share button
    cy.get("[data-test-id='primary-share-button-icon']").realClick({ force: true });

    // Then the share popup should be visible
    cy.get("[data-test-id='primary-share-button-popup']").should("be.visible");
  });

  // TODO:  If these components evolve independently or tests should rather be run on
  // individual components frequently, then divide this test into multiple tests
  it("should close open components when clicking the canvas", () => {
    // Given the components are open
    cy.get("[data-test-id='side-menu']").should("have.class", "-translate-x-full");
    cy.get("[data-test-id='settings']").click({force: true});
    cy.get("[data-test-id='side-menu']").should("have.class", "translate-x-0");

    cy.get("[data-test-id='seed']").should("have.class", "translate-y-full");
    cy.get("[data-test-id='eject']").click();
    cy.get("[data-test-id='seed']").should("not.have.class", "translate-y-full");

    cy.get("[data-test-id='about']").should("not.be.visible");
    cy.get("[data-test-id='info']").click();
    cy.get("[data-test-id='about']").should("be.visible");

    // When I click on the canvas
    cy.get("[data-test-id='canvas']").click("topRight", {force: true});

    // Then the components should be hidden again
    cy.get("[data-test-id='side-menu']").should("have.class", "-translate-x-full");
    cy.get("[data-test-id='seed']").should("have.class", "translate-y-full");
    cy.get("[data-test-id='about']").should("not.be.visible");
  });

  it("should toggle pause on canvas click", () => {
    // Given the simulation is running
    cy.get(".pause-icon").should("be.visible");

    // When I click on the canvas
    cy.get("[data-test-id='canvas']").click();

    // Then the simulation should be paused
    cy.get(".play-icon").should("be.visible");

    // When I click on the canvas again
    cy.get("[data-test-id='canvas']").click();

    // Then the simulation should be running again
    cy.get(".pause-icon").should("be.visible");
  });

  it("should toggle pause on canvas space bar down", () => {
    // Given the simulation is running
    cy.get(".pause-icon").should("be.visible");

    // When I press the space bar on the body
    cy.get("body").type(" ");

    // Then the simulation should be paused
    cy.get(".play-icon").should("be.visible");

    // When I press the space bar on the body again
    cy.get("body").type(" ");

    // Then the simulation should be running again
    cy.get(".pause-icon").should("be.visible");
  });


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
});
