const {Scenes, Markup} = require("telegraf");

const {GetUserSchedule, GetDisciplineSchedule} = require("./parse.js");


const DisciplineScheduleInput = new Scenes.BaseScene('DisciplineScheduleInput');
DisciplineScheduleInput.enter(ctx => {
    ctx.reply('Send me code of a Discipline');
    ctx.scene.state = {
        code: '',
        school: '',
        year: '',
        period: ''
    };
});
DisciplineScheduleInput.on('text', async(ctx) => {
    if(ctx.scene.state.code === '')
    {
        ctx.scene.state.code = ctx.message.text;
        ctx.reply('Send me school of a Discipline',
            Markup.keyboard(
                [
                'ШИТиИ', 'ШПМ', 'МШЭ', 'БШ', 'ШСН', 'ШМиЗТ', 'ШХИ', 'ШЭиНИ', 'КМА'
            ]
                ).resize().oneTime()
            );
    }
    else if(ctx.scene.state.school === ''){
        ctx.scene.state.school = ctx.message.text;
        ctx.reply('Send me year of a Discipline',
            Markup.keyboard([
                '2024-2025'
            ]).resize().oneTime()
        );
    }
    else if(ctx.scene.state.year === ''){
        ctx.scene.state.year = ctx.message.text;
        ctx.reply('Send me period of a Discipline',
            Markup.keyboard([
                'Весенний', 'Осенний', 'Летний 1', 'Летний 2', 'Летний 3', 'Зимний'
            ]).resize().oneTime()
        );
    }
    else{

        ctx.scene.state.period = ctx.message.text;

        ctx.reply('Wait, loading...');

        if(await GetDisciplineSchedule(ctx.scene.state.code, ctx.scene.state.school, ctx.scene.state.year, ctx.scene.state.period))
        {
            ctx.replyWithDocument(
                {
                    source: './discipline_schedule.png'
                }
            )
        }
        else
            ctx.reply('Invalid entries or the WSP is sleeping 🗿');


        ctx.scene.leave();
    }
})


const StudentScheduleInput = new Scenes.BaseScene('StudentScheduleInput');
StudentScheduleInput.enter((ctx) => {
    ctx.reply('Send me your Login');
    ctx.scene.state = {
        login: '',
        password: ''
    };
});

StudentScheduleInput.on('text', async(ctx) => {
    if(ctx.scene.state.login === ''){
        ctx.scene.state.login = ctx.message.text;
        ctx.reply('Send me your password');
    }
    else{
        ctx.scene.state.password = ctx.message.text;
        //
        if(await GetUserSchedule(ctx.scene.state.login, ctx.scene.state.password))
        {
            ctx.replyWithDocument(
            {
                source: './student_schedule.png'
            });
        }
        else
            ctx.reply('Invalid entries or the WSP is sleeping 🗿');

        ctx.scene.leave();
    }
});
module.exports = {
    StudentScheduleInput,
    DisciplineScheduleInput
}