Feature: Settings appearance
  As a visitor
  I want to change theme and save
  So that the app remembers my preference

  Scenario: Save dark theme applies to the document
    Given I open the home page
    When I navigate to "Settings" from the sidebar
    And I set the appearance theme to "Dark"
    And I save settings
    Then the document uses dark appearance
