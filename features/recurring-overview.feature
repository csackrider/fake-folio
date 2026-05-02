Feature: Recurring overview
  As a visitor
  I want to see recurring charges
  So that I can review subscriptions and bills

  Scenario: Seeded data shows active recurring section
    Given I open the home page
    When I navigate to "Recurring" from the sidebar
    Then I see the page title "Recurring" in the main content
    And I see recurring seed merchant "Property Management Co."
