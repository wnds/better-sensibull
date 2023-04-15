const cheerio = require('cheerio');

async function fetchUpcomingHoliday() {
  try {
    const response = await fetch('https://zerodha.com/marketintel/holiday-calendar/');
    const html = await response.text();
    const $ = cheerio.load(html);

    const holidayText = $('#holidays h4.text-center').text()

    return holidayText.trim();
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