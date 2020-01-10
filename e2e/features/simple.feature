Feature: Task List

    @run
    Scenario: Basic Scenario
        Given I launch the application
        And You should eventually see page heading "tAsK list"
        Then Fill in task name field with "Task 1"
        When Click the "Create" button
        Then You should eventually see task 1 with description "Task 1"

    @done @run
    Scenario: Basic Scenario 2
        Given I launch the application
        And You should eventually see page heading "tAsK list"
        Then Fill in task name field with "Task 2"
        When Click the "Create" button
        Then You should eventually see a task with description "Task 2"    
       