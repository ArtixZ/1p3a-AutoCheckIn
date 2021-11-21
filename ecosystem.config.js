module.exports = {
  apps : [{
    script: 'app.js',
    watch: false,
    cron_restart: "0 13 * * *",
    restart_delay: '300000'
  }]
};
