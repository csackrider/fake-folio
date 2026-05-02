Feature: Budget overview
  As a visitor
  I want to see my budget categories
  So that I can track allocations

  Scenario: Default seeded categories are visible
    Given I open the home page
    When I navigate to "Budget" from the sidebar
    Then I see the page title "Budget" in the main content
    And I see default budget category "Rent / Mortgage" in the main content
