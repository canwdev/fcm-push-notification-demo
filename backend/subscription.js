const subscriptions = {};
const webpush = require('web-push');
var md5 = require("crypto-js/md5");

const vapidKeys = {
  privateKey: 'DLB-AQRjO77jLwqEa9ks7bdWi_WyfXLm3iqV21RG2nw',
  publicKey: 'BP4lTBmdYr6eS8VDgQ8CjdTHRWfKymIWJajaDNdlPzHJcSd5_AawRDNyPR4yfX_cCKCOE3bW1lQDND8QaF3SukE',
};

webpush.setVapidDetails("mailto:example@yourdomain.org", vapidKeys.publicKey, vapidKeys.privateKey);


function createHash(input) {
  return md5(Buffer.from(input)).toString();
}

const handleSubscription = (req, res) => {
  const subscriptionRequest = req.body;
  const sid = createHash(JSON.stringify(subscriptionRequest));
  subscriptions[sid] = subscriptionRequest;
  console.log('[handleSubscription]', sid)
  res.status(201).json({ message: 'Subscribed!', id: sid });
}

const sendPushNotification = async (req, res) => {
  try {

    const sid = req.params.id;
    const pushSubscription = subscriptions[sid];
    console.log('sending notification...', sid)
    const pRes = await webpush
      .sendNotification(
        pushSubscription,
        JSON.stringify({
          title: "Hello, world! Test Title.",
          text: "You got a new message!",
          image: "https://via.placeholder.com/200x200/E60033/FFFFFF/?text=NOTIFICATION",
          tag: "Test Tag",
          url: "https://bing.com"
        })
      )

    console.log(pRes)

    res.status(202).json({});
  } catch (e) {
    console.error(e)
    res.status(500).json(e)
  }
}

module.exports = {
  handleSubscription,
  sendPushNotification
}