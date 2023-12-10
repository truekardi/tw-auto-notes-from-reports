(function() {
    'use strict';

    // CONFIGURATION
    const nextReportKeypress = 'W';

    const botToggleStartMessage = 'POZNÁMKY SE NYNÍ ZAKLÁDAJÍ';
    const botEndMessage = 'NEJNOVĚJŠÍ OZNÁMENÍ BYLO ZALOŽENO. ZAKLÁDÁNÍ JE NYNÍ VYPNUTO.';
    const botToggleEndMessage = 'NEJNOVĚJŠÍ OZNÁMENÍ BYLO ZALOŽENO. ZAKLÁDÁNÍ JE NYNÍ VYPNUTO.';

    let autoNotesActive = localStorage.getItem('autoNotesActive') === 'true';
    let observer;
    let lastUrl = location.href;

    // Function to execute the external script
    function executeNoteAddingScript() {
        var noteScript = document.createElement('script');
        noteScript.src = 'https://cdn.jsdelivr.net/gh/truekardi/tw-ad-note-script@main/manualTranslatedNotesFromReport.js';
        document.head.appendChild(noteScript);
        console.log('Note adding script executed');
    }

    // Function to simulate key press
    function simulateKeyPress(key) {
        console.log('Simulating key press:', key);
        var event = new KeyboardEvent('keydown', {
            key: key,
            keyCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false,
            bubbles: true
        });

        document.dispatchEvent(event);
    }

    // Function to check for the success message
    function checkForSuccessMessage() {
        console.log('Checking for success message');
        let success = document.querySelector('div.success p')?.textContent === 'Poznámka založena';
        if (success) {
            console.log('Success message found');
        }
        return success;
    }

    // Function to start the bot cycle
    function startBotCycle() {
        console.log('Starting bot cycle');

        executeNoteAddingScript(); // Execute the external script instead of simulating keypress '3'

        observer = new MutationObserver(function(mutations, obs) {
            if (checkForSuccessMessage()) {
                simulateKeyPress(nextReportKeypress); // Make sure the key is correct
                obs.disconnect(); // Disconnect this observer
                // Wait for a brief moment before checking for page load
                setTimeout(() => {
                    if (location.href === lastUrl) {
                        // URL has not changed, assuming end of cycle
                        console.log(botEndMessage);
                        localStorage.setItem('autoNotesActive', false);
                        autoNotesActive = false;
                        if (observer) {
                            observer.disconnect();
                        }
                    } else {
                        lastUrl = location.href; // Update the URL
                        waitForPageLoad(); // Wait for the page to load
                    }
                }, 1000); // 1 second delay
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Function to wait for page load
    function waitForPageLoad() {
        console.log('Waiting for page to load');
        observer = new MutationObserver(function(mutations, obs) {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                obs.disconnect(); // Disconnect this observer
                if (autoNotesActive) {
                    console.log('Page loaded, restarting bot cycle');
                    setTimeout(startBotCycle, 3000); // Wait before starting next cycle
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Toggle bot with ";" key press
    document.addEventListener('keydown', function(e) {
        if (e.key === ';') {
            autoNotesActive = !autoNotesActive;
            localStorage.setItem('autoNotesActive', autoNotesActive); // Save the state in local storage
            if (autoNotesActive) {
                console.log(botToggleStartMessage);
                startBotCycle();
            } else {
                console.log(botToggleEndMessage);
                if (observer) {
                    observer.disconnect();
                }
            }
        }
    });

    // Start the bot if it was already active when the page loaded
    if (autoNotesActive) {
        startBotCycle();
    }
})();
