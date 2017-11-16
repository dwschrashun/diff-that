const testUrl = 'localhost:4200/?embedType=inline';
const controlUrl = 'http://player-backend.cnevids.com/stage/?embedType=inline';
const description = 'Crample Test';
const options = {};

//must return screenshot buffers
const testFn = ({testPage, controlPage}) => {
  return Promise.all([
    testPage.screenshot({fullPage: true}),
    controlPage.screenshot({fullPage: true})
  ]).then(buffers => {
    return {
      test: buffers[0],
      control: buffers[1]
    }
  });
};
const loadedFn = async () => {};


module.exports = {testUrl, controlUrl, testFn, options};
