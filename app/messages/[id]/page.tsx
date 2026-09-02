"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ConversationData = {
  id: number;
  buyer: string;
  seller_id: string;
};

export default function Conversation() {
  const params = useParams();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUserName, setOtherUserName] =
    useState("Utilisateur");
  const [otherUserId, setOtherUserId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversation() {
      if (!conversationId) return;

      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Vous devez être connecté.");
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      const {
        data: conversation,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select("id, buyer, seller_id")
        .eq("id", conversationId)
        .single();

      if (conversationError || !conversation) {
        setMessage(
          "ERREUR CONVERSATION : " +
            (conversationError?.message || "Introuvable.")
        );
        setLoading(false);
        return;
      }

      const typedConversation =
        conversation as ConversationData;

      const otherId =
        user.id === typedConversation.buyer
          ? typedConversation.seller_id
          : typedConversation.buyer;

      setOtherUserId(otherId);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", otherId)
        .maybeSingle();

      setOtherUserName(
        profile?.display_name || "Utilisateur"
      );

      const {
        data: messagesData,
        error: messagesError,
      } = await supabase
        .from("messages")
        .select(
          "id, sender_id, content, created_at"
        )
        .eq("conversation_id", conversationId)
        .order("created_at", {
          ascending: true,
        });

      if (messagesError) {
        setMessage(
          "ERREUR MESSAGES : " +
            messagesError.message
        );
        setLoading(false);
        return;
      }

      setMessages(messagesData || []);

      // ==========================================
      // MARQUER LES NOTIFICATIONS COMME LUES
      // ==========================================

      const { error: notificationReadError } =
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .eq(
            "conversation_id",
            Number(conversationId)
          )
          .eq("is_read", false);

      if (notificationReadError) {
        console.error(
          "Erreur lors de la lecture des notifications :",
          notificationReadError
        );
      }

      setLoading(false);
    }

    loadConversation();
  }, [conversationId]);

  // ==========================================
  // DESCENDRE AUTOMATIQUEMENT VERS LE DERNIER
  // MESSAGE
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==========================================
  // ENVOYER UN MESSAGE
  // ==========================================

  async function envoyerMessage() {
    if (
      !newMessage.trim() ||
      sending ||
      !otherUserId
    ) {
      return;
    }

    setSending(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Vous devez être connecté.");
      setSending(false);
      return;
    }

    const contenuMessage = newMessage.trim();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: Number(conversationId),
        sender_id: user.id,
        content: contenuMessage,
      })
      .select(
        "id, sender_id, content, created_at"
      )
      .single();

    if (error) {
      setMessage(
        "ERREUR ENVOI : " +
          error.message +
          " | CODE : " +
          error.code
      );
      setSending(false);
      return;
    }

    if (data) {
      setMessages((current) => [
        ...current,
        data,
      ]);
    }

    // ==========================================
    // CRÉER UNE NOTIFICATION POUR L'AUTRE
    // ==========================================

    if (otherUserId !== user.id) {
      const { data: senderProfile } =
        await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

      const senderName =
        senderProfile?.display_name ||
        "Utilisateur";

      const {
        error: notificationError,
      } = await supabase
        .from("notifications")
        .insert({
          user_id: otherUserId,
          type: "message",
          title: "Nouveau message",
          content: `${senderName} vous a envoyé un message : ${contenuMessage}`,
          conversation_id: Number(
            conversationId
          ),
          is_read: false,
        });

      if (notificationError) {
        console.error(
          "Erreur création notification :",
          notificationError
        );
      }
    }

    setNewMessage("");
    setSending(false);
  }

  // ==========================================
  // CHARGEMENT
  // ==========================================

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          <div className="loader"></div>
          <h2>Ouverture de la conversation...</h2>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="page">

      {/* HEADER DE LA CONVERSATION */}

      <header className="chat-header">

        <Link
          href="/messages"
          className="back-button"
        >
          ←
        </Link>

        <div className="chat-avatar">
          {otherUserName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="user-info">
          <h1>{otherUserName}</h1>
          <span>Conversation DONA</span>
        </div>

      </header>

      {/* ZONE DES MESSAGES */}

      <section className="messages-area">

        <div className="conversation-intro">
          <div className="intro-avatar">
            {otherUserName
              .charAt(0)
              .toUpperCase()}
          </div>

          <h2>{otherUserName}</h2>

          <p>
            Votre conversation sur DONA
          </p>
        </div>

        {messages.length === 0 && (
          <div className="empty-chat">
            <div className="empty-chat-icon">
              💬
            </div>

            <h3>Aucun message</h3>

            <p>
              Commencez la conversation avec{" "}
              {otherUserName}.
            </p>
          </div>
        )}

        {messages.map((item) => {
          const isMyMessage =
            item.sender_id === currentUserId;

          return (
            <div
              key={item.id}
              className={`message-row ${
                isMyMessage
                  ? "mine"
                  : "theirs"
              }`}
            >
              <article
                className={`message-bubble ${
                  isMyMessage
                    ? "mine-bubble"
                    : "their-bubble"
                }`}
              >
                <p>{item.content}</p>

                <time>
                  {new Date(
                    item.created_at
                  ).toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </time>
              </article>
            </div>
          );
        })}

        <div ref={messagesEndRef} />

      </section>

      {/* ZONE D'ENVOI */}

      <section className="composer">

        {message && (
          <div className="error-message">
            {message}
          </div>
        )}

        <div className="composer-box">

          <input
            type="text"
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={(e) =>
              setNewMessage(e.target.value)
            }
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                envoyerMessage();
              }
            }}
          />

          <button
            type="button"
            onClick={envoyerMessage}
            disabled={
              sending ||
              !newMessage.trim()
            }
            aria-label="Envoyer"
          >
            {sending ? "..." : "➤"}
          </button>

        </div>

        <p className="security-text">
          💗 Échangez simplement et en toute
          simplicité sur DONA.
        </p>

      </section>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #fff9fc;
          color: #352832;
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* HEADER */

        .chat-header {
          height: 74px;
          background: white;
          border-bottom: 1px solid #f0dfe7;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 22px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-button {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #fce6f0;
          color: #b43f72;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-right: 3px;
        }

        .back-button:hover {
          background: #f7d7e5;
        }

        .chat-avatar {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #f5c9dc;
          color: #a93b6d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 800;
        }

        .user-info {
          min-width: 0;
        }

        .user-info h1 {
          font-size: 16px;
          margin: 0 0 3px;
          color: #352832;
        }

        .user-info span {
          color: #a18d97;
          font-size: 11px;
        }

        /* MESSAGES */

        .messages-area {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 28px 20px 130px;
          flex: 1;
          overflow-y: auto;
        }

        .conversation-intro {
          text-align: center;
          margin-bottom: 30px;
        }

        .intro-avatar {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: #fce6f0;
          color: #b43f72;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          font-weight: 800;
          margin: 0 auto 10px;
        }

        .conversation-intro h2 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .conversation-intro p {
          margin: 0;
          color: #a18d97;
          font-size: 12px;
        }

        /* BULLES */

        .message-row {
          display: flex;
          width: 100%;
          margin-bottom: 10px;
        }

        .message-row.mine {
          justify-content: flex-end;
        }

        .message-row.theirs {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 72%;
          padding: 11px 14px 8px;
          border-radius: 18px;
          box-shadow: 0 3px 10px rgba(
            160,
            85,
            120,
            0.05
          );
        }

        .message-bubble p {
          margin: 0 0 5px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .message-bubble time {
          display: block;
          font-size: 9px;
          text-align: right;
        }

        .mine-bubble {
          background: #d95b91;
          color: white;
          border-bottom-right-radius: 5px;
        }

        .mine-bubble time {
          color: #fce7f0;
        }

        .their-bubble {
          background: white;
          color: #352832;
          border: 1px solid #f0dfe7;
          border-bottom-left-radius: 5px;
        }

        .their-bubble time {
          color: #a18d97;
        }

        /* CONVERSATION VIDE */

        .empty-chat {
          text-align: center;
          margin: 55px auto;
          color: #806c77;
        }

        .empty-chat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #fce6f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          font-size: 25px;
        }

        .empty-chat h3 {
          color: #352832;
          margin: 0 0 7px;
        }

        .empty-chat p {
          margin: 0;
          font-size: 13px;
        }

        /* COMPOSER */

        .composer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(
            255,
            255,
            255,
            0.96
          );
          backdrop-filter: blur(8px);
          border-top: 1px solid #f0dfe7;
          padding: 12px 20px 10px;
          z-index: 20;
        }

        .composer-box {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e8d4de;
          border-radius: 18px;
          padding: 6px 7px 6px 14px;
          box-shadow: 0 5px 20px rgba(
            160,
            85,
            120,
            0.08
          );
        }

        .composer-box input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: #352832;
          font-size: 14px;
          min-width: 0;
        }

        .composer-box input::placeholder {
          color: #aa969f;
        }

        .composer-box button {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: #d95b91;
          color: white;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .composer-box button:hover {
          background: #c94d83;
        }

        .composer-box button:disabled {
          background: #e8c8d6;
          cursor: not-allowed;
        }

        .security-text {
          max-width: 760px;
          margin: 7px auto 0;
          text-align: center;
          color: #aa969f;
          font-size: 9px;
        }

        .error-message {
          max-width: 760px;
          margin: 0 auto 7px;
          padding: 8px 12px;
          background: #fff0f0;
          color: #b44747;
          border-radius: 8px;
          font-size: 11px;
        }

        /* LOADING */

        .loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #806c77;
        }

        .loading h2 {
          color: #352832;
          font-size: 17px;
          margin: 0;
        }

        .loader {
          width: 30px;
          height: 30px;
          border: 3px solid #f2d9e4;
          border-top-color: #d95b91;
          border-radius: 50%;
          margin-bottom: 18px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {

          .chat-header {
            padding: 0 14px;
          }

          .messages-area {
            padding: 22px 13px 125px;
          }

          .message-bubble {
            max-width: 82%;
          }

          .message-bubble p {
            font-size: 14px;
          }

          .composer {
            padding: 9px 10px 8px;
          }

          .composer-box {
            border-radius: 16px;
          }

          .composer-box button {
            width: 38px;
            height: 38px;
          }

          .security-text {
            font-size: 8px;
          }
        }

      `}</style>
    </main>
  );
}

