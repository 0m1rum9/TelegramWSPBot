const { Markup } = require('telegraf');
start = (ctx) => {
    ctx.reply(
        "Hello, i'm WSP bot",
        Markup.keyboard([
            ["Student Schedule"],
            ["Discipline Schedule"]
        ]).resize().oneTime()
        );
}

student_schedule = async(ctx) => {
    ctx.scene.enter('StudentScheduleInput');
}
discipline_schedule = async(ctx) => {
    ctx.scene.enter('DisciplineScheduleInput');
}





module.exports = {
    start,
    student_schedule,
    discipline_schedule
}