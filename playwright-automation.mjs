#!/usr/bin/env node

import { chromium } from 'playwright';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { existsSync } from 'fs';

const argv = yargs(hideBin(process.argv))
  .option('repo', {
    alias: 'r',
    type: 'string',
    description: 'GitHub repository in format owner/repo',
    demandOption: true
  })
  .option('issue', {
    alias: 'i',
    type: 'number',
    description: 'GitHub issue number',
    demandOption: true
  })
  .option('github-token', {
    alias: 't',
    type: 'string',
    description: 'GitHub personal access token (or use GITHUB_TOKEN env var)',
    default: process.env.GITHUB_TOKEN
  })
  .option('manual-login', {
    type: 'boolean',
    description: 'Wait for manual login to claude.ai',
    default: true
  })
  .option('headless', {
    type: 'boolean',
    description: 'Run browser in headless mode',
    default: false
  })
  .option('browser', {
    alias: 'b',
    type: 'string',
    description: 'Browser to use (chromium or yandex)',
    choices: ['chromium', 'yandex'],
    default: 'yandex'
  })
  .option('browser-path', {
    alias: 'p',
    type: 'string',
    description: 'Path to browser executable (for Yandex Browser or custom Chromium)',
    default: process.env.BROWSER_PATH
  })
  .help()
  .argv;

const GITHUB_API_BASE = 'https://api.github.com';
const CLAUDE_CODE_URL = 'https://claude.ai/code';

/**
 * Get default Yandex Browser path based on platform
 */
function getYandexBrowserPath() {
  const platform = process.platform;

  if (platform === 'win32') {
    // Windows paths
    return process.env.LOCALAPPDATA + '\\Yandex\\YandexBrowser\\Application\\browser.exe';
  } else if (platform === 'darwin') {
    // macOS path
    return '/Applications/Yandex.app/Contents/MacOS/Yandex';
  } else {
    // Linux paths
    return '/usr/bin/yandex-browser';
  }
}

/**
 * Fetch GitHub issue details
 */
async function fetchGitHubIssue(repo, issueNumber, token) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ai-ci-automation'
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${repo}/issues/${issueNumber}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch issue: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Wait for URL to change with polling (robust to tab switching)
 */
async function waitForUrlChange(page, currentUrl, timeout = 60000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const newUrl = page.url();
      if (newUrl !== currentUrl) {
        return newUrl;
      }
    } catch (error) {
      // Silently ignore detached frame errors - these occur when user switches tabs
      if (!error.message.includes('detached')) {
        console.error('Error checking URL:', error.message);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Timeout waiting for URL change');
}

/**
 * Wait for element with retry logic
 */
async function waitForElement(page, selector, options = {}) {
  const { timeout = 30000, visible = true } = options;
  try {
    await page.waitForSelector(selector, { timeout, state: visible ? 'visible' : 'attached' });
    return true;
  } catch (error) {
    console.error(`Element not found: ${selector}`);
    return false;
  }
}

/**
 * Log to console with timestamp
 */
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Main automation function
 */
async function automateIssueToClaudeCode() {
  const { repo, issue: issueNumber, githubToken, manualLogin, headless } = argv;

  log('Starting automation...');
  log(`Repository: ${repo}`);
  log(`Issue: #${issueNumber}`);

  // Fetch GitHub issue
  log('Fetching GitHub issue...');
  const issue = await fetchGitHubIssue(repo, issueNumber, githubToken);
  log(`Issue fetched: "${issue.title}"`);

  const issueUrl = issue.html_url;
  const issueTitle = issue.title;
  const issueBody = issue.body || '';

  log(`Issue URL: ${issueUrl}`);

  // Launch browser with persistent context
  log('Launching browser...');
  const userDataDir = './playwright-user-data';

  // Determine browser executable path
  let executablePath = argv.browserPath;
  let browserType = argv.browser;

  if (browserType === 'yandex') {
    if (!executablePath) {
      executablePath = getYandexBrowserPath();
      log(`Using default Yandex Browser path: ${executablePath}`);
    } else {
      log(`Using custom Yandex Browser path: ${executablePath}`);
    }

    // Check if Yandex Browser exists
    if (!existsSync(executablePath)) {
      log('⚠️  Yandex Browser not found at:', executablePath);
      log('ℹ️  Falling back to Chromium (will be downloaded automatically by Playwright)');
      browserType = 'chromium';
      executablePath = null;
    }
  } else if (executablePath) {
    log(`Using custom Chromium path: ${executablePath}`);

    // Check if custom Chromium exists
    if (!existsSync(executablePath)) {
      console.error('\n❌ ERROR: Browser not found at:', executablePath);
      console.error('Please check the path and try again.\n');
      process.exit(1);
    }
  }

  const launchOptions = {
    headless,
    viewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  log(`Browser: ${browserType}`);
  const context = await chromium.launchPersistentContext(userDataDir, launchOptions);

  const page = context.pages()[0] || await context.newPage();

  // Setup signal handlers for clean shutdown
  const cleanup = async () => {
    log('Cleaning up...');
    await context.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    // Navigate to claude.ai/code
    log('Navigating to claude.ai/code...');
    await page.goto(CLAUDE_CODE_URL, { waitUntil: 'domcontentloaded' });

    // Wait for manual login if needed
    if (manualLogin) {
      log('Waiting for manual login to claude.ai...');
      log('Please log in to Claude.ai in the browser window.');
      log('Press Enter in this terminal once you are logged in and see the main claude.ai/code interface...');

      // Wait for user to press Enter
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });

      log('Proceeding with automation...');
    }

    // Wait for the main interface to be ready
    log('Waiting for Claude Code interface to load...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Prepare the issue text to paste
    const issueText = `${issueUrl}

Title: ${issueTitle}

Description:
${issueBody}`;

    log('Prepared issue text to paste into Claude Code');

    // Find and focus the input area
    log('Looking for Claude Code input area...');

    // Try multiple selectors that might match the input area
    const inputSelectors = [
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="chat"]',
      'textarea[placeholder*="message"]',
      'div[contenteditable="true"]',
      'textarea',
      '[role="textbox"]'
    ];

    let inputFound = false;
    let inputSelector = null;

    for (const selector of inputSelectors) {
      const found = await waitForElement(page, selector, { timeout: 5000 });
      if (found) {
        inputSelector = selector;
        inputFound = true;
        log(`Found input area using selector: ${selector}`);
        break;
      }
    }

    if (!inputFound) {
      log('Could not find input area automatically.');
      log('Please manually paste the following text into Claude Code:');
      log('\n=== START OF ISSUE ===');
      log(issueText);
      log('=== END OF ISSUE ===\n');
      log('Press Enter after you have pasted the issue and started the task...');

      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });
    } else {
      // Focus and paste the issue
      log('Focusing input area...');
      await page.click(inputSelector);

      log('Pasting issue text...');
      await page.fill(inputSelector, issueText);

      // Wait a bit for the UI to update
      await page.waitForTimeout(1000);

      // Try to find and click the submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Send")',
        'button:has-text("Submit")',
        'button[aria-label*="Send"]',
        'button[aria-label*="Submit"]'
      ];

      let submitFound = false;
      for (const selector of submitSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            const isDisabled = await button.isDisabled();
            if (!isDisabled) {
              log(`Clicking submit button: ${selector}`);
              await button.click();
              submitFound = true;
              break;
            }
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!submitFound) {
        log('Could not find submit button. Please press Enter manually to submit the issue.');
        log('Press Enter in this terminal after you have submitted...');

        await new Promise(resolve => {
          process.stdin.once('data', () => resolve());
        });
      }
    }

    log('Issue submitted to Claude Code!');
    log('Monitoring for completion and PR creation...');

    // Monitor for completion
    log('Waiting for Claude Code to complete the task...');
    log('This may take several minutes depending on the complexity of the issue.');
    log('Looking for "Create PR" button or similar completion indicator...');

    // Poll for completion indicators
    const completionSelectors = [
      'button:has-text("Create PR")',
      'button:has-text("Create Pull Request")',
      'text="Pull request created"',
      'text="PR created"'
    ];

    let completed = false;
    const maxWaitTime = 30 * 60 * 1000; // 30 minutes
    const pollInterval = 10000; // 10 seconds
    const startTime = Date.now();

    while (!completed && (Date.now() - startTime) < maxWaitTime) {
      for (const selector of completionSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            log(`Found completion indicator: ${selector}`);
            completed = true;

            // If it's a button, try to click it
            if (selector.startsWith('button')) {
              log('Clicking Create PR button...');
              await element.click();
              await page.waitForTimeout(2000);
              log('PR creation initiated!');
            }
            break;
          }
        } catch (error) {
          // Continue checking
        }
      }

      if (!completed) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    if (!completed) {
      log('Timeout reached. The task may still be running.');
      log('Please manually check Claude Code and click "Create PR" when ready.');
      log('Press Enter to exit...');

      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });
    } else {
      log('Task completed successfully!');
      log('PR should be created in the repository.');
    }

  } catch (error) {
    log(`Error during automation: ${error.message}`);
    console.error(error);
  } finally {
    await cleanup();
  }
}

// Run the automation
automateIssueToClaudeCode().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
