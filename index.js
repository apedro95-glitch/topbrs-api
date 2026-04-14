export default async function handler(req, res) {
  const { tag } = req.query;

  if (!tag) {
    return res.status(400).json({ error: "Tag não informada" });
  }

  try {
    const formattedTag = encodeURIComponent(tag.toUpperCase());

    const response = await fetch(`https://api.clashroyale.com/v1/players/${formattedTag}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_API_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: "Jogador não encontrado" });
    }

    const data = await response.json();

    return res.status(200).json({
      name: data.name,
      tag: data.tag,
      trophies: data.trophies,
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao consultar API" });
  }
}
