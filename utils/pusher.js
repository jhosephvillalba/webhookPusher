const Pusher = require("pusher");

const pusher = new Pusher({
    appId: "1902644",
    key: "f0aa4fbac39a8ca505d8",
    secret: "4ea1e09faa0ebee753bb",
    cluster: "us2",
    useTLS: true
  });
  

module.exports = pusher;
