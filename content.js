chrome.storage.local.get('upcomingHolidayText', async (result) => {
    const currentTime = Date.now();
    const validityTime = 12 * 60 * 60 * 1000; // milliseconds
    let upcomingHolidayText;

    if (result.upcomingHolidayText && currentTime - result.upcomingHolidayText.timestamp < validityTime) {
        upcomingHolidayText = result.upcomingHolidayText.text;
    } else {
        // Request the holiday text from the background script
        chrome.runtime.sendMessage({ action: 'getUpcomingHoliday' }, (response) => {
            if (chrome.runtime.lastError || !response || !response.upcomingHolidayText) {
                if (chrome.runtime.lastError) {
                    console.error('Error handling response:', chrome.runtime.lastError.message);
                }
                return;
            }
            upcomingHolidayText = response.upcomingHolidayText;
            displayUpcomingHoliday(upcomingHolidayText);
        });
        return; // Exit early since the callback will handle displaying the holiday text
    }

    displayUpcomingHoliday(upcomingHolidayText);
});

function displayUpcomingHoliday(upcomingHolidayText, retriesLeft = 5, retryDelayMs = 1000) {
    const targetElementXPath = '/html/body/div/div/div[2]/nav/div';
    const targetElement = document.evaluate(targetElementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (targetElement && isElementVisible(targetElement)) {
        if (document.getElementById('better-sensibull-holiday-bar')) {
            return;
        }

        const holidayBar = document.createElement('div');
        holidayBar.id = 'better-sensibull-holiday-bar';
        holidayBar.style.width = '100%';
        holidayBar.style.backgroundColor = '#2c3e50';
        holidayBar.style.color = '#ffffff';
        holidayBar.style.padding = '5px 0'; // Reduced padding for smaller height
        holidayBar.style.fontSize = '14px'; // Reduced font size for smaller text
        holidayBar.style.textAlign = 'center';
        holidayBar.style.fontWeight = 'bold';
        holidayBar.textContent = upcomingHolidayText;

        // Insert the holiday bar after the target element
        targetElement.parentNode.insertBefore(holidayBar, targetElement.nextSibling);
        return;
    }

    if (retriesLeft > 0) {
        setTimeout(() => {
            displayUpcomingHoliday(upcomingHolidayText, retriesLeft - 1, retryDelayMs);
        }, retryDelayMs);
    }
}

function isElementVisible(element) {
    if (!element || !element.isConnected) {
        return false;
    }

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
