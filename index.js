import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", (req, res) => {
  res.send("API TopBRS funcionando 🚀");
});

app.get("/player/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "%23");

  const response = await fetch(`https://api.clashroyale.com/v1/players/${tag}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLASH_API_KEY}`
    }
  });

  const data = await response.json();
  res.json(data);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
