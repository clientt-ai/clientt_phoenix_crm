// @ts-check
/**
 * Custom Playwright Reporter for Link Checker
 *
 * Generates a summary report at the end of the test run with
 * detailed information about any issues found.
 */

class LinkCheckerReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      startTime: null,
      endTime: null,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
    };
  }

  onBegin(config, suite) {
    this.results.startTime = new Date();
    console.log('\n');
    console.log('='.repeat(60));
    console.log('       LINK CHECKER - Starting Test Run');
    console.log('='.repeat(60));
    console.log(`  Start Time: ${this.results.startTime.toLocaleString()}`);
    console.log(`  Workers: ${config.workers}`);
    console.log('='.repeat(60));
    console.log('\n');
  }

  onTestBegin(test) {
    console.log(`  🔍 Starting: ${test.title}`);
  }

  onTestEnd(test, result) {
    const duration = result.duration;
    const status = result.status;

    this.results.tests.push({
      title: test.title,
      status,
      duration,
      errors: result.errors,
    });

    if (status === 'passed') {
      this.results.passed++;
      console.log(`  ✅ Passed: ${test.title} (${this.formatDuration(duration)})`);
    } else if (status === 'failed') {
      this.results.failed++;
      console.log(`  ❌ Failed: ${test.title} (${this.formatDuration(duration)})`);
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`     Error: ${error.message?.substring(0, 100)}...`);
        });
      }
    } else if (status === 'skipped') {
      this.results.skipped++;
      console.log(`  ⏭️  Skipped: ${test.title}`);
    }
  }

  onEnd(result) {
    this.results.endTime = new Date();
    const totalDuration = this.results.endTime - this.results.startTime;

    console.log('\n');
    console.log('='.repeat(60));
    console.log('       LINK CHECKER - Test Run Complete');
    console.log('='.repeat(60));
    console.log(`  Status: ${result.status.toUpperCase()}`);
    console.log(`  Duration: ${this.formatDuration(totalDuration)}`);
    console.log('');
    console.log('  Results:');
    console.log(`    ✅ Passed:  ${this.results.passed}`);
    console.log(`    ❌ Failed:  ${this.results.failed}`);
    console.log(`    ⏭️  Skipped: ${this.results.skipped}`);
    console.log('');

    if (this.results.failed > 0) {
      console.log('  Failed Tests:');
      this.results.tests
        .filter(t => t.status === 'failed')
        .forEach(t => {
          console.log(`    - ${t.title}`);
        });
      console.log('');
    }

    console.log('  📄 Reports generated in: playwright_tests/test-results/');
    console.log('     - link-checker-report.html (detailed HTML report)');
    console.log('     - link-checker-results.json (raw JSON data)');
    console.log('='.repeat(60));
    console.log('\n');
  }

  formatDuration(ms) {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }
}

module.exports = LinkCheckerReporter;
