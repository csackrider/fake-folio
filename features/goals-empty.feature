Feature: Goals empty state
  As a visitor with no goals yet
  I want to see a clear empty state
  So that I know how to create a goal

  Scenario: No goals shows empty state copy
    Given I have cleared saved goals from storage
    And I open the home page
    When I navigate to "Goals" from the sidebar
    Then I see the page title "Goals" in the main content
    And I see the goals empty state
