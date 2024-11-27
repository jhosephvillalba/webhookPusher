const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const pusher = require("../utils/pusher");

const router = express.Router();

router.post("/send-event", async (req, res) => {
    const { userId } = req.body;
  
    try {
      await pusher.trigger("user-channel", "client-user_request", {
        userId
      });
  
      res.status(200).json({ message: "Evento enviado a Pusher" });
    } catch (error) {
      console.error("Error al enviar el evento a Pusher:", error.message);
      res.status(500).json({ message: "Error al enviar el evento" });
    }
  });

// Ruta para recibir webhooks de Pusher
router.post("/pusher", async (req, res) => {
  const webhookSignature = req.headers["x-pusher-signature"];
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", process.env.SECRET || "APP_SECRET")
    .update(body)
    .digest("hex");

  if (webhookSignature === expectedSignature) {
    console.log("Firma válida, evento recibido:", req.body);

    for (const event of req.body.events) {
      if (event.name === "client-user_request") {
        const userId = event.data.userId;

        try {
          const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
          const user = response.data;

          // Enviar la respuesta de vuelta al cliente
          await pusher.trigger("user-channel", "user_response", {
            name: user.name,
            email: user.email
          });

          console.log(`Enviando información del usuario ${userId} a Pusher.`);
        } catch (error) {
          console.error("Error al obtener el usuario:", error.message);
        }
      }
    }

    res.status(200).send("Evento procesado correctamente");
  } else {
    console.log("Firma inválida, evento rechazado");
    res.status(401).send("Firma inválida");
  }
});

module.exports = router;
