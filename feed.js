const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const xml2js = require('xml2js');

const FEED_URL = 'https://www.youweekly.gr/feed'; // Replace with your actual XML feed URL

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
    const mediumContentArray = item.content; // assuming `item.content` is your array

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
<link rel="stylesheet" href="style.css">
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
footer p{
  padding-left: 30px;
  color: white;
}
.flex-news-img img {
    width: 160px;
    height: 160px;
    object-fit: cover;
}
@media screen and (max-width: 430px){
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
}
</style>
      </head>
      <body>
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
    <p>YOUWEEKLY</p>
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