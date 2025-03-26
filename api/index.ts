import express, { Express, Request, Response } from "express";
import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT;

// Initialize Bot Instance
const bot = new TelegramBot(TOKEN, {webHook: true});
process.env.NTBA_FIX_350 = "true";

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});

// Initialize Webhook
const app: Express = express();
app.use(express.json())

async function sleep(delay: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}

app.get("/", async (req, res) => {
    res.send("Express on Vercel")
});

app.get("/setwebhook", async (req, res) => {
    const baseUrl = `https://${req.hostname}`;
    try{
        await bot.deleteWebHook();
        await bot.setWebHook(`${baseUrl}/fetch-updates`);
        res.status(200).send({
            error: null,
            message: `Webhook successfully set to ${baseUrl}`
        })
    } catch (err) {
        res.status(500).send({
            error: err,
            message: `Webhook failed to set to ${baseUrl}`
        });   
    }
})

app.get("/delwebhook", async (req, res) => {
    const baseUrl = `https://${req.hostname}`;
    try{
        await bot.deleteWebHook();
        res.status(200).send({
            error: null,
            message: `Webhook successfully delete from ${baseUrl}`
        })
    } catch (err) {
        res.status(500).send({
            error: err,
            message: `Webhook failed to delete from ${baseUrl}`
        });   
    }
})

app.post("/fetch-updates", async (req, res) => {
    const baseUrl = `https://${req.hostname}`;
    const localUrl = `http://localhost:3000`;
    try {
        await axios.post(baseUrl + "/process-updates", req.body,{
            timeout: 500
        });
    } catch (err) {
    }
    res.status(200).send({error: null, data: req.body});
})

app.post("/process-updates", async (req, res) => {
    try {
        await new Promise<void>((resolve, reject) => {
            bot.processUpdate(req.body);

            setTimeout(() => {
                console.log("Resolved");
                console.log(req.body);

                resolve();
            }, 10000);
        });
    } catch (err) {
        res.status(200).send({
            error: err,
            data: req.body
        });   
    }
    res.status(200).send({error: null, data: req.body});
})

app.listen(PORT, () => { 
    console.log(`Server ready on port ${PORT}.`)
});

module.exports = app;
