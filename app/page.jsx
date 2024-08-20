"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi, I'm the Abuakwa Pharmacy Support Agent, how can I assist you today?`,
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async function () {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    const reponse = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <main className="flex min-h-screen min-w-full flex-col items-center p-10 bg-slate-100">
      <div className="flex flex-col border-4 p-5 gap-2 rounded-2xl">
        <div className=" w-[600px] h-[700px] p-5 overflow-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat ${
                msg.role == "assistant" ? "chat-start" : "chat-end"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full shadow-md">
                  <Image
                    alt="ai-img"
                    quality={100}
                    width={8}
                    height={8}
                    unoptimized
                    className="object-fit"
                    src={`${msg.role == "assistant" ? "/ai.png" : "/user.png"}`}
                  />
                </div>
              </div>
              <div className="chat-header">
                {msg.role == "assistant" ? "Abuakwa AI Assistant" : ""}
              </div>
              <div
                className={`chat-bubble text-white ${
                  msg.role == "assistant" ? "chat-bubble-primary" : ""
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex p-2 gap-4 border-2 rounded-xl items-center">
          <input
            name="message"
            placeholder="message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            id=""
            className="bg-transparent w-full text-black focus:outline-none p-2"
          ></input>{" "}
          <button className="btn btn-sm" onClick={sendMessage}>
            send
          </button>
        </div>
      </div>
    </main>
  );
}
