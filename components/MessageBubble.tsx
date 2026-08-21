import ReactMarkdown from "react-markdown";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-paper"
            : "max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-white px-4 py-2.5 text-ink"
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown>{content || " "}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
