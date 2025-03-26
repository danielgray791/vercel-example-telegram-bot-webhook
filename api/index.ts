import { botInstance } from './handler/bot';
import express, { Express, Request, Response } from "express";
import axios from 'axios';

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
        await botInstance.deleteWebHook();
        await botInstance.setWebHook(`${baseUrl}/fetch-updates`);
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
        await botInstance.deleteWebHook();
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
            botInstance.processUpdate(req.body);

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

app.listen(3000, () => { 
    console.log("Server ready on port 3000.")
});

module.exports = app;
