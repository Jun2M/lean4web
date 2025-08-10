describe('Code pane minimum width for 100 characters', () => {
  it('keeps the code pane wide enough on desktop', () => {
    // Desktop-like viewport
    cy.viewport(1280, 900)
    cy.visit('/')

    // Wait for monaco to be present (a view-line appears)
    cy.get('div.view-lines').should('exist')

    // Assert the code pane (left) keeps a reasonable minimum width.
    // Exact pixel requirement varies by font/OS; 800px is a conservative floor
    // for 100 halfwidth chars plus gutters.
    cy.get('.codeview-wrapper').invoke('width').should('be.gte', 800)

    // Dragging should not allow shrinking below the minimum
    // (Attempt a small drag and re-assert)
    cy.get('.gutter').trigger('mousedown', { which: 1, pageX: 700, pageY: 200 })
    cy.get('body').trigger('mousemove', { pageX: 600, pageY: 200 })
    cy.get('body').trigger('mouseup')

    cy.get('.codeview-wrapper').invoke('width').should('be.gte', 800)
  })
})