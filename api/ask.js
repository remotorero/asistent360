const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { message } = req.body;

  try {
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_Ad3sjvxGa87WX0rTnJn1nPlF",
    });

    let completed = false;
    let responseText = "Nu am primit un răspuns de la asistent.";

    while (!completed) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

      if (runStatus.status === "completed") {
        completed = true;
        const messages = await openai.beta.threads.messages.list(thread.id);
        const last = messages.data.find((msg) => msg.role === "assistant");
        responseText = last?.content[0]?.text?.value || responseText;
      } else if (runStatus.status === "failed") {
        throw new Error("Asistentul a eșuat.");
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    res.status(200).json({ reply: responseText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare server: " + err.message });
  }
};
