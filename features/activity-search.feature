Feature: Activity search
  As a visitor
  I want to filter transactions
  So that I can find a merchant quickly

  Scenario: Search finds a seeded recurring merchant
    Given I open the home page
    When I navigate to "Activity" from the sidebar
    And I search activity for "Electric Company"
    Then I see activity row containing "Electric Company"
