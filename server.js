const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");

const users = require("./routes/api/users");
const beneficiarios = require("./routes/api/beneficiarios");
const compra = require("./routes/api/compra");
const configuracion = require("./routes/api/configuracion");
const tiposIdentificacion = require("./routes/api/tiposIdentificacion");

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
  /*//connection is up, let's add a simple simple event
  ws.on("message", message => {
    //log the received message and send it back to the client
    console.log("received: %s", message);
    ws.send(`Hello, you sent -> ${message}`);
  });

  //send immediatly a feedback to the incoming connection
  ws.send("Hi there, I am a WebSocket server");*/
  const watcher = fs.watch("./TCP-IP/IOFile/out", (eventType, filename) => {
    if (filename) {
      console.log(filename);
      console.log(eventType);
      fs.readFile("./TCP-IP/IOFile/out/dataf001_OUT.eft", "utf8", function(
        err,
        contents
      ) {
        if (!err) {
          //borrar archivo
          fs.unlink("./TCP-IP/IOFile/out/dataf001_OUT.eft", err => {
            if (err) {
              console.log("Error borrando archivo", err);
            }
          });
          if (contents) {
            console.log(contents);
            const resultadoTransaccion = contents.split(",");
            console.log("Resultado:", resultadoTransaccion[0]);
            switch (resultadoTransaccion[0]) {
              case "00":
                //compra exitosa
                ws.send(
                  JSON.stringify({
                    message: `La compra ha sido exitosa con el número de aprobación ${
                      resultadoTransaccion[1]
                    }`,
                    pagoExitoso: true,
                    numeroAprobacion: resultadoTransaccion[1]
                  })
                );
                break;
              case "02":
                //Transacción Rechazada
                ws.send(
                  JSON.stringify({
                    message: `La compra NO se ha realizado. Fue rechazada por su entidad bancaria o cancelada manualmente.`,
                    pagoExitoso: false
                  })
                );
                break;
              case "03":
                //Error comunicación datafono o tiempo de espera
                ws.send(
                  JSON.stringify({
                    message: `Se presentó un error en la operación del datafono, por favor cancele la transacción e inicie de nuevo.`,
                    pagoExitoso: false
                  })
                );

                break;
              case "05":
                //Error comunicación datafono o tiempo de espera
                ws.send(
                  JSON.stringify({
                    message: `La compra NO se ha realizado. Ha tardado mucho tiempo en iniciar la compra en el datafono.`,
                    pagoExitoso: false
                  })
                );
                break;
              default:
                //Comportamiento no esperado
                ws.send(
                  JSON.stringify({
                    message: `La compra NO se ha realizado. Se ha presentado un error inesperado en el Datafono, por favor intente de nuevo.`,
                    pagoExitoso: false
                  })
                );
                break;
            }
          }
        }

        /*ws.send(
          `Accion: ${eventType} en archivo ${filename} con contenido: ${contents}`
        );*/
      });

      // Prints: <Buffer ...>
    }
  });
  ws.on("close", () => {
    console.log("Cerro Socket");
    watcher.close();
  });
});

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//db config
const db = require("./config/keys").mongoURI;

// Connect to mongodb
/*mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));*/

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//use routes
app.use("/api/users", users);
app.use("/api/beneficiarios", beneficiarios);
app.use("/api/compra", compra);
app.use("/api/configuracion", configuracion);
app.use("/api/tiposIdentificacion", tiposIdentificacion);

const port = process.env.port || 5000;

//start our server
server.listen(port, () => {
  console.log(`Server started on port ${port} :)`);
});

//app.listen(port, () => console.log(`server running on port ${port}`));
