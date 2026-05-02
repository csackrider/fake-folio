Feature: Sidebar navigation
  As a visitor
  I want to move between main sections
  So that I can use every area of the app

  @smoke
  Scenario Outline: Each nav item shows the correct main heading
    Given I open the home page
    When I navigate to "<Nav>" from the sidebar
    Then I see the page title "<Title>" in the main content

    Examples:
      | Nav          | Title        |
      | Home         | Dashboard    |
      | Recurring    | Recurring    |
      | Budget       | Budget       |
      | Goals        | Goals        |
      | Net Worth    | Net Worth    |
      | Splits       | Splits       |
      | Activity     | Activity     |
      | Insights     | Insights     |
      | Month Review | Month Review |
      | Settings     | Settings     |
