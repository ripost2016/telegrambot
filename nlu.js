const TelegrafWit = require('telegraf-wit');
const Promise = require('bluebird');

const wit = new TelegrafWit('UMNBVSVRQWDCYSS7OBU4WVJUOQV6M5LX');

module.exports = (message) => {
    return new Promise((resolve, reject) => {
        wit.meaning(message.text).then(res => {
            console.log(res.entities.intent);
            message.nlu = res;
            resolve(message);
        })
    });
}