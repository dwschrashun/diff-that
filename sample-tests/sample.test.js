const testUrl = 'localhost:4200/?embedType=inline&autoplay=false';
const controlUrl = 'http://player-backend.cnevids.com/stage/?embedType=inline&autoplay=false';
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
const loadedFn = async (page) => {
  await page.addStyleTag({
    content: '.video-js .cne-animated-clip, .player-container .video-js .vjs-tech { display: none; }'
  })
  return await page.waitForSelector('.vjs-big-play-button');
};

module.exports = {testUrl, controlUrl, testFn, loadedFn, options};
