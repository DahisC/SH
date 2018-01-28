const puppeteer = require('puppeteer');
const fs = require('fs');

puppeteer.launch({headless: false}).then(async browser => {
    
    var itemArray = [];
    var results;
    
    const page = await browser.newPage();
    scraping(1);

    async function scraping(currentPage) {
        await page.goto('https://www.jomashop.com/watches.html?p='+currentPage);
        await page.waitForSelector('li.item', {visible: true});

        const ITEM_INFO = 'li.item';
        const ITEM_BLOCK = 'li.item .product-name';

        var items = await page.evaluate((itemInfo, itemBlock) => {
        
            return Array.prototype.slice.apply(document.querySelectorAll(itemInfo)).map(($itemList) => {
                const block = $itemList.querySelector(itemBlock).innerHTML;
                return block;
            });

        }, ITEM_INFO, ITEM_BLOCK);

        if (items !== undefined) {
            let array = await items.map(async (item) => {

                //console.log(item);

                // Seksy: <a[^>]+href=\"(.*?)\"[^>]*>
                let REGEXP_LINK = RegExp('<a[^>]+href=\"(.*?)\"[^>]*>', 'g');
                let link = REGEXP_LINK.exec(item);
                //console.log("result: "+link[1]);

                //let REGEXP_NAME = RegExp('^<.*title="(.*)\".onclick.*', 'g');
                //let name = REGEXP_NAME.exec(item);
                //console.log("name: "+name[1]);

                function ItemData(link) {
                    this.link = link;
                }

                let itemObj = new ItemData(link[1]);

                itemArray.push(itemObj);
                //fs.writeFileSync("result.json", link[1]);

                return 0;
            });


            var time = await getTime();
            // console.log(time);

            console.log("---------------");
            console.log("Page :"+currentPage);
            console.log("Item :"+itemArray.length);
            console.log("---------------");

            //console.log(itemArray[itemArray.length-1]);

            fs.writeFileSync('itemData.json', JSON.stringify(itemArray));
            
            currentPage++;
            items = undefined;
            scraping(currentPage);
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