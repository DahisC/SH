const puppeteer = require('puppeteer');
const fs = require('fs');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

puppeteer.launch({headless: false}).then(async browser => {

    var data;

    fs.readFile("allWatchesWithIndex.json", (err, rawData) => {
        if (err) throw err;
        data = JSON.parse(rawData);
        //scraping(data);
    });
    
    const page = await browser.newPage();
    scraping(0);

    async function scraping(currentIndex) {
        await page.goto(data[currentIndex].link);
        await page.waitForSelector('span.product-name', {visible: true});

        const ITEM_NAME = 'span.product-name';
        //const ITEM_BLOCK = 'li.item .product-name';

        var name = await page.evaluate(() => document.querySelector('span.product-name').innerText);
        var price = await page.evaluate(() => document.querySelector('span#final-price').innerText);
        var desc = await page.evaluate(() => document.querySelector('div.product-description').innerHTML);
        desc = desc.trim();
        var attr = await page.evaluate(() => document.querySelector('div.product-attributes').innerHTML);
        attr = attr.trim();
        var img = await page.evaluate(() => document.querySelector('div.MagicSlides div.mt-active').innerHTML);
        //console.log(img);
        img = img.split('href="');
        //console.log(img[1]);
        img = img[1].split(".jpg");
        // console.log(img[0]);
        // console.log("~~~~~");

        console.log("index:"+data[currentIndex].index);
        console.log(name);
        console.log(price);
        console.log(img[0]+".jpg");
        console.log("---");
        //console.log(desc);
        //console.log("---");
        //console.log(attr);

        let realImg = img[0]+".jpg";

        if (img) {
            function dataCons(index, link, img, name, price, desc, attr) {
                this.time = getTime();
                this.index = index;
                this.link = link;
                this.img = img;
                this.name = name;
                this.price = price;
                this.desc = desc;
                this.attr = attr;
            }

            let dataObj = new dataCons(data[currentIndex].index, data[currentIndex].link, realImg, name, price, desc, attr);
            writeIn(dataObj);

            currentIndex++;
            scraping(currentIndex);
        }
    }
});

function getTime() {
    let NowDate = new Date();
    let h = NowDate.getHours();
    let m = NowDate.getMinutes();
    let s = NowDate.getSeconds();
    
    return h+":"+m+":"+s;　
}

function writeIn(dataObj) {
    //console.log(dataObj);
    var doc = new GoogleSpreadsheet('1yiWBy7GUrqOqcASMLVutULNvxz0K5z_rwGSdNzX0BXc');
    var sheet;

    async.series([

		function setAuth(step) {
			var creds = require('./AIBOT-7ac8efcc5bc6.json');
			doc.useServiceAccountAuth(creds, step);
		},

	    function getInfoAndWorksheets(step) {
			doc.getInfo(function(err, info) {
                //console.log('Loaded doc: '+info.title+' by '+info.author.email);
                //console.log(info.worksheets[0]);
                sheet = info.worksheets[0];
                //console.log(sheet);
				step();
			});
		},

	    function workingWithRows(step) {

            sheet.getCells({
				'min-row': dataObj.index+1,
				'max-row': dataObj.index+1,
				'min-col': 1,
				'max-col': 7,
				'return-empty': true
			},	function(err, cells) {

                //console.log(cells);

                dataObj.attr = dataObj.attr.replace('\s')
                console.log(dataObj.attr);

				cells[0].setValue(getTime(), null);
				cells[1].setValue(dataObj.index, null);
                cells[2].setValue(dataObj.img, null);
                cells[3].setValue(dataObj.name, null);
                cells[4].setValue(dataObj.price, null);
                cells[5].setValue(dataObj.desc, null);
                cells[6].setValue(dataObj.attr, null);
                
				// cells[3].setValue(4, null);
				// cells[4].setValue(5, null);
				// cells[5].setValue(6, null);
				// cells[6].setValue(7, null);

				// var cell = cells[0];

				// console.log("將網址 "+url+" 寫入儲存格中...");
				// cell.setValue(formula, null);
				// callback();

            });
            
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}