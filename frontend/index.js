(function () {
  const myServerHost = 'http://127.0.0.1:3001'
  const pushServerPublicKey = 'BP4lTBmdYr6eS8VDgQ8CjdTHRWfKymIWJajaDNdlPzHJcSd5_AawRDNyPR4yfX_cCKCOE3bW1lQDND8QaF3SukE'

  const updateButtonStatus = (result) => {
    console.log('[Notification.requestPermission]', result)
    if (result === "granted") {
      //enable push notification subscribe button
      btnCreateSubscription.disabled = false;
    } else {
      // btnSendPushNotification.disabled = true;
      btnCreateSubscription.disabled = true;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    btnAskPermission.disabled = true
    btnCreateSubscription.disabled = true
    btnSendToYourServer.disabled = true
    btnSendPushNotification.disabled = true
    btnCancelSubscription.disabled = true

    // checks if Push notification and service workers are supported by your browser
    if ("serviceWorker" in navigator && "PushManager" in window) {
      btnAskPermission.disabled = false

      updateButtonStatus(Notification.permission)

      // register the service worker: file "sw.js" in the root of our project
      navigator.serviceWorker.register("/sw.js").then(function (swRegistration) {
        //you can do something with the service worker registration (swRegistration)
        console.log('swRegistration', swRegistration)
      });

      // getUserSubscription().then(function(subscrition) {
      //   if (subscrition) {
      //     showUserSubscription(subscrition);
      //   }
      // });
    } else {
      console.log('ServiceWorker is not support in current browser! You may need a https domain')
    }


    btnAskPermission.addEventListener('click', () => {
      // Best practice is: let user click button to trigger permission prompt
      Notification.requestPermission(function (result) {
        updateButtonStatus(result)
      });
    })

    let _subscription
    btnCreateSubscription.addEventListener('click', () => {
      //wait for service worker installation to be ready, and then
      return navigator.serviceWorker.ready.then(function (serviceWorker) {
        // subscribe and return the subscription
        console.log('Subscribing...')
        return serviceWorker.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: pushServerPublicKey
          })
          .then(function (subscription) {
            btnCancelSubscription.disabled = false
            console.log("Subscribe success!", JSON.stringify(subscription));

            // Get public key and user auth from the subscription object
            // var key = subscription.getKey ? subscription.getKey('p256dh') : '';
            // var auth = subscription.getKey ? subscription.getKey('auth') : '';

            // console.log(JSON.stringify({
            //   endpoint: subscription.endpoint,
            //   // Take byte[] and turn it into a base64 encoded string suitable for
            //   // POSTing to a server over HTTP
            //   key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : '',
            //   auth: auth ? btoa(String.fromCharCode.apply(null, new Uint8Array(auth))) : ''
            // }))

            _subscription = subscription
            btnSendToYourServer.disabled = false
          }).catch(e => {
            console.error('[subscribe]', e)
          })
      });
    })

    let _sid
    btnSendToYourServer.addEventListener('click', () => {
      console.log('Sending subscription data to your server...')
      axios.post(`${myServerHost}/subscription`, _subscription).then(({ data }) => {
        console.log('[btnSendToYourServer]', data)

        btnSendPushNotification.disabled = false
        _sid = data.id
      })
    })

    btnSendPushNotification.addEventListener('click', () => {
      console.log('Sending notification...')
      axios.get(`${myServerHost}/subscription/${_sid}`).then(({ data }) => {
        console.log('[btnSendPushNotification]', data)
      })
    })

    btnCancelSubscription.addEventListener('click', () => {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((subscription) => {
          subscription.unsubscribe().then((successful) => {
            console.log("You've successfully unsubscribed", successful)
          }).catch((e) => {
            console.log('Unsubscribing failed', e)
          })
        })
      });
    })

  })

})()