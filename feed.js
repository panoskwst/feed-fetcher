const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const xml2js = require('xml2js');

const FEED_URL = 'https://www.youweekly.gr/tags/newsletter/feed';

async function fetchXMLFeed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}



async function parseXML(xmlString) {
  return xml2js.parseStringPromise(xmlString, {
        explicitArray: false ,
        mergeAttrs: true,
        tagNameProcessors: [xml2js.processors.stripPrefix],
        ignoreAttrs: false,
    
    });
}

// Helper: Get media image URL
function getImageFromItem(item) {
  
  if (Array.isArray(item.content)) {
    const mediumContentArray = item.content;

    const imageObj = mediumContentArray.find(obj => obj.medium === 'image');
    const imageUrl = imageObj?.url || null;


    console.log('The image is' + imageUrl);

    return imageUrl;
  }
  
  
  return item.content?.url || 'fallback.jpg';
}

function getDescription(item) {
  // const rawDescription = item.description?._.trim() || '';
  const shortDescription = item.description.split(/\s+/).slice(0, 8).join(' ');

  return shortDescription;
}

async function generateHTML(items) {
    const featureItem = items[0];
    // const flexItems = items.slice(1,4);
    const gridItems = items.slice(1,3);
    const endItem =items[3];
  let html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>

.email-body {
  max-width: 600px;
  margin: auto;
  background-color: white;
  font-family: "proxima-nova";
}
.read-more-link {
  color: #fff;
  text-decoration: none;
}
.category-container a {
  color: #000;
}
.header-container{
  height: 100%;
}
.dancing-script-font {
  font-family: "Dancing Script", cursive;
  color:  #e19890;
  font-size: 16px;
}
.hypatia-sans-font{
  font-family: "hypatia-sans-pro";
  font-weight: 600;
  font-size: 16px;
}

.feature-article{
  position: relative;
  width: 100%;
}
.image-container{
  position: relative;
  max-width: 600px;
}
.feature-article .image-container img {
  max-width: 600px;
  height: auto;
}
.img-text-container{
  font-weight: 800;
  position:absolute;
  background-image: linear-gradient(to right,rgba(201, 24, 74, 0.7) 50%, rgba(253, 134, 136, 0.7) 50%);
  z-index: 1;
  color: white;
  font-size: 22px;
  width: 249px;
  height: 39px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-shadow:0px 2px 2px black;
  bottom: 28px;
  left: 90px;
}

.content-container, 
.article,
.feature-article-excerpt{
  padding-top: 9;
  padding: 5%;
  align-items:end;
  position: relative;
}

.category{
  color: #C9184A;
  font-weight: 700;
  font-size: 18px;
  padding-bottom: 4px;
  
}
 .flex-container-item .category{
  padding-top: 11px;
 }

.read-more{
  font-weight: 600;
  color: white;
  background-color: #C9184A;
  transform: skewX(-10deg);
  width: fit-content;
  height: auto;
  text-align: center;
  margin: 20px 0 12px;
}
.read-more:hover{
  cursor: pointer;
}

.flex-container{
  display: flex;
  justify-content: space-evenly;
  text-align: center;
  flex-wrap: wrap;
}

.flex-background{
  background-image: linear-gradient(to bottom,white 70%, rgba(253, 134, 136, 0.7) 50%);
  position: relative;
}

.flex-container .read-more {
  width:146px;
  height: 20px;
  font-size: 12px;
  margin: 12px auto;

}

.flex-container-item{
  display: flex;
  flex-direction: column;
  width: 170px;
  background-image: linear-gradient(to bottom,#fff2f2 90%, transparent 30%);
  justify-content: center;  
  text-align: center;
  margin-bottom: 70px;
}

.hoverfun img:hover {
  backface-visibility: hidden;
  transform: scale(1.04, 1.04);
  box-shadow: 0px 30px 18px -8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  -webkit-text-size-adjust: 100%;
}

.flex-news-img{
  height: 160px;
  width: 160px;
  display: block;
  margin: auto;
  overflow: hidden;
}

.numbering{
  font-size: 58px;
  font-weight: 800;
  color:rgba(0, 0, 0, 0);
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #707070;
}

.article-title{
 font-size: 16px;
  font-weight: 900;
  margin-bottom: 6px;
  margin-top: 0;
}

.article-excerpt{
  font-size: 12px;
  padding: 5px;
  text-align: center;
}

.article-img{
  padding: 5px 11px 5px;
}

.article-img img {
    width: 355px;
    height: 355px;
    object-fit: cover;
}

.article-grid{
  display: flex;
  justify-content: space-evenly;
  text-align: center;
}

.article .read-more {
  width:146px;
  height: 20px;
  font-size: 12px;
  margin: 12px auto;
}

.flex-container-item .category{
  font-size: 12px;
  font-weight: 600;
  color: #000;
}

.category-hub {
  background-color: #fff2f2;
  height: 100%;
  padding: 0 30px;
  align-items: center;
}
.category-hub table{
width: 100%;
}
.category-hub td{
  text-align: center;
    padding: 10px;
}

/*.category-block{
  text-align: center;
  justify-content: center;
  display: flex;
  align-items: center;
  width: 120px;
  height: 120px;
} */
.category-block a{
  color: black;
}

.category-block button{
  height: 20px;
  width: 90px;
  border: 1px solid #707070;
  border-radius: 10px;
  font-size: 10px;
  margin-top: 10px;
}

.flex-news-img img {
    width: 160px;
    height: 160px;
    object-fit: cover;
}
.email-footer {
  color: #ffffff;
  border-top: 7px #C9184A solid;
  background-color: #000000;
  margin: 0;
}
.footer-container{
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-logo{
  display: flex;
  margin-left: 35px;
}
.footer-logo img{
  height: 14px;
}
.footer-social-icons{
display: flex;
align-items: center;
}
.footer-social-icons a{
  display: flex;
  margin-right: 10px;
}
.footer-social-icons span{
  font-size: 11px;
  font-weight: 400;
  margin-right: 15px;
}
@media screen and (max-width: 430px){
.header-container img{
  width: 100vw;
} 
 .img-text-container{
  left: 60px;
 }

 .image-container img{
  display: flex;
  object-fit: cover;
  width: 360px;
  height: 360px;
  margin: auto;
  justify-content: center;
 }

 .flex-container .read-more {
  width: 234px;
  height: 40px;
  font-size: 16px;
}
 .flex-container-item{
  width: 300px;
 }

 .flex-background::before {
  width: 100%;
 }

 .flex-container .article-excerpt{
  font-size: 20px;
  padding: 0 23px;
 }

 .article-title{
  font-size: 26px;
 }
 
 .flex-container-item .category{
  padding-top: 23px;
  font-size: 18px;
 }

.flex-news-img{
  width: 100%;
  height: auto;
}

 .flex-news-img img{
  object-fit: contain;
  width: 280px;
  height: 280px;
 }

 .category{
  font-size: 20px;
 }

 .numbering{
  font-size: 112px;
 }

 .flex-background{
  background-image: unset;
  background-color: rgba(253, 134, 136, 0.7);
 }
 
 .article-img img{
  max-width: 180px;
  height: 200px;
 }

 .article-img{
  order:2;
 }

 .article .category{
  font-size: 14px;
  text-align: left;
 }

  .article .article-title, .article-excerpt{
  font-size: 16px;
  text-align: left;
 }

 .article .read-more{
  font-size: 12px;
 }

 .article::after{
  display: none;
 }

 /* .category-block{
  height: 167px;
  width: 167px;
  margin: 10px auto;
 } */
}
@media only screen and (max-width: 360px) {
  .content-container, .article, .feature-article-excerpt {
    padding: 9px 5px;
  }
  .footer-social-icons span{
    font-size: 9px;
  }
}
</style>
</head>
<div class="email-body">
  <header>
    <div class="header-container">
      <img src="https://www.youweekly.gr/wp-content/uploads/2025/08/newsletter-header.jpg">
    </div>
  </header>
  <div class="feature-article">
    <div class="image-container">
      <img src="${getImageFromItem(featureItem)}" alt="img">
      <div class="img-text-container">ΑΠΟΚΛΕΙΣΤΙΚΟ</div>
    </div>
    <div class="feature-article-excerpt" style="color:#000000;">
      <div class="category"> ${Array.isArray(featureItem.category) ? featureItem.category[0] : featureItem.category || 'NEWS'}</div>
      <b>${featureItem.title}</b><br>
      ${featureItem.description}
      <div class="read-more" style="font-weight: 600; color: white; background-color: #C9184A; transform: skewX(-10deg); max-width: fit-content; height: auto; text-align: center; padding-top: 8px; padding-right: 10px; padding-bottom: 8px; padding-left: 10px; margin: 20px 0 12px;"><a class="read-more-link" style="color: #fff; text-decoration: none;" href="${featureItem.link}" target="_blank">ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ</a></div>
    </div>
    <div class="border" style="height: 2px; background-color: #C9184A; width:100%; margin-bottom: 10px;" ></div>
  </div>
  ${gridItems
  .map(item =>`
  <div class="article article-grid">
    <div class="article-img">
      <img src="${getImageFromItem(item)}">
    </div>
    <div class="secondary-content">
      <div class="category"> ${Array.isArray(item.category) ? item.category[0] : item.category || 'NEWS'}</div>
      <div class="article-title" style="color:#000000;">${item.title}</div>
      <div class="article-excerpt" style="color:#000000;">
        <div class="read-more" style="font-weight: 600; color: white; background-color: #C9184A; transform: skewX(-10deg); max-width: fit-content; height: auto; text-align: center; padding-top: 8px; padding-right: 10px; padding-bottom: 8px; padding-left: 10px; margin: 20px 0 12px;"><a class="read-more-link" style="color: #fff; text-decoration: none;" href="${item.link}" target="_blank">ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ</a></div>
      </div>
    </div>
  </div>
  <div class="border" style="height: 2px; background-color: #C9184A; width:100%; margin-bottom: 10px;" ></div>
  `)
  .join('')}

  <div class="feature-article">
    <div class="image-container">
      <img src="${getImageFromItem(endItem)}" alt="img">
    </div>
    <div class="feature-article-excerpt" style="color:#000000;">
      <div class="category"> ${Array.isArray(endItem.category) ? endItem.category[0] : endItem.category || 'NEWS'}</div>
      <b>${endItem.title}</b><br>
      ${endItem.description}
      <div class="read-more" style="font-weight: 600; color: white; background-color: #C9184A; transform: skewX(-10deg); max-width: fit-content; height: auto; text-align: center; padding-top: 8px; padding-right: 10px; padding-bottom: 8px; padding-left: 10px; margin: 20px 0 12px;"><a class="read-more-link" style="color: #fff; text-decoration: none;" href="${endItem.link}" target="_blank">ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ</a></div>
    </div>
    <div class="border" style="height: 2px; background-color: #C9184A; width:100%; margin-bottom: 10px;" ></div>
  </div>

  <div class="category-hub">
    <table>
      <tr>
        <td>
          <div class="category-block">
            <a href="https://www.youweekly.gr/articles-timeline" style="text-decoration: none;" target="_blank">
              <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/top-stories.png" alt="top-stories">
            </a>
          </div>
        </td>
        <td>
          <div class="category-block">
            <a href="https://www.youweekly.gr/fashion" style="text-decoration: none;" target="_blank">
              <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/fashion.png" alt="fashion">
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="category-block">
            <a href="https://www.youweekly.gr/beauty" style="text-decoration: none;" target="_blank">
              <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/beauty.png" alt="beauty">
            </a>
          </div>
        </td>
        <td>
          <div class="category-block">
            <a href="https://www.youweekly.gr/family" style="text-decoration: none;" target="_blank">
              <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/family.png" alt="family">
            </a>
          </div>
        </td>
      </tr>
    </table>
    <!--<div class="category-block"  style="width:35%; display: inline-block; margin: 10px 20px;">
      <a href="https://www.youweekly.gr/articles-timeline" style="text-decoration: none;" target="_blank">
        <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/top-stories.png" alt="top-stories">
      </a>
    </div>

    <div class="category-block"  style="width:35%; display: inline-block; margin: 10px 20px;">
      <a href="https://www.youweekly.gr/fashion" style="text-decoration: none;" target="_blank">
        <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/fashion.png" alt="fashion">
      </a>
    </div>

    <div class="category-block"  style="width:35%; display: inline-block; margin: 10px 20px;">
      <a href="https://www.youweekly.gr/beauty" style="text-decoration: none;" target="_blank">
        <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/beauty.png" alt="beauty">
      </a>
    </div>

    <div class="category-block"  style="width:35%; display: inline-block; margin: 10px 20px;">
      <a href="https://www.youweekly.gr/family" style="text-decoration: none;" target="_blank">
        <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/family.png" alt="family">
      </a>
    </div>-->
  </div>
  <div class="border" style="height: 2px; background-color: #C9184A; width:100%; margin-bottom: 10px;"></div>
  <div class="category-hub">
    <table>
      <tr>
        <td>
          <a href="https://www.youweekly.gr/you-deals" target="_blank">
            <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/banner-YouWeeklyDeals-40.jpg" alt="YouWeelyDeals">
          </a>
        </td>
        <td>
          <a href="https://www.youweekly.gr/back-to-school-25" target="_blank">
            <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/18_BACK-TO-SCHOOL-2025_banner-430.jpg" alt="afieroma">
          </a>
        </td>
      </tr>
      <tr>
        <td>
          <a href="https://afieromata.youweekly.gr/summer-vibes-2025" target="_blank">
            <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/17_SUMMER-VIBES-2025_banner-430.jpg" alt="afieroma">
          </a>
        </td>
        <td>
          <a href="https://afieromata.youweekly.gr/after-the-panelinies-2025" target="_blank">
            <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/16_META-TIS-PANNELHNIES-2025_banner-119.jpg" alt="afieroma">
          </a>
        </td>
      </tr>
    </table>
  </div>
  <div class="email-footer">
    <div class="footer-container">
      <div class="footer-logo">
        <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/logo-you-weekly-white.png" alt="YOUWEEKLY">
      </div>
      <div class="footer-social-icons">
        <span>FOLLOW US</span>
        <a href="https://www.facebook.com/youweekly.gr/" style="text-decoration: none;" aria-label="Facebook page" target="_blank">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/facebook-dark-red.png" alt="facebook">
        </a>
        <a href="https://www.youtube.com/channel/UCGL_s2a9wNG0j_TJY4hmBTQ" style="text-decoration: none;" target="_blank" aria-label="YouTube channel">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/youtube-dark-red.png" alt="youtube">
        </a>
        <a href="https://twitter.com/YouWeekly_gr" target="_blank" style="text-decoration: none;" aria-label="Twitter page">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/twitter-logo-dark-red.png" alt="twitter">
        </a>
        <a href="https://www.instagram.com/youweekly.gr/" target="_blank" style="text-decoration: none;" aria-label="Instagram page">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/instagram-dark-red.png" alt="instagram">
        </a>
        <a href="https://www.tiktok.com/@youweekly.gr/" target="_blank" style="text-decoration: none;" aria-label="TikTok page">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/09/tiktok-dark-red.png" alt="tiktok">
        </a>
      </div>
    </div>
  </div>
</div>
</html>
  `;
  return html;
}

(async () => {
  const xml = await fetchXMLFeed(FEED_URL);
  const parsed = await parseXML(xml);
  const items = parsed.rss.channel.item;

    // console.log(items);
    const util = require('util');
    // console.log(util.inspect(items[49].content, { depth: null, colors: true }));
    console.log (items);

  const htmlContent = await generateHTML(items);
  // Optional: Save the generated HTML to a file
  fs.writeFileSync('feed.html', htmlContent, 'utf8');

  // Launch Puppeteer to view or render the page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Optional: Take a screenshot or generate PDF
  await page.screenshot({ path: 'feed-screenshot.png', fullPage: true });

  await browser.close();
})();