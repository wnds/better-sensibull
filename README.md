# Better Sensibull

Better Sensibull is a Chrome extension that enhances the user experience on Sensibull.com by adding useful features.

## Features

- Display the text of the upcoming holiday at the top of the page.

More features will be added based on user demand.

## Building and Bundling

To build and bundle the extension, follow these steps:

### Prerequisites

- Node.js and npm installed on your system.

### Setup

1. Clone the repository:

```bash
git clone https://github.com/wnds/better-sensibull.git
```

2. Change to the project directory:
```bash
cd better-sensibull
```

3.Install the dependencies:
```bash
npm install
```

4. Bundling

Bundle the background script using Browserify:
```bash
npx browserify background.js -o backgroundBundle.js
```

This command will create a bundled version of the background script named "backgroundBundle.js".

5. Load the extension in Chrome:

Open Chrome and navigate to "chrome://extensions/".
Enable "Developer mode".
Click "Load unpacked" and select the project folder.

The extension is now loaded in Chrome and ready for testing.

### Contributing

Feel free to open issues, submit pull requests, or provide feedback and suggestions for new features.