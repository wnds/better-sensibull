chrome.storage.local.get('upcomingHolidayText', async (result) => {
    const currentTime = Date.now();
    const validityTime = 12 * 60 * 60 * 1000; // milliseconds
    let upcomingHolidayText;

    if (result.upcomingHolidayText && currentTime - result.upcomingHolidayText.timestamp < validityTime) {
        upcomingHolidayText = result.upcomingHolidayText.text;
    } else {
        // Request the holiday text from the background script
        chrome.runtime.sendMessage({ action: 'getUpcomingHoliday' }, (response) => {
            upcomingHolidayText = response.upcomingHolidayText;
            displayUpcomingHoliday(upcomingHolidayText);
        });
        return; // Exit early since the callback will handle displaying the holiday text
    }

    displayUpcomingHoliday(upcomingHolidayText);
});

function displayUpcomingHoliday(upcomingHolidayText) {
    const targetElementXPath = '//*[@id="app"]/div/div[3]/div[1]/div';
    const targetElement = document.evaluate(targetElementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (targetElement) {
        const holidayBar = document.createElement('div');
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
    }
}


