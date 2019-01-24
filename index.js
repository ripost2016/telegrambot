const express = require('express');
const app = express();
const Telegraf = require('telegraf');
const request = require('request');
const nlu = require('./nlu');
const dialog = require('./dialog');
const googleTts = require('google-tts-api');

const bot = new Telegraf('789226276:AAH_6ruXQPtNBRYFpqRWaKoEzyB73pKFQtM');

app.use(bot.webhookCallback('/secret-path'));
bot.telegram.setWebhook('https://76bc399f.ngrok.io/secret-path');

// app.post('/secret-path', (req, res) => {
//   res.send('post desde el bot');
// });

app.get('/', (req, res) => {
    res.send('respuesta desde el bot');
});

bot.command('/weather', ctx => {
    let indice = ctx.message.text.indexOf(' ');
    let ciudad = ctx.message.text.substring(indice + 1);
    ciudad = ciudad.split(' ').join('+');

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${ciudad},ES&units=metric&appid=d9f2abfbec3ad3c7c4817814069c587e`;

    request(url, function (error, response, body) {
        // console.log(JSON.parse(body));
        if (error || JSON.parse(body).cod == '404') {
            bot.telegram.sendMessage(ctx.message.from.id, 'Lo siento, no tenemos resultados');
        } else {
            let datos = JSON.parse(body);
            let tiempo = `Temp min: ${datos.main.temp_min}°C Temp max: ${datos.main.temp_max}°C\nEstado: ${datos.weather[0].main} Descripción: ${
            datos.weather[0].description}`;
            // console.log(tiempo);
            bot.telegram.sendMessage(ctx.message.from.id, tiempo);
        }
    });
});

bot.command('/whereami', ctx => {
    let indice = ctx.message.text.indexOf(' ');
    let direccion = ctx.message.text.substring(indice + 1);

    if (indice !== -1) {
        let url = `https://geocode.xyz/${direccion}?json=1`;

        request(url, function (error, response, body) {
            if (error) {
                console.log(error);
                bot.telegram.sendMessage(
                    ctx.message.from.id,
                    'No se ha encontrado la dirección'
                );
            } else {
                let datos = JSON.parse(body);

                bot.telegram.sendMessage(
                    ctx.message.from.id,
                    `longitud: ${datos.longt} latitud: ${datos.latt}`
                );

                bot.telegram.sendPhoto(
                    ctx.message.from.id,
                    `https://maps.googleapis.com/maps/api/staticmap?center=${
            datos.latt
          },${
            datos.longt
          }&zoom=16&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C${
            datos.latt
          },${datos.longt}&key=AIzaSyD5h7iot54V6U35ggOGvW6MQGE1Zciune4`
                );
            }
        });
    } else {
        bot.telegram.sendMessage(
            ctx.message.from.id,
            'Me estás poniendo a prueba, dame una dirección válida'
        );
    }
});

bot.command('/hola', ctx => {
    ctx.reply('Muy buenas, soy Nedy, en qué te puedo ayudar??');
});

bot.command('/help', ctx => {
    ctx.reply('por ahora sólo tienes un comando => /hola');
});

bot.command('/creator', ctx => {
    ctx.reply('Somos el equipo menudo');
});

bot.on('text', (ctx) => {
    nlu(ctx.message)
        .then(dialog)
        .then(value => {
            googleTts(value, 'es', 1).then(url => {
                bot.telegram.sendAudio(ctx.from.id, url);
            })
            // bot.telegram.sendMessage(ctx.from.id, value);
        });
})


app.listen(3000, () => {
    console.log('escuchando en el puerto 3000...');
});