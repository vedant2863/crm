import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketServer } from "./src/lib/socket/server";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "/", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  initSocketServer(server);

  server.listen(port, () => {
    console.log(`> CRM OS server listening on port ${port} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
    console.log(`> Socket.io ready on route /api/socket/io`);
  });
});
