const cProcess = require("child_process");
const puppeteer = require('puppeteer');

//note that this needs to be done for resemble to work
// `brew install pkg-config cairo libpng jpeg giflib && npm install canvas`
const resemble = require('resemblejs');
const fs = require('fs');
const path = require('path');

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


// TODO: use these as default values for test objects coming in to runTest
const defaultTest = {
  description: '',
  testFn: async () => {},
  loadedFn: async () => {},
  options: {}
}

const runTest = async ({testUrl, controlUrl, testFn, loadedFn, description, filename, options = {}}, browsers) => {
  console.log("RUNNING TEST: ", filename);
  //setup
  const pages = await startTest(testUrl, controlUrl, loadedFn, browsers);

  // console.log("TEST STARTED: ", testUrl, controlUrl);

  //run test
    //testFN takes two page instances as parameters
    //testFN returns a screenshot buffer for each browser

  const testBuffers = await testFn(pages);

  console.log("TEST COMPLETE: ", filename);

  const result = await runDiff(testBuffers, filename);

  // console.log("DIFF COMPLETE: ", filename, result);

  //close
  await closePages(pages);

  return result;
}

// can pass options for browsers, like window size etc
// pass a callback (loadedFn) to determine when page has loaded sufficiently
// loadedFn takes a page instance
const startTest = async (testUrl, controlUrl, loadedFn = () => Promise.resolve(), browsers, options = {}) => {
  const runTest = async () => {
    const testPage = await browsers.testBrowser.newPage();
    await testPage.goto(testUrl);
    await loadedFn(testPage);
    return testPage;
  };

  const runControl = async () => {
    const controlPage = await browsers.controlBrowser.newPage();
    await controlPage.goto(controlUrl);
    await loadedFn(controlPage);
    return controlPage;
  };

  const run = async () => {
    return Promise.all([runTest(), runControl()]).then(pages => {
      return {
        testPage: pages[0],
        controlPage: pages[1]
      }
    });
  }

  return await run();
};


const runDiff = async (imageBuffers, filename) => {
  return new Promise ((resolve, reject) => {
    resemble(imageBuffers.test)
      .compareTo(imageBuffers.control)
      .onComplete(data => {
        if (data.error) return reject(error);
        writeDiff(data.getBuffer(), filename).then(() => {
          data.filename = filename;
          return resolve(data);
        }).catch(err => {
          throw err;
        });
      });
  });
}

const writeDiff = async (buffer, filename) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve('./diffs/', `${filename}.png`), buffer, err => {
      if (err) return reject(err);
      return resolve(filename);
    });
  });
}

const closePages = async (pages) => {
  return Promise.all([
    pages.testPage.close(),
    pages.controlPage.close()
  ]);
};

/*
  scan directories for test files
  gather default exports from each file
  default exports should be objects where keys are the names of tests to run
  values are objects of signature
    {
     testUrl,
     controlUrl,
     testFn,
     loadedFn,
     description,
     options
    }
*/

// TODO: 'before' keys can be before hooks to run before each test in a file
// we'd have to schedule these to run before each test
// returns test objects exported from each test file

// TODO: allow test files to return an array of testObjects

const collectTests = async (testLocation) => {
  const testFiles = await new Promise((resolve, reject) => {
    fs.readdir(testLocation, function (err, files) {
      if (err) return reject(err);
      return resolve(files);
    });
  });
  console.log("TEST FILES: ", testFiles);
  const testObjects = testFiles.map(testFile => {
    let obj = require(path.resolve(testLocation, testFile));
    obj.filename = testFile.split(".")[0];
    return obj;
  });
  return testObjects;
}

const finish = async (results, browsers) => {
  for (browser in browsers) {
    await browsers[browser].close();
  }
  console.log("\n ///// FINAL RESULTS /////\n");
  results.forEach((result) => {
    console.log(`Test at: ${result.filename}`)
    console.log(`-- Same dimensions?  ${result.isSameDimensions}`)
    console.log(`-- Mismatch Percentage: ${result.misMatchPercentage}\n`)
  });
  return results;
}

const startBrowsers = async () => {
  return Promise.all([
    puppeteer.launch({headless: false}),
    puppeteer.launch({headless: false})
  ]).then(browsers => {
    return {
      testBrowser: browsers[0],
      controlBrowser: browsers[1]
    }
  });
}

//provide default urls for suite
const runSuite = async (options = {}) => {
  const testLocation = options.testLocation || './sample-tests';
  const browsers = await startBrowsers();
  const tests = await collectTests(testLocation);
  const results = await Promise.all(tests.map(test => runTest(test, browsers)));
  await finish(results, browsers);
}

runSuite().catch(err => {
  console.log("OOOOOPS", err);
});



///////////////////////////////////


const dummy = async () => {
  let testBrowser;
  let controlBrowser;
  const runTest = async () => {
    testBrowser = await puppeteer.launch({headless: false});
    const testPage = await testBrowser.newPage();
    await testPage.goto('localhost:4200/?embedType=inline', {waitUntil: 'networkidle0'});
    await testPage.screenshot({path: 'diffs/test.png', fullPage: true});
    await testBrowser.close();
  };

  const runControl = async () => {
    controlBrowser = await puppeteer.launch({headless: false});
    const controlPage = await controlBrowser.newPage();
    await controlPage.goto('http://player-backend.cnevids.com/stage/?embedType=inline', {waitUntil: 'networkidle0'});
    await controlPage.screenshot({path: 'diffs/control.png', fullPage: true});
    await controlBrowser.close();
  };

  const run = async () => {
    return await Promise.all([runTest(), runControl()]);
  }

  return await run();
}


// dummy();






