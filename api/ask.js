
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { message } = req.body;

  try {
    const thread = await openai.beta.threads.create();
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_Ad3sjvxGa87WX0rTnJn1nPlF",
      instructions: "Recomandă cele mai bune unelte AI în funcție de nevoia utilizatorului."
    });

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    let result;
    while (true) {
      const status = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (status.status === "completed") {
        result = await openai.beta.threads.messages.list(thread.id);
        break;
      } else if (status.status === "failed") {
        throw new Error("Run failed.");
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    const reply = result.data.find(m => m.role === "assistant").content[0].text.value;
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
