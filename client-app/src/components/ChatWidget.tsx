import { useState, useEffect } from "react";
import { ClientAppAPI } from "../api/clientApp";
import { OfflineStore } from "../state/offline";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const cached = OfflineStore.load();
  const token = cached?.applicationToken;

  useEffect(() => {
    if (!token) return;
    ClientAppAPI.getMessages(token).then((res) => setMessages(res.data));
  }, [token]);

  async function send() {
    if (!token || !text.trim()) return;
    await ClientAppAPI.sendMessage(token, text);
    const res = await ClientAppAPI.getMessages(token);
    setMessages(res.data);
    setText("");
  }

  return (
    <div className="fixed bottom-4 right-4">
      <button
        className="bg-borealBlue text-white p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close Chat" : "Chat"}
      </button>

      {open && (
        <div className="bg-white border p-3 mt-2 w-80 h-96 overflow-y-auto shadow-xl">
          <div className="font-bold mb-2">Support Chat</div>

          <div className="mb-4">
            {messages.map((m, i) => (
              <div key={i} className="mb-2">
                <b>{m.from}</b>: {m.text}
              </div>
            ))}
          </div>

          <input
            className="border p-2 w-full mb-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="bg-borealBlue text-white p-2 w-full" onClick={send}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}
