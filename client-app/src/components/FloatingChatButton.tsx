export default function FloatingChatButton() {
  return (
    <button
      onClick={() => {
        alert("Chat launching soon...");
      }}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-black px-5 py-3 text-white shadow-lg"
    >
      Maya
    </button>
  );
}
