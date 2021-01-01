// will be injected into the HTML to display on screen
let display = '0';
// true if number CURRENTLY BEING ENTERED is negative
let isNegative = false;
// used exclusively to store term for repeated operations (pressing = more than once)
let memory1;
// used to store the last term while the next term is being entered. This is mostly so you can press = repeatedly
let memory2;
// used to keep track of the operation to execute when another operation or = is commanded
let lastOperator;
// used to decide if - operator toggles negative number entry or if actually 
let awaitingNextEntry = true;

// for debugging
function logState() {
  console.log('display: ' + display +
  '\nisNegative: ' + isNegative +
  '\nmemory1: ' + memory1 +
  '\nmemory2: ' + memory2 +
  '\nlastOperator: ' + lastOperator +
  '\nawaitingNextEntry: ' + awaitingNextEntry);
}

// updates the display
function updateDisplay() {
  if (isNegative) {
    document.getElementById("display").innerHTML = '-' + display;
  } else {
    document.getElementById("display").innerHTML = display;
  }
  logState();
}

//resets to defaults
function clearAndReset() {
  console.log('clearAndReset() called');
  display = '0';
  isNegative = false;
  memory1 = null;
  memory2 = null;
  lastOperator = null;
  awaitingNextEntry = true;
  updateDisplay();
}

// used when entering a digit
function addDigit(digit) {
  /*
  Handles adding digits to the current entry.
  
  Accepts only single-character param: digit(str). 
  digit may only be 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, or .
  
  Starts by reading what is in HTML element with id="display".
  Depending on what is already entered, it either adds digit(str) 
  */

  console.log('addDigit() called');

  // entering any digit will flip this to false, if it's not already false, and reset the display to 0.
  if (awaitingNextEntry) {
    display = '0';
    awaitingNextEntry = false;
  }

  // values are only stored in memory1 so that pressing = repeatedly repeats the same operation.
  // if addDigit() is called instead, then the display needs to be updated and memory1 needs to be reset.
  if (memory1 !== null) {
    memory1 = null;
  }

  // see what is already in the display
  if (display === '0' && digit !== '.') {
    if (digit === '0') {
      //do nothing - no leading chain of zeros allowed
    } else {
      //replaces 0 with the entered digit.
      display = digit;
    }
  } else if (digit === '.' && display.includes('.')) {
    //do nothing - no adding more than 1 .
  } else if (display.length < 13) {

    //concat digit to the end of the existing string
    display = display + digit;
  }
  // puts what's stored in display on screen
  updateDisplay();
}

// checks lastOperator and what is in both memories to decide what operation to execute and update memory accordingly.
function updateMemory() {

  /*
  This function reads these globals and updates them:
  display(str): the most recent number to include in calculations
  isNegative(bool): determines if most recent number is negative
  memory1(null or num): temporarily stores most recent number for  when = is used to immediately repeat an operation
  memory2(null or num): stores the running result
  lastOperation(str): determins what kind of mathematical operation to perform
  
  This function does not update the HTML to show the display. That is done with updateDisplay().
  */

  console.log('updateMemory() called');

  let firstTerm;
  let secondTerm;
  let result;

  // if there is no running result yet...
  if (memory2 === null) {
    //...what is in the display is now converted into a number and stored in memory2.
    if (isNegative) {
      memory2 = Number('-' + display);
    } else {
      memory2 = Number(display);
    }
    console.log(memory2 + ' placed in memory2');
    // do math 
  } else {
    // first term is always what's in memory2
    firstTerm = memory2;
    // memory1 will contain null unless '=' is commanded twice or more in a row
    if (memory1 === null) {
      // memory1 gets reset to null in execute() when operator other than '=' is entered or
      // if a digit is entered with addDigit().

      if (isNegative) {
        memory1 = Number('-' + display);
      } else {
        memory1 = Number(display);
      }

      // memory1 = Number(display);
      console.log(memory1 + ' stored in memory1');
    }
    secondTerm = memory1;

    if (lastOperator === '+') {
      memory2 = firstTerm + secondTerm;
    } else if (lastOperator === '-') {
      memory2 = firstTerm - secondTerm;
      console.log(firstTerm + ' - ' + secondTerm + ' = ' + memory2);
    } else if (lastOperator === '*') {
      memory2 = firstTerm * secondTerm;
    } else if (lastOperator === '/') {
      memory2 = firstTerm / secondTerm;
    }
    if (memory2.toString().length >= 13) {
      display = memory2.toFixed(10);
    } else {
      if (memory2 >= 0) {
        isNegative = false;
      }
      // absolute value because display is a string, and whether or not it should be negative is a bool. This prevents stringifying a negative sign.
      display = Math.abs(memory2);
    }
  }
}

function submitEntry() {
  // memory is updated using the lastOperation and the result is stored.
  console.log('submitEntry called');
  updateMemory();
  // show the running result
  updateDisplay();
  // entry is not negative by default.
  isNegative = false;

}

function execute(operation) {
  /* Handles calculator operations (+, -, *, /, =)
  operation is expected to be a single-charager string.
  */
  console.log('execute() called');

  // !awaitingNextEntry ==> there is a number in the display ready to be processed
  // memory2 !== null ==> there is also a number in memory2 ready to be processed
  // memory2 !== null ==> also means an operator has been selected at least once so far
  if (operation === '=' && !awaitingNextEntry && memory2 !== null) {
    submitEntry();
  } else {
    // if awaiting the next number (meaning an operatation was just commanded)...
    if (awaitingNextEntry) {
      // ...the - operator becomes a toggle to make what will be entered a negative number or not.
      if (operation === '-') {
        // toggle isNegative
        if (isNegative) {
          isNegative = false;
        } else {
          isNegative = true;
        }

        // show the change to/from a negative number input
        display = '0';
        updateDisplay();
        // ... entering +, /, or * changes the commanded operation.
        // Cannot change to - becuase - is doing something else when awaitingNextEntry.
        // if memory2 contains null, then there is nothing to perform an operation on and
        // no operation has been selected yet anyway so there's nothing to change
        // (the first time an operation is selected happens if !awaitingNextEntry).
      } else if ('+/*'.includes(operation) && memory2 !== null) {
        // if you don't pick a digit after toggling to entering a negative number, it reverts to not-negative entry.
        isNegative = false;
        display = '0';
        lastOperator = operation;
        // updateDisplay();
        logState();
      }

      // !awaitingNextEntry
    } else if ('+-/*'.includes(operation)) {

      awaitingNextEntry = true;

      // anything other than = will reset memory1 so that updateMemory() doesn't use it at the wrong time.
      if (memory1 === null) {
        submitEntry();
      }

      memory1 = null;

      // lastOperation is updated so it can be used next time.
      lastOperator = operation;
      logState();
    }
  }

}

// updates display for the first time so it's not blank
updateDisplay();

// !! IMPORTANT README:

// You may add additional external JS and CSS as needed to complete the project, however the current external resource MUST remain in place for the tests to work. BABEL must also be left in place. 

/***********
INSTRUCTIONS:
  - Select the project you would 
    like to complete from the dropdown 
    menu.
  - Click the "RUN TESTS" button to
    run the tests against the blank 
    pen.
  - Click the "TESTS" button to see 
    the individual test cases. 
    (should all be failing at first)
  - Start coding! As you fulfill each
    test case, you will see them go   
    from red to green.
  - As you start to build out your 
    project, when tests are failing, 
    you should get helpful errors 
    along the way!
    ************/

// PLEASE NOTE: Adding global style rules using the * selector, or by adding rules to body {..} or html {..}, or to all elements within body or html, i.e. h1 {..}, has the potential to pollute the test suite's CSS. Try adding: * { color: red }, for a quick example!

// Once you have read the above messages, you can delete all comments.