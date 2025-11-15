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

# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

## Usage

### Basic Usage with Playwright

```bash
npm run playwright -- --repo owner/repo --issue 123
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
- `--manual-login`: Wait for manual login to claude.ai (default: true)
- `--headless`: Run browser in headless mode (default: false)

### Example

```bash
# Automate issue #5 from unidel2035/ai-ci repository
npm run playwright -- --repo unidel2035/ai-ci --issue 5
```

## How It Works

1. **Fetch Issue**: The script fetches the issue details from GitHub using the GitHub API
2. **Launch Browser**: Opens a Chromium browser with persistent session (saves cookies/login state)
3. **Navigate to Claude Code**: Goes to claude.ai/code
4. **Manual Login**: Waits for you to log in to Claude.ai (first time only, sessions are saved)
5. **Paste Issue**: Automatically pastes the issue URL, title, and description into Claude Code
6. **Submit Task**: Clicks the submit button to start Claude Code processing
7. **Monitor Completion**: Polls every 10 seconds for completion indicators (like "Create PR" button)
8. **Create PR**: Automatically clicks "Create PR" when Claude Code finishes
9. **Done**: The Pull Request is created in your GitHub repository

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