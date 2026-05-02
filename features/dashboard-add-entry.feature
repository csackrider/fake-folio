Feature: Dashboard add entry
  As a visitor tracking spending
  I want to add an entry from the dashboard
  So that it appears in Activity

  Scenario: Add a one-time expense appears on Activity
    Given I open the home page
    When I add a new expense entry for merchant "E2E Coffee Stand" with amount "12.34"
    And I navigate to "Activity" from the sidebar
    Then I see activity row containing "E2E Coffee Stand"
