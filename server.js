const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const path = require('path');
const fs = require('fs');

const app = new Koa();
app.use(cors());

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
      return await next();
    }
    const headers = {
      'Access-Control-Allow-Origin': '*',
    };
    if (ctx.request.method !== 'OPTIONS') {
      ctx.response.set({
        ...headers
      });
      try {
        return await next();
      } catch (e) {
        e.headers = {
          ...e.headers,
          ...headers
        };
        throw e;
      }
    }
    if (ctx.request.get('Access-Control-Request-Method')) {
      ctx.response.set({
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, PUD, DELETE, PATCH',
      });
      if (ctx.request.get('Access-Control-Request-Headers')) {
        ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
      }
      ctx.response.status = 204;
    }
  });

  app.use(koaBody({
    urlencoded: true,
    multipart: true,
  }));
  
  let precipitation = '';
  let temperature = '';


    fs.readFile('./data/precipitation.json', (err, fd) => {
        precipitation=JSON.parse(fd)
    })
    fs.readFile('./data/temperature.json', (err, fd) => {
        temperature=JSON.parse(fd)
    })


const router = new Router();
router.get('/precipitation', async (ctx, next) => {
      ctx.response.body = precipitation;
});
router.get('/temperature', async (ctx, next) => {
    ctx.response.body = temperature;
});


app.use(router.routes())
app.use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
server.listen(port);