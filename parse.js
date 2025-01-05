const puppeteer = require('puppeteer');

const { PrettierWSP } = require('./PrettierWSP.js');

require('dotenv').config({path: './config/.env'});

async function delay(ms){
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function GetUserSchedule(login ,password) {
   try{
       const browser = await puppeteer.launch({headless: false});
       const page = await browser.newPage();

       await page.setViewport({width: 1920, height: 1080})

       await page.goto('https://wsp.kbtu.kz/StudentSchedule'); // url for students schedule

       // await new Promise(resolve => setTimeout(resolve, 1000));
       await delay(1000);

       await page.locator('#gwt-uid-4').fill(login); //input-field for login

       await delay(100);

       await page.locator('#gwt-uid-6').fill(password); //input-field for password

       await page.click('div.v-button.v-widget.primary.v-button-primary'); //Enter button

       await page.waitForNavigation();

       await delay(1000);

       await page.evaluate(PrettierWSP);

       await page.screenshot({path: 'student_schedule.png'});

       await browser.close();
       return true;
   }
   catch(error){
       console.log(error);
       return false;
   }
}

async function GetDisciplineSchedule(code, school, year, period){
    const browser = await puppeteer.launch({headless: false});  const page = await browser.newPage();
    try{
    const periods = {
        'Весенний': 3,
        'Осенний': 2,
        'Летний 1': 4,
        'Летний 2': 5,
        'Летний 3': 6,
        'Зимний': 7
    };
    const schools = {
        'ШИТиИ': 'Школа информационных технологий и инженерии',
        'ШПМ': 'Школа прикладной математики',
        'ШСН': 'Школа социальных наук',
        'МШЭ': 'Международная Школа Экономики',
        'ШМиЗТ': 'Школа материаловедения и зеленых технологий',
        'ШХИ': 'Школа химической инженерии',
        'ШЭиНИ': 'Школа энергетики и нефтегазовой индустрии',
        'КМА': 'Казахстанская морская академия',
        'БШ': 'Бизнес Школа'
    }
    await page.setViewport({width: 1920, height: 1080})
    await page.goto('https://wsp.kbtu.kz/SubjectSchedule'); // url for discipline schedule
    await page.locator('#gwt-uid-4').fill(process.env.WSP_LOGIN); //input-field for login
    await delay(100);
    await page.locator('#gwt-uid-6').fill(process.env.WSP_PASSWORD); //input-field for password
    await page.click('div.v-button.v-widget.primary.v-button-primary'); //Enter button
    await page.waitForNavigation();
    await delay(1000); // waiting for page to load

    await page.locator('#gwt-uid-4').fill(code); //code
    await delay(500);

    await page.locator('#gwt-uid-14').fill(year) // year
    await delay(100);
    await page.focus('#gwt-uid-14');
    await page.keyboard.press('Enter');
    await delay(100);

    await page.locator('#gwt-uid-12').fill(schools[school]);
    await delay(100);
    await page.focus('#gwt-uid-12');
    await page.keyboard.press('Enter');
    await delay(100);

    await page.focus('#gwt-uid-16');

    await page.click('#gwt-uid-16');


    await page.locator('#gwt-uid-16').fill('');

    let i = periods[period];
    while(i--){
        await page.keyboard.press('ArrowDown');
        await delay(100);
    }

    await page.keyboard.press('Enter');

    await delay(100);

    await page.click('button.v-nativebutton.v-widget');

    await delay(1000);


        await page.click('.v-table-row'); //click on discipline
        await page.click('img[src="https://wsp.kbtu.kz/VAADIN/themes/r5/img/button/schedule.png"]'); // click to unveil schedule
        await delay(100);

        await page.evaluate(PrettierWSP); // make WSP Schedule prettier

        await delay(100);
        await page.screenshot({path: 'discipline_schedule.png'});
        await delay(100);

        await browser.close();

        return true;
    }
    catch(error){
        console.log(error);
        await browser.close();
        return false;
    }

}
module.exports ={
    GetUserSchedule,
    GetDisciplineSchedule
}