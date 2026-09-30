import { parse } from 'node:url';
import { routes } from '../routes/index.js';
import { handleError, notFound } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const MAX_BODY_BYTES = 2 * 1024 * 1024; // photos are sent as data URLs, so leave headroom
const AUTH_RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

function compilePath(routePath) {
  const keys = [];
  const pattern = routePath
    .replace(/:[^/]+/g, (match) => {
      keys.push(match.slice(1));
      return '([^/]+)';
    });

  return {
    keys,
    regex: new RegExp(`^${pattern}$`)
  };
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(Object.assign(new Error('Request body too large.'), { statusCode: 413 }));
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error('Invalid JSON body.'), { statusCode: 400 }));
      }
    });

    req.on('error', reject);
  });
}

function createResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    }
  };
}

const preparedRoutes = routes.map((route) => ({
  ...route,
  ...compilePath(route.path)
}));

export async function requestHandler(req, rawRes) {
  const res = createResponse(rawRes);

  rawRes.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  rawRes.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  rawRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    rawRes.statusCode = 204;
    rawRes.end();
    return;
  }

  const { pathname } = parse(req.url);
  const route = preparedRoutes.find((candidate) => (
    candidate.method === req.method && candidate.regex.test(pathname)
  ));

  if (!route) {
    notFound(req, res);
    return;
  }

  try {
    const match = pathname.match(route.regex);
    req.params = Object.fromEntries(route.keys.map((key, index) => [key, match[index + 1]]));
    if (route.public) {
      rateLimit(`${pathname}:${req.socket.remoteAddress}`, AUTH_RATE_LIMIT);
    }
    req.body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readJsonBody(req) : {};
    if (!route.public) {
      authenticate(req);
    }
    await route.handler(req, res);
  } catch (error) {
    handleError(error, req, res);
  }
}
