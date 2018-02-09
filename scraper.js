const puppeteer = require('puppeteer');
const fs = require('fs');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var request = require('request');
const translate = require('google-translate-api');

var _currentIndex;

puppeteer.launch({headless: false}).then(async browser => {

    var data;

    fs.readFile("allWatchesWithIndex.json", (err, rawData) => {
        if (err) throw err;
        data = JSON.parse(rawData);
        //scraping(data);
    });
    
    const page = await browser.newPage();
        page.setDefaultNavigationTimeout(900000);
    scraping(19608);

    var name1;

    async function scraping(currentIndex) {
        _currentIndex = currentIndex;
        await page.goto(data[currentIndex].link);
        await page.waitForSelector('span.product-name', {visible: true});

        const ITEM_NAME = 'span.product-name';
        //const ITEM_BLOCK = 'li.item .product-name';

        // var out_of_stock = await page.evaluate(() => {
        //     if (document.querySelector('p.out-of-stock span') != null) {
        //         return document.querySelector('p.out-of-stock span').innerText;
        //     }
        // });

        var page_error, brand, name, number, style, gender, retail, price, desc, attr, war, img;
        setTimeout(async () => {
            page_error = page.$('div.container404').then(res => {
                console.log(res);
            });

            brand = await page.evaluate(() => document.querySelector('.brand-name').innerText);
            
            name = await page.evaluate(() => document.querySelector('span.product-name').innerText);
            name1 = name;
            
            number = await page.evaluate(() => document.querySelector('span.product-ids').innerText);
            number = number.split('.');
            number = number[1];

            name = brand + number + " " +name;
            
            //style = await page.evaluate(() => document.querySelector('span#Style').innerText);
            
            gender = await page.evaluate(() => document.querySelector('#Gender').innerText);
            
            retail = await page.evaluate(() => document.querySelector('.pdp-retail-price span').innerText);
            
            price = await page.evaluate(() => document.querySelector('span#final-price').innerText);
            
            desc = await page.evaluate(() => document.querySelector('div.product-description').innerHTML);
            desc = desc.trim();

            attr = await page.evaluate(() => document.querySelector('div.product-attributes').innerHTML);
            attr = attr.trim();
            attr = attr.replace(/\n/g, " ");

            if (attr.indexOf('id="Style"') > -1) {
                console.log("yyyyyyyyyy");
                style = attr.split('id="Style"> ');
                style = style[1].split(" </span");
                style = style[0];
                //console.log(style);
                
            } else {
                //console.log("nnnnnnnnn");
            }

            war = '<div class="attribute-data"> <span class="data" id="Warranty"> <a href="/help-center/warranty" alt="Learn More about our Warranty"> 2 Year Jomashop Warranty </a> </span> </div>';
            attr = attr.replace(war, "");
            
            img = await page.evaluate(() => document.querySelector('div.MagicToolboxSelectorsContainer').innerHTML);
            //translate1();
            checkPage();
        }, (Math.floor(Math.random() * 11) + 15) *10)

        

        function checkPage() {
            translate1();
            // console.log("= =");
            // console.log(page_error);
            // if (page_error == undefined) {
            //     translate1();
            // } else {
            //     console.log("發現錯誤!!!!!!!!!!!!!!!!!!!");
            //     currentIndex++;
            //     scraping(currentIndex);
            // }
        }

       


        //img = img.split('href="');
        //img[1] = img[1].split(".jpg");

        var desc1;
        
        function translate1() {
            translate(desc, {from: 'en', to: 'zh-tw'}).then(res => {
                desc1 = res.text;
                translate2();        
            }).catch(err => {
                console.error(err);
            });
        }

        function translate2() {
            translate(name1, {from: 'en', to: 'zh-tw'}).then(res => {
                name1 = res.text;
                name1 = brand + number + " " + name1;
                imageHandler();
            }).catch(err => {
                console.error(err);
            });
        }
        




        console.log("--- 結果 ---")
        console.log(currentIndex);
        console.log("--- 結果 ---");

        // 照片搜尋處理
        var img1, img2, img3;
        async function imageHandler() {
            img = img.split('href="');
            img1 = img[1];
            if (img1 === undefined) {
                img = await page.evaluate(() => document.querySelector('div.MagicToolboxContainer').innerHTML);
                img = img.split('href="');
                img1 = img[1];
                img1 = img1.split(".jpg");
                img1 = img1[0] + ".jpg";
            } else {
                img1 = img1.split(".jpg");
                img1 = img1[0] + ".jpg";
            }
            console.log(img1);
            //img1 = img.split(".jpg");
            //img1 = img1[0];
            //console.log(img);
    
            var imgArray = [];
            for (i=1; i<img.length; i++) {
                if (img[i].indexOf("_2") > -1) {
                    console.log("_2 finded!");
                    img2 = img[i];
                    img2 = img2.split(".jpg");
                    img2 = img2[0] + ".jpg";
                    console.log(img2);
                } else if (img[i].indexOf("_3") > -1) {
                    console.log("_3 finded!");
                    img3 = img[i];
                    img3 = img3.split(".jpg");
                    img3 = img3[0] + ".jpg";
                    console.log(img3);
                }
            }
            createObj();
        }


        //let realImg1 = img[1][0]+".jpg";
        //let realImg2 = img[1][0]+"_2.jpg";
        //let realImg3 = img[1][0]+"_3.jpg";

        //

        function createObj() {
            function dataCons(index, link, img1 = 0, img2 = 0, img3 = 0, brand, name, name1, style, gender, retail, price, desc, desc1, attr) {
                this.time = getTime();
                //this.out = out_of_stock;
                this.index = index;
                this.link = link;
                this.img1 = img1;
                this.img2 = img2;
                this.img3 = img3;
                this.brand = brand;
                this.name = name;
                this.name1 = name1;
                this.style = style;
                this.gender = gender;
                this.retail = retail;
                this.price = price;
                this.desc = desc;
                this.desc1 = desc1;
                this.attr = attr;
            }

            let dataObj = new dataCons(data[currentIndex].index, data[currentIndex].link, img1, img2, img3, brand, name, name1, style, gender, retail, price, desc, desc1, attr);
            //writeIn(dataObj);
            saveImages(dataObj);

            fs.appendFileSync('18001-21000.json', JSON.stringify(dataObj, null, '\t')+",");

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
				'max-col': 20,
                'return-empty': true
                /*
                 * 此處的 cells 會回傳 undefined 有以下幾個原因
                 * 1. max-col - min-col 的值與表單實際行數不符
                 */
			},	function(err, cells) {

                console.log("getting cells");
                //console.log(cells);

                cells[0].setValue(getTime(), null);
                if (dataObj.name.indexOf("Watch") == -1) {
                    cells[1].setValue("*", null);
                }
                cells[2].setValue(dataObj.index, null);
                cells[3].setValue(dataObj.link, null);
                if (dataObj.img1 !== 0) {
                    cells[4].setValue(dataObj.img1, null);
                    cells[5].setValue(dataObj.index+"_1.jpg", null);
                }
                if (dataObj.img2 !== 0) {
                    cells[6].setValue(dataObj.img2, null);
                    cells[7].setValue(dataObj.index+"_2.jpg", null);
                }
                if (dataObj.img3 !== 0) {
                    cells[8].setValue(dataObj.img3, null);
                    cells[9].setValue(dataObj.index+"_3.jpg", null);
                }
                cells[10].setValue(dataObj.brand, null);
                cells[11].setValue(dataObj.name, null);
                cells[12].setValue(dataObj.name1, null);
                cells[13].setValue(dataObj.style, null);
                cells[14].setValue(dataObj.gender, null);
                cells[15].setValue(dataObj.retail, null);
                cells[16].setValue(dataObj.price, null);
                cells[17].setValue(dataObj.desc, null);
                cells[18].setValue(dataObj.desc1, null);      
                cells[19].setValue(dataObj.attr, null);

                // _currentIndex++;
                // scraping(_currentIndex);
            });
            
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
    });
}

function saveImages(dataObj) {
    const productDir = "D:/Jomashop/";
    if (dataObj.img1 !== 0) {
        request(dataObj.img1).pipe(fs.createWriteStream(productDir+dataObj.index+"_1.jpg"));
    }
    if (dataObj.img2 !== 0) {
        request(dataObj.img2).pipe(fs.createWriteStream(productDir+dataObj.index+"_2.jpg"));
    }
    if (dataObj.img3 !== 0) {
        request(dataObj.img3).pipe(fs.createWriteStream(productDir+dataObj.index+"_3.jpg"));
    }
}