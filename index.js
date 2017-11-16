const cProcess = require("child_process");
const puppeteer = require('puppeteer');

//in case we need to spawn any child processes / do deploys before running tests

/*const ls = cProcess.spawn('ember deploy qa', ['-lh', '/usr']);

let deployOutput = '';

ls.stdout.on('data', (data) => {
  // console.log(`stdout: ${data}`);
  deployOutput += data;
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  console.log('output', deployOutput);
});
*/


/*

-- find tests
-- for each test
  -- start two browsers
  -- visit links defined in test
    -- possibly define default links for each test suite configurable by options on each test
  -- do any defined test logic
  -- take screenshots
  -- diff screenshots
  -- save diff files
  -- return result of diffing
*/

// can pass options for browsers, like window size etc
// pass a callback to determine when page has loaded sufficiently
const start = async (cb = () => Promise.resolve(), options = {}) => {
  let testBrowser;
  let controlBrowser;
  const runTest = async () => {
    testBrowser = await puppeteer.launch({headless: false});
    const testPage = await testBrowser.newPage();
    await testPage.goto('localhost:4200');
    await cb();
    // await testPage.screenshot({path: '/diffs/test.png', fullPage: true});

  };

  const runControl = async () => {
    controlBrowser = await puppeteer.launch({headless: false});
    const controlPage = await controlBrowser.newPage();
    await controlPage.goto('http://player-backend.cnevids.com/stage/');
    await cb();
    // await controlPage.screenshot({path: '/diffs/control.png', fullPage: true});
  };

  const run = async () => {
    runTest();
    runControl();
  }

  await run();
  await testBrowser.close();
  await controlBrowser.close();
};

const runTest = async ({testUrl, controlUrl, testFn, options = {}}) => {
  //setup
  await start();
  //run test
    //test takes two browser instances as parameters

  //close
}

/*
  scan directories for test files
  gather default exports from each file
  default exports should be objects where keys are the names of tests to run
  values are objects of signature
    {
     testUrl,
     controlUrl,
     testFn,
     options
    }
*/

// TODO: 'before' keys can be before hooks to run before each test in a file
// we'd have to schedule these to run before each test
const collectTests = async () => {

}

const runSuite = async () => {
  const tests = await collectTests();
  const results = await Promise.all(tests.map(test => runTest(test)));
  processResults();
}


// runSuite();






const dummy = async () => {
  let testBrowser;
  let controlBrowser;
  const runTest = async () => {
    testBrowser = await puppeteer.launch({headless: false});
    const testPage = await testBrowser.newPage();
    await testPage.goto('localhost:4200', {waitUntil: 'networkidle0'});
    await testPage.screenshot({path: 'diffs/test.png', fullPage: true});
    await testBrowser.close();
  };

  const runControl = async () => {
    controlBrowser = await puppeteer.launch({headless: false});
    const controlPage = await controlBrowser.newPage();
    await controlPage.goto('http://player-backend.cnevids.com/stage/', {waitUntil: 'networkidle0'});
    await controlPage.screenshot({path: 'diffs/control.png', fullPage: true});
    await controlBrowser.close();
  };

  const run = async () => {
    return await Promise.all([runTest(), runControl()]);
  }

  return await run();
}


dummy();






