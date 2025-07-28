const {CronJob} = require("cron")

const jobs = new CronJob('* * * * * *',()=>{
    console.log("cron job start")
})

module.exports = jobs