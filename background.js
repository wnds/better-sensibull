async function fetchUpcomingHoliday() {
  try {
    const response = await fetch('https://zerodha.com/marketintel/holiday-calendar/?format=json', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const data = await response.json();

    // Get current date
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Sets the time to midnight

    // Find the next upcoming holiday
    let upcomingHoliday = null;
    for (let holiday of data) {
      const holidayDate = new Date(holiday.date);
      if (holidayDate > currentDate) {
        upcomingHoliday = holiday;
        break;
      }
    }

    // Check if there is an upcoming holiday
    if (!upcomingHoliday) {
      return "No upcoming holidays found.";
    }

    const holidayText = `The next upcoming holiday is ${upcomingHoliday.title} on ${new Date(upcomingHoliday.date).toDateString()}.`;

    return holidayText;
  } catch (error) {
    console.error('Error fetching holiday data:', error);
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'getUpcomingHoliday') {
    const upcomingHolidayText = await fetchUpcomingHoliday();

    if (upcomingHolidayText) {
      chrome.storage.local.set({
        'upcomingHolidayText': {
          text: upcomingHolidayText,
          timestamp: Date.now(),
        },
      });
      sendResponse({ upcomingHolidayText: upcomingHolidayText });
    }
  }
  return true; // Required to use sendResponse asynchronously
});