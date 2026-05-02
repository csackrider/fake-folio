Feature: Insights Splits Net Worth Month Review smoke
  As a visitor
  I want core analytics pages to load
  So that I can explore reports safely

  Scenario: Insights loads
    Given I open the home page
    When I navigate to "Insights" from the sidebar
    Then I see the page title "Insights" in the main content

  Scenario: Splits loads
    Given I open the home page
    When I navigate to "Splits" from the sidebar
    Then I see the page title "Splits" in the main content

  Scenario: Net Worth loads
    Given I open the home page
    When I navigate to "Net Worth" from the sidebar
    Then I see the page title "Net Worth" in the main content

  Scenario: Month Review loads
    Given I open the home page
    When I navigate to "Month Review" from the sidebar
    Then I see the page title "Month Review" in the main content
