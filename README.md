# ai-ci

Automate GitHub issues by running them through [claude.ai/code](https://claude.ai/code) and automatically creating Pull Requests.

## Overview

This project uses browser automation (Playwright/Puppeteer) to:
1. Fetch GitHub issues from a repository
2. Open claude.ai/code in a browser
3. Paste the issue details (URL, title, description) into Claude Code
4. Monitor the task completion
5. Automatically click "Create PR" when Claude Code finishes

## Inspired By

This project follows the pattern established by [konard/hh-job-application-automation](https://github.com/konard/hh-job-application-automation), which automates job applications using similar browser automation techniques.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub account
- Claude.ai account with access to Claude Code
- GitHub Personal Access Token (optional, but recommended for private repositories)

## Installation

```bash
# Clone the repository
git clone https://github.com/unidel2035/ai-ci.git
cd ai-ci

# Install dependencies (includes stealth plugins for bot detection bypass)
npm install

# Install Playwright browsers (first time only)
# Required only if using default Chromium (not needed for Yandex Browser)
npx playwright install chromium
```

**Dependencies include:**
- `playwright` - Browser automation framework
- `playwright-extra` - Plugin wrapper for Playwright
- `puppeteer-extra-plugin-stealth` - Stealth plugin to bypass bot detection
- `yargs` - Command-line argument parser

## Usage

### Basic Usage with Playwright (Chromium)

```bash
npm run playwright -- --repo owner/repo --issue 123
```

### Using Yandex Browser

```bash
npm run playwright -- --repo owner/repo --issue 123 --browser yandex
```

### Using Yandex Browser with Custom Path

```bash
npm run playwright -- --repo owner/repo --issue 123 --browser yandex --browser-path "/path/to/yandex-browser"
```

Or set the `BROWSER_PATH` environment variable:

```bash
export BROWSER_PATH="/path/to/yandex-browser"
npm run playwright -- --repo owner/repo --issue 123 --browser yandex
```

### With GitHub Token

```bash
npm run playwright -- --repo owner/repo --issue 123 --github-token YOUR_TOKEN
```

Or set the `GITHUB_TOKEN` environment variable:

```bash
export GITHUB_TOKEN=your_token_here
npm run playwright -- --repo owner/repo --issue 123
```

### Command-line Options

- `--repo, -r` (required): GitHub repository in format `owner/repo`
- `--issue, -i` (required): GitHub issue number
- `--github-token, -t`: GitHub personal access token (or use `GITHUB_TOKEN` env var)
- `--browser, -b`: Browser to use - `chromium` or `yandex` (default: chromium)
- `--browser-path, -p`: Path to browser executable (or use `BROWSER_PATH` env var)
- `--manual-login`: Wait for manual login to claude.ai (default: true)
- `--headless`: Run browser in headless mode (default: false)

### Examples

```bash
# Automate issue #5 from unidel2035/ai-ci repository using default Chromium
npm run playwright -- --repo unidel2035/ai-ci --issue 5

# Same issue using Yandex Browser
npm run playwright -- --repo unidel2035/ai-ci --issue 5 --browser yandex

# Using Yandex Browser with custom path
npm run playwright -- --repo unidel2035/ai-ci --issue 5 --browser yandex --browser-path "C:\Custom\Path\browser.exe"
```

## How It Works

1. **Fetch Issue**: The script fetches the issue details from GitHub using the GitHub API
2. **Launch Browser**: Opens a Chromium browser with persistent session (saves cookies/login state)
3. **Navigate to Claude Code**: Goes to claude.ai/code with stealth mode enabled
4. **Manual Login**: Waits for you to log in to Claude.ai (first time only, sessions are saved)
5. **Paste Issue**: Automatically pastes the issue URL, title, and description into Claude Code
6. **Submit Task**: Clicks the submit button to start Claude Code processing
7. **Monitor Completion**: Polls every 10 seconds for completion indicators (like "Create PR" button)
8. **Create PR**: Automatically clicks "Create PR" when Claude Code finishes
9. **Done**: The Pull Request is created in your GitHub repository

## Bot Detection Bypass

This tool uses `playwright-extra` with the `puppeteer-extra-plugin-stealth` plugin to bypass bot detection mechanisms. The stealth plugin:

- Hides automation indicators (like `navigator.webdriver`)
- Mimics real user behavior and browser fingerprints
- Passes common bot detection tests used by Cloudflare and similar services

**Additional anti-detection measures:**
- Custom browser arguments to disable automation features
- Persistent browser context to maintain login sessions
- Human-like interaction patterns

This allows the automation to work with claude.ai's bot protection without triggering CAPTCHA or human verification challenges.

## Browser Support

### Yandex Browser

The script supports using Yandex Browser instead of Chromium. Yandex Browser is based on Chromium and provides a familiar Russian-localized browsing experience.

**Default Yandex Browser paths:**

- **Windows**: `%LOCALAPPDATA%\Yandex\YandexBrowser\Application\browser.exe`
- **macOS**: `/Applications/Yandex.app/Contents/MacOS/Yandex`
- **Linux**: `/usr/bin/yandex-browser`

If your Yandex Browser is installed in a different location, use the `--browser-path` option to specify the custom path.

**Download Yandex Browser:**
- Official website: https://browser.yandex.ru/

## Session Persistence

The script uses Playwright's persistent context feature, which saves your login session in the `playwright-user-data` directory. This means:
- You only need to log in to Claude.ai once
- Subsequent runs will use your saved session
- Delete the `playwright-user-data` directory to reset the session

## Interactive Mode

If the script cannot find certain UI elements (like the input box or submit button), it will:
1. Display the issue text to paste manually
2. Wait for you to press Enter after you've completed the action
3. Continue with the automation

This ensures the script works even if Claude.ai's interface changes.

## Troubleshooting

### "Could not find input area"
- The script will prompt you to manually paste the issue text
- This is normal if Claude.ai's UI has changed
- Follow the on-screen instructions

### "Timeout waiting for completion"
- Complex issues may take longer than expected
- The script waits up to 30 minutes by default
- You can manually click "Create PR" when ready

### GitHub API Rate Limiting
- Use a GitHub Personal Access Token to avoid rate limits
- Unauthenticated requests are limited to 60 per hour
- Authenticated requests get 5,000 per hour

## Development

### Run ESLint

```bash
npm run lint
```

### Fix ESLint Issues

```bash
npm run lint:fix
```

### Check Syntax

```bash
npm run check
```

## Project Structure

```
ai-ci/
├── package.json                  # Project configuration and dependencies
├── playwright-automation.mjs     # Main Playwright automation script
├── playwright-user-data/         # Browser session data (created on first run)
├── README.md                     # This file
└── CLAUDE.md                     # Project context for AI issue solver
```

## License

Unlicense - This is free and unencumbered software released into the public domain.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security Note

⚠️ This tool requires access to:
- GitHub API (to fetch issues)
- Claude.ai (to process tasks)

**Important Security Considerations:**
- Never commit your GitHub token to version control
- Use environment variables for sensitive data
- The browser session is stored locally in `playwright-user-data`
- Review the code before running to ensure it meets your security requirements

## Future Enhancements

- [ ] Add Puppeteer alternative implementation
- [ ] Support for processing multiple issues in batch
- [ ] Better error recovery and retry logic
- [ ] Configurable timeout and polling intervals
- [ ] Support for issue templates and custom formatting
- [ ] CI/CD integration for automatic issue processing
- [ ] Webhook support for real-time issue processing