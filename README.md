# Telegram Stickers API

This is basically a wrapper around the Telegram Bot API that only provides access to sticker data.

It aggressively caches sticker image data both on-disk and in the `Cache-Control` header, both to save requests to Telegram and to save requests from clients.

It is suitable for public use -- no API tokens are required.

## Features

- Public sticker API
- Gives in .webp format
- Aggressive file caching for fast response times
- Pre-set CORS headers -- use it in client-side JS immediately

## Usage

Create `config.json`:

```json
{
  "BOT_TOKEN": "<YOUR_BOT_TOKEN>",
  "CACHE_TIME": 3600
}
```

Then:

```shell
npm install
node index
```

In production, you can use environment variables instead of `config.json`.

Then, simply use these endpoints:

```
GET https://oni-chan-unique-api.vercel.app/telesticker?url=
```

Examples:
- https://oni-chan-unique-api.vercel.app/telesticker?url=https://t.me/addstickers/CenterOfEmoji14132840

## Docker

A `Dockerfile` is included in this repo, but prebuilt images are available:

```
docker pull tjhorner/tstickers-api:latest
```

For your reference, a sample `docker-compose.yml` is also included.
