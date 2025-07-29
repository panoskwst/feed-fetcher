const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const xml2js = require('xml2js');

const FEED_URL = 'https://www.youweekly.gr/feed';

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
    const flexItems = items.slice(1,4);
    const gridItems = items.slice(4,6);
  let html = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://use.typekit.net/swn5wpk.css" as="style">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap" rel="stylesheet">
<style>
:root{
--red: #C9184A;
--pink: #e19890;
--soft-red: rgba(201, 24, 74, 0.7);
--soft-pink: rgba(253, 134, 136, 0.7);
--light-pink: #fff2f2;
}

body{
  max-width: 600px;
  margin: auto;
  background-color: white;
  font-family: "proxima-nova";
}
a {
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
  color: var(--pink);
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
.flex-background::before {
  content: "";
  position: absolute;
  top: -10px;
  height: 2px;
  width: 550px;
  background-color: var(--red);
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
  background-image: linear-gradient(to right,var(--soft-red) 50%, var(--soft-pink) 50%);
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
  padding: 9px 35px 25px;
  align-items:end;
  position: relative;
}

.article::after{
  content: "";
  position: absolute;
  height: 2px;
  width: 100%;
  background-color: var(--red);
  bottom: 16px;
}

.category{
  color: var(--red);
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
  background-color: var(--red);
  transform: skewX(-10deg);
  width: 205px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  background-image: linear-gradient(to bottom,white 70%, var(--soft-pink) 50%);
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
  background-image: linear-gradient(to bottom,var(--light-pink) 90%, transparent 30%);
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
  background-color: var(--light-pink);
  height: 185px;
  padding: 0 30;
  align-items: center;
}
.category-hub-img{
  height: 18px;
  padding: 10px 25px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.category-block{
  text-align: center;
  justify-content: center;
  display: flex;
  align-items: center;
  width: 120px;
  height: 120px;
}
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

.category-block:nth-child(1){
  background-image: url('https://www.youweekly.gr/wp-content/uploads/2025/07/yellowStories.png');
  background-size: cover;
}

.category-block:nth-child(2){
  background-image: url('https://www.youweekly.gr/wp-content/uploads/2025/07/purpleFashion.png');
  background-size: cover;
}

.category-block:nth-child(3){
  background-image: url('https://www.youweekly.gr/wp-content/uploads/2025/07/pinkBeauty.png');
  background-size: cover;
}

.category-block:nth-child(4){
  background-image: url('https://www.youweekly.gr/wp-content/uploads/2025/07/greenFamily.png');
  background-size: cover;
}
footer{
  border-top: 7px #C9184A solid;
  height:64px;
  background-color: black;
  margin: 0;
}
.flex-news-img img {
    width: 160px;
    height: 160px;
    object-fit: cover;
}
footer{
  color: #ffffff;
  border-top: 7px #C9184A solid;
  height:64px;
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
  background-color: var(--soft-pink);
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

 .category-block{
  height: 167px;
  width: 167px;
  margin: 10px auto;
 }

 .category-hub{
  height: 100%;
 }
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
      <body>
        <header>
          <div class="header-container">
              <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/always-on-top.png">
          </div>
        </header>
        <div class="feature-article">
            <div class="image-container">
                <img src="${getImageFromItem(featureItem)}" alt="img">
                <div class="img-text-container">ΑΠΟΚΛΕΙΣΤΙΚΟ</div>
            </div>
              <div class="feature-article-excerpt">
      <div class="category"> ${Array.isArray(featureItem.category) ? featureItem.category[0] : featureItem.category || 'NEWS'}</div>
      <b>${featureItem.title}</b>
      ${featureItem.description}
      <div class="read-more"><a href="${featureItem.link}" target="_blank">ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ</a></div>
    </div>
  </div>

    <div class="flex-container flex-background">
    ${flexItems
      .map((item, index) => `
        <div class="flex-container-item hoverfun">
          <div class="category"> ${Array.isArray(item.category) ? item.category[0] : item.category || 'NEWS'}</div>
          <div class="numbering">0${index + 1}</div>
          <div class="article-title">${item.title}</div>
          <div class="article-excerpt">${item.description || ''}</div>
          <div class="read-more"><a href="${item.link}" target="_blank">ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ</a></div>
          <div class="flex-news-img">
            <img src="${getImageFromItem(item)}">
          </div>
        </div>
      `)
      .join('')}
      </div>

      ${gridItems
        .map(item =>`
            <div class="article article-grid">
                <div class="article-img">
                    <img src="${getImageFromItem(item)}">
                </div>
                <div class="secondary-content">
                    <div class="category"> ${Array.isArray(item.category) ? item.category[0] : item.category || 'NEWS'}</div>
                    <div class="article-title">${item.title}</div>
                    <div class="article-excerpt">
                    ${getDescription(item)}
                    <div class="read-more"><a href="${item.link}" target="_blank">ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ</a></div>
                    </div>
                </div>
            </div>
        `)
          .join('')}
    <div class=" category-hub flex-container">
   <div class="category-block">
   <a href="https://www.youweekly.gr/articles-timeline" target="_blank">
      <div class="category-container">
        <div class="hypatia-sans-font">TOP STORIES</div>
        <div class="dancing-script-font">
          all about news
        </div>
        <div class="category-hub-img">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/news-icons1.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/news-icons2.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/news-icons3.png">
        </div>
        <button>ΠΕΡΙΣΣΟΤΕΡΑ</button>
      </div>
    </a>
    </div>

    <div class="category-block">
    <a href="https://www.youweekly.gr/fashion" target="_blank">
      <div class="category-container">
        <div class="hypatia-sans-font">ΜΟΔΑ</div>
        <div class="dancing-script-font">all about fashion</div>
        <div class="category-hub-img">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/fashion-icons-1.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/fashion-icons-2.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/fashion-icons-3.png">
        </div>
        <button>ΠΕΡΙΣΣΟΤΕΡΑ</button>
      </div>
    </a>
    </div>

    <div class="category-block">
      <a href="https://www.youweekly.gr/beauty" target="_blank">
      <div class="category-container">
        <div class="hypatia-sans-font">ΟΜΟΡΦΙΑ</div>
        <div class="dancing-script-font">
          all about beauty
        </div>
        <div class="category-hub-img">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/beauty-icons1.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/beauty-icons2.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/beauty-icons3.png">
        </div>
        <button>ΠΕΡΙΣΣΟΤΕΡΑ</button>
      </div>
      </a>
    </div>

    <div class="category-block">
      <a href="https://www.youweekly.gr/family" target="_blank">
      <div class="category-container">
        <div class="hypatia-sans-font">ΟΙΚΟΓΕΝΕΙΑ</div>
        <div class="dancing-script-font">all about family</div>
        <div class="category-hub-img">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/family-icons1.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/family-icons2.png">
          <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/family-icons3.png">
        </div>
        <button >ΠΕΡΙΣΣΟΤΕΡΑ</button>
      </div>
      </a>
    </div>
  </div>
  <footer>
    <div class="footer-container">
      <div class="footer-logo">
        <img src="https://www.youweekly.gr/wp-content/uploads/2025/07/logo-you-weekly-white.png" alt="YOUWEEKLY">
      </div>
      <div class="footer-social-icons">
        <span>FOLLOW US</span>
         <a href="https://www.facebook.com/youweekly.gr/" aria-label="Facebook page" target="_blank">
          <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="8.65" height="18.764" viewBox="0 0 8.65 18.764"><path d="M.144.162H-2.421v9.4H-6.309V.162H-8.158v-3.3h1.849V-5.279A3.645,3.645,0,0,1-2.387-9.2L.492-9.19v3.207H-1.6a.792.792,0,0,0-.825.9v1.945H.485Z" transform="translate(8.158 9.202)"></path></svg>
        </a>
        <a href="https://www.youtube.com/channel/UCGL_s2a9wNG0j_TJY4hmBTQ" target="_blank" aria-label="YouTube channel">
          <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="21.653" height="15.09" viewBox="0 0 21.653 15.09"><path d="M.376.131A23.247,23.247,0,0,0,0-4.989,2.734,2.734,0,0,0-2.341-7.115a72.484,72.484,0,0,0-8.107-.3,72.53,72.53,0,0,0-8.108.3,2.73,2.73,0,0,0-2.339,2.126,23.124,23.124,0,0,0-.384,5.12A23.107,23.107,0,0,0-20.9,5.249a2.732,2.732,0,0,0,2.34,2.126,72.521,72.521,0,0,0,8.108.3,72.512,72.512,0,0,0,8.108-.3A2.735,2.735,0,0,0,0,5.249,23.169,23.169,0,0,0,.376.131M-6.361-.078c-2.3,1.194-4.581,2.376-6.882,3.568V-3.67c2.295,1.2,4.574,2.387,6.882,3.592" transform="translate(21.277 7.415)"></path></svg>
        </a>
        <a href="https://twitter.com/YouWeekly_gr" target="_blank" aria-label="Twitter page">
          <svg fill="#fff" viewBox="0 0 1200 1227" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="none" class="u01b__icon-home" width="18" height="18"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"></path></svg>
        </a>
        <a href="https://www.instagram.com/youweekly.gr/" target="_blank" aria-label="Instagram page">
          <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="20.353" height="20.353" viewBox="0 0 20.353 20.353"><path d="M.264,0H-9.821a5.14,5.14,0,0,0-5.134,5.134V15.219a5.14,5.14,0,0,0,5.134,5.134H.264A5.14,5.14,0,0,0,5.4,15.219V5.134A5.14,5.14,0,0,0,.264,0m2.92,15.219a2.923,2.923,0,0,1-2.92,2.92H-9.821a2.923,2.923,0,0,1-2.919-2.92V5.134A2.922,2.922,0,0,1-9.821,2.215H.264a2.923,2.923,0,0,1,2.92,2.919Z" transform="translate(14.955)"></path><path d="M.022.043A1.241,1.241,0,0,1-1.219-1.2,1.241,1.241,0,0,1,.022-2.438,1.242,1.242,0,0,1,1.262-1.2,1.242,1.242,0,0,1,.022.043" transform="translate(15.566 5.975)"></path><path d="M.091,0a5.242,5.242,0,0,0,0,10.484A5.242,5.242,0,0,0,.091,0m0,8.269a3.027,3.027,0,1,1,0-6.054,3.027,3.027,0,0,1,0,6.054" transform="translate(10.086 4.934)"></path></svg>
        </a>
        <a href="https://www.tiktok.com/@youweekly.gr/" target="_blank" aria-label="TikTok page">
          <svg fill="#fff" width="20.353" height="20.353" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M412.19,118.66a109.27,109.27,0,0,1-9.45-5.5,132.87,132.87,0,0,1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14,23.9,350,16,350.13,16H267.69V334.78c0,4.28,0,8.51-.18,12.69,0,.52-.05,1-.08,1.56,0,.23,0,.47-.05.71,0,.06,0,.12,0,.18a70,70,0,0,1-35.22,55.56,68.8,68.8,0,0,1-34.11,9c-38.41,0-69.54-31.32-69.54-70s31.13-70,69.54-70a68.9,68.9,0,0,1,21.41,3.39l.1-83.94a153.14,153.14,0,0,0-118,34.52,161.79,161.79,0,0,0-35.3,43.53c-3.48,6-16.61,30.11-18.2,69.24-1,22.21,5.67,45.22,8.85,54.73v.2c2,5.6,9.75,24.71,22.38,40.82A167.53,167.53,0,0,0,115,470.66v-.2l.2.2C155.11,497.78,199.36,496,199.36,496c7.66-.31,33.32,0,62.46-13.81,32.32-15.31,50.72-38.12,50.72-38.12a158.46,158.46,0,0,0,27.64-45.93c7.46-19.61,9.95-43.13,9.95-52.53V176.49c1,.6,14.32,9.41,14.32,9.41s19.19,12.3,49.13,20.31c21.48,5.7,50.42,6.9,50.42,6.9V131.27C453.86,132.37,433.27,129.17,412.19,118.66Z"></path></svg>
        </a>
      </div>
    </div>
  </footer>
</body>
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
    console.log(util.inspect(items[49].content, { depth: null, colors: true }));
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