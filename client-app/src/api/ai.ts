import axios from "axios";

export const ai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAIKey(key: string) {
  ai.defaults.headers.common["Authorization"] = `Bearer ${key}`;
}

export const AIChat = {
  ai,
  async sendMessage(assistantId: string, threadId: string, text: string) {
    const msg = await ai.post(
      `/assistants/${assistantId}/threads/${threadId}/messages`,
      { role: "user", content: text }
    );

    await ai.post(`/assistants/${assistantId}/threads/${threadId}/runs`, {});

    // Poll for completion
    let result;
    while (true) {
      const res = await ai.get(
        `/assistants/${assistantId}/threads/${threadId}/messages`
      );
      const messages = res.data.data;
      const last = messages.find((m: any) => m.role === "assistant");
      if (last) {
        result = last;
        break;
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    return result;
  },
};
