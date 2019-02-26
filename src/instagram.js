import phantom from 'phantom';
import cheerio from 'cheerio';

const INSTAGRAM_LOGIN = 'https://www.instagram.com/accounts/login/';
const LOGIN_AFTER_DELAY = 5000;
const SEARCH_TAG_DELAY = 3000;
const FEED_AFTER_DELAY = 5000;

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

export const action = async (account, config) => {
  // * must webpack-node-externals (if not can't open shim/index)
  // const instance = await phantom.create(["--proxy=1.229.165.34:12389", "--proxy-type=socks5"]);
  const instance = await phantom.create();

  const page = await instance.createPage();
  page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.256');
       

  await page.on('onResourceRequested', (requestData) => {
    console.info('Requesting', requestData.url);
  });

  await page.on('onConsoleMessage', function(msg) {
      console.info(msg);
  });
  await page.on('onError', function(msg) {
      console.info(msg);
  });
  
  console.log("@LOGIN")
  await page.open(INSTAGRAM_LOGIN);

  // login account
  const username = account.username;
  const password = account.password;
  
  // login
  const result = await page.evaluate(function() {
    const data = [];
    const usernameRect = document.getElementsByName('username')[0].getBoundingClientRect();
    const passwordRect = document.getElementsByName('password')[0].getBoundingClientRect();
    const buttonRect = document.querySelectorAll('button[type="submit"]')[0].getBoundingClientRect();

    data.push(usernameRect);
    data.push(passwordRect);
    data.push(buttonRect);

    return data;
  });
  
  // login action
  await page.sendEvent('click', result[0].left + result[0].width / 2, result[0].top + result[0].height / 2, 'left');
  page.sendEvent('keypress', 'thinkingmansion@gmail.com'); 
  await timeout(1000);
  await page.sendEvent('click', result[1].left + result[1].width / 2, result[1].top + result[1].height / 2, 'left');
  page.sendEvent('keypress', 'algiz@9791'); 
  await timeout(1000);
  await page.sendEvent('click', result[2].left + result[2].width / 2, result[2].top + result[2].height / 2, 'left');

  page.render('login1.png');
  await timeout(LOGIN_AFTER_DELAY);
  page.render('login2.png');

  console.log("@TAGS")
  const searchTags = config.plus_tags;
  for (const tag of searchTags) {
    console.log(tag);

    await page.open(`https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}`);
    await timeout(SEARCH_TAG_DELAY);

    const content = await page.property('content');
    const $ = cheerio.load(content);

    // get link
    // const links = $('a');
    const links = $('h2:nth-child(2)+div a');
    const linkSize = links.length; 

    // loop link
    for (let i = 0; i < linkSize; i ++) {
      const link = links[i];
      const href = link.attribs.href;

      // pass other link
      if (!href.includes('/p/'))  continue;

      const feedPage = await instance.createPage();
      const url = `https://www.instagram.com${href}`;
      console.log(url);

      await feedPage.open(url);

      let feedContent = await feedPage.property('content');
      let $feed = cheerio.load(feedContent);

      // pass liked
      if ($feed('button .glyphsSpriteHeart__filled__24__red_5').length > 0) continue;

      // like
      await feedPage.evaluate(function() {
        const button = document.querySelectorAll('[class*="glyphsSpriteHeart__outline__24__grey_9"]')[0].parentElement;
        button.click();
      });

      feedPage.render(`${tag}${i+1}.png`);

      await feedPage.close();

      break;
      // glyphsSpriteHeart__outline__24__grey_9
      // glyphsSpriteHeart__filled__24__red_5
    }
    // console.log($('body').html());
    
    break;
  }
  // await page.open(`https://www.instagram.com/explore/tags/${encodeURIComponent('신사동')}`);
  

  // const content = await page.property('content');
  // const $ = cheerio.load(content);

  // const images = $('img');
  


  
  // form.submit();
  
  // console.log(submitButton);

  // login
  
  // read config

  // search tags

  // do action & message

  // unfollow action

  // report & end

  console.log("@END")
  await instance.exit();
};