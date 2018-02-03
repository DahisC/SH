var fs = require('fs');

var data;

fs.readFile("1-2500.json", (err, rawData) => {
    if (err) throw err;
    data = JSON.parse(rawData);
    for (i in data) {
        console.log(i);
    }
    //console.log(data);  
    //scraping(data);
});