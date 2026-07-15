import { parse } from 'node:url';
import { routes } from '../routes/index.js';
import { handleError, notFound } from '../middleware/errorHandler.js';

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

    req.on('data', (chunk) => {
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

  rawRes.setHeader('Access-Control-Allow-Origin', '*');
  rawRes.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  rawRes.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    req.body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readJsonBody(req) : {};
    await route.handler(req, res);
  } catch (error) {
    handleError(error, req, res);
  }
}
