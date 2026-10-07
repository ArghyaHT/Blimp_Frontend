import React, { useState, useRef, useEffect } from "react";
import style from "./Chatbot.module.css";
import { CrossIcon, RightIcon } from "../../icons";
import logo from "../../assets/BlimpLogo1.png";
import api from "../../api/api";

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "bot",
    text: "Hello! 👋 Welcome to Blimp. How can I help you with your fundraising or donation today?",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const QUICK_QUESTIONS = [
  "How do I start a campaign?",
  "What are the platform fees?",
  "How to withdraw raised funds?",
  "Are donations tax-deductible?",
];

const BOT_KNOWLEDGE_BASE = {
  campaign:
    "To start a campaign on Blimp:\n1. Click the 'Start Free' button in the navigation.\n2. Choose your cause category & country.\n3. Set your target goal amount and title.\n4. Upload high-quality banner images.\n5. Fill in your bank details to receive funds!",
  fee:
    "Blimp is built to maximize your impact! Creating a campaign is 100% free to start. Standard third-party payment processing fees apply depending on your region and payment gateway.",
  withdraw:
    "Funds can be withdrawn directly to your verified bank account. Go to your Account Dashboard > Bank Account to enter your IFSC/SWIFT code and account details. Payouts are processed smoothly after campaign verification.",
  tax:
    "Yes! Registered non-profit campaigns on Blimp provide tax exemption certificates (like 80G in India) where applicable. You can request a donor receipt directly from your account page.",
  default:
    "Thank you for reaching out! You can explore our active campaigns under 'Manage Subscriptions' or 'Discover', or feel free to reach out directly via our Contact Us page for specialized support.",
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    try {
      // Try fetching response from backend endpoint (/chat)
      const { data } = await api.post("/chat", { message: text });

      let botResponse = "";
      if (data && data.code === 200 && data.data && data.data.reply) {
        botResponse = data.data.reply;
      } else {
        throw new Error("Invalid API response");
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      // Local fallback in case backend server is offline or key isn't provided
      let botResponse = BOT_KNOWLEDGE_BASE.default;
      const lower = text.toLowerCase();

      if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
        botResponse = "Hello! 👋 Welcome to Blimp. How can I help you with your fundraising or donation today?";
      } else if (lower.includes("start") || lower.includes("create") || lower.includes("fundraiser") || lower.includes("campaign")) {
        botResponse = BOT_KNOWLEDGE_BASE.campaign;
      } else if (lower.includes("fee") || lower.includes("cost") || lower.includes("charge") || lower.includes("percent")) {
        botResponse = BOT_KNOWLEDGE_BASE.fee;
      } else if (lower.includes("withdraw") || lower.includes("bank") || lower.includes("payout") || lower.includes("transfer")) {
        botResponse = BOT_KNOWLEDGE_BASE.withdraw;
      } else if (lower.includes("tax") || lower.includes("receipt") || lower.includes("80g") || lower.includes("deductible")) {
        botResponse = BOT_KNOWLEDGE_BASE.tax;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={style.chatbotContainer}>
      {/* Expandable Chat Window */}
      {isOpen && (
        <div className={style.chatWindow}>
          {/* Header */}
          <div className={style.chatHeader}>
            <div className={style.headerBrand}>
              <img src={logo} alt="Blimp" className={style.headerLogo} />
              <div>
                <h3>Blimp Support AI</h3>
                <span className={style.onlineBadge}>
                  <span className={style.onlineDot}></span> Always Online
                </span>
              </div>
            </div>
            <button className={style.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close Chat">
              <CrossIcon size="1.6rem" color="#64748b" />
            </button>
          </div>

          {/* Messages Area */}
          <div className={style.messagesArea}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.sender === "user" ? style.userBubbleWrapper : style.botBubbleWrapper}
              >
                <div className={msg.sender === "user" ? style.userBubble : style.botBubble}>
                  <p>{msg.text}</p>
                  <span className={style.msgTime}>{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={style.botBubbleWrapper}>
                <div className={style.typingBubble}>
                  <span className={style.typingDot}></span>
                  <span className={style.typingDot}></span>
                  <span className={style.typingDot}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className={style.quickChipsContainer}>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button key={idx} className={style.chip} onClick={() => handleSendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            className={style.inputForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className={style.sendBtn} disabled={!inputText.trim()}>
              <RightIcon size="1.6rem" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        className={`${style.launcherBtn} glossy-btn`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Chatbot"
      >
        {isOpen ? (
          <CrossIcon size="2rem" color="#fff" />
        ) : (
          <div className={style.launcherIconWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className={style.pulseBadge}></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
