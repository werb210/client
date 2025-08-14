import type { Request, Response, NextFunction } from "express";

const REPLIT_ANCESTORS = ["'self'","https://replit.com","*.replit.com","*.replit.dev","*.id.repl.co"];

/** Dev-only: block any attempt to set X-Frame-Options and ensure frame-ancestors allows Replit */
export function devIframeHeaderKiller(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "production") return next();

  // 1) Monkey-patch setHeader so later middleware can't add X-Frame-Options
  const origSetHeader = res.setHeader.bind(res);
  res.setHeader = (name: string, value: any) => {
    if (String(name).toLowerCase() === "x-frame-options") return res; // swallow
    return origSetHeader(name, value);
  };

  // 2) On writeHead, purge any stray XFO and ensure CSP has frame-ancestors
  const origWriteHead = res.writeHead.bind(res);
  res.writeHead = function (statusCode: number, statusMessage?: string | any, headers?: any) {
    res.removeHeader("X-Frame-Options");
    const existing = String(res.getHeader("Content-Security-Policy") || "");
    const fa = "frame-ancestors " + REPLIT_ANCESTORS.join(" ") + ";";
    if (!existing) res.setHeader("Content-Security-Policy", fa);
    else if (!/frame-ancestors/i.test(existing)) res.setHeader("Content-Security-Policy", `${existing.trim()} ${fa}`);
    return origWriteHead.call(this, statusCode, statusMessage, headers);
  };

  next();
}