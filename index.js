var config
try {
  config = require('./config.json')
} catch(e) {
  config = process.env
}

const path = require('path')

const Telegram = require('node-telegram-bot-api')
const bot = new Telegram(config.BOT_TOKEN, { polling: false })

const express = require('express')
const app = express()

const HttpImageCache = require('./lib/HttpImageCache')
const cache = new HttpImageCache(path.join(__dirname, "cache"), parseInt(config.CACHE_TIME))

const cacheControl = require('express-cache-controller')

const cors = require('cors')

const cachedLinks = { }

app.use(cacheControl())
app.use(cors())


const { URL } = require('url');

app.get("/telesticker", async (req, res) => {
  const stickerSetUrl = req.query.url;

  if (!stickerSetUrl) {
    res.status(400).send({ error: "URL parameter 'url' is required." });
    return;
  }

  const parsedUrl = new URL(stickerSetUrl);
  const name = parsedUrl.pathname.split('/').pop();

  var packRaw;

  try {
    packRaw = await bot.getStickerSet(name);
  } catch(e) {
    res.status(500).send({ error: "Something bad happened. Try again later." });
    return;
  }

  res.cacheControl = {
    maxAge: 120,
    public: true
  };

  var pack = {
    name: packRaw.title,
    masks: packRaw.contains_masks,
    stickers: packRaw.stickers.map(sticker => `http://localhost:3000/sticker/${sticker.file_id}.webp`)
  };

  res.send(pack);
});

app.get("/sticker/:id.webp", async (req, res) => {
  var stickerWebp;

  try {
    const stickerUrl = cachedLinks[req.params.id] || (cachedLinks[req.params.id] = await bot.getFileLink(req.params.id));
    stickerWebp = await cache.getImage(stickerUrl);
  } catch(e) {
    res.setHeader("Content-Type", "image/jpeg");
    res.status(500);
    res.sendFile(path.join(__dirname, "static", "500.jpg"));
    return;
  }

  res.cacheControl = {
    maxAge: parseInt(config.CACHE_TIME),
    public: true
  };

  res.setHeader("Content-Type", "image/webp");
  res.send(stickerWebp);
});

app.listen(process.env.PORT || 3000)