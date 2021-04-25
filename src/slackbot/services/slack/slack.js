const IncomingWebhook = require('@slack/client').IncomingWebhook;

class Webhook {
  constructor (webhook) {
    this.hook = new IncomingWebhook(webhook);
  }
  send (attachments) {
    return new Promise((resolve, reject) => {
      this.hook.send({attachments: attachments}, function(err, header, statusCode, body) {
        if (err) {
          reject({
            error: err
          })
        } else if(statusCode != 200) {
          reject({
            error: new Error(`Got status code ${statusCode} when posting ${JSON.stringify(attachments)}. Error: ${err}. Body: ${body}`),
            statusCode: statusCode
          })
        } else {
          resolve({ 'ok': true })
        }
      });
    })
  }
}

export {
  Webhook
}
