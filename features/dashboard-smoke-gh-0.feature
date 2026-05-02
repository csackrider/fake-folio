Feature: Dashboard smoke
  As a visitor
  I want the dashboard to load
  So that I can use FakeFolio

  @smoke
  Scenario: Home dashboard loads
    Given I open the home page
    Then I see the dashboard root
    And I see the heading "Dashboard"
