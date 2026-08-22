declare module 'xss-clean' {
  import { ErrorRequestHandler } from 'express';
  function xss(): ErrorRequestHandler;
  export = xss;
}
