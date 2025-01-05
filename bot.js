const { Telegraf, Scenes, session } = require('telegraf');

const { start } = require('./commands.js');


const {student_schedule, discipline_schedule} = require("./commands");

const { StudentScheduleInput, DisciplineScheduleInput } = require('./Scenes.js');


function setupBot(){
    const bot = new Telegraf(process.env.BOT_TOKEN);

    const stage = new Scenes.Stage([StudentScheduleInput, DisciplineScheduleInput]);

    bot.use(session()); // for scenes
    bot.use(stage.middleware()); // for scenes

    bot.start(start);
    bot.hears('Student Schedule', student_schedule); //for student schedule
    bot.hears('Discipline Schedule', discipline_schedule);

    bot.hears('sigma', (ctx) => {
        console.log(ctx);
        ctx.react('🗿');
    });



    return bot;

}
module.exports = {
    setupBot
}