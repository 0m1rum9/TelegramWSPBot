require('dotenv').config({path: './config/.env'});

const { setupBot } = require('./bot.js');

function launchBot(){
    try{
        setupBot().launch();
    }
    catch(error){
        console.log(error);
    }
}
launchBot();