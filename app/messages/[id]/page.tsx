"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Message = {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

type ConversationData = {
  id: number;
  buyer: string;
  seller_id: string;
  product_id: number;
};

type ProductInfo = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
};

export default function Conversation() {
  const params = useParams();

  const conversationId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUserName, setOtherUserName] = useState("Utilisateur");
  const [otherUserId, setOtherUserId] = useState("");
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /*
   * ============================================================
   * CHARGER LA CONVERSATION
   * ============================================================
   */

  useEffect(() => {
    let isMounted = true;

    async function loadConversation() {
      if (!conversationId) {
        if (isMounted) {
          setMessage("Conversation introuvable.");
          setLoading(false);
        }
        return;
      }

      const numericConversationId = Number(conversationId);

      if (!Number.isInteger(numericConversationId)) {
        if (isMounted) {
          setMessage("Identifiant de conversation invalide.");
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setMessage("");
      }

      /*
       * UTILISATEUR CONNECTÉ
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (isMounted) {
          setMessage("Vous devez être connecté.");
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setCurrentUserId(user.id);
      }

      /*
       * CONVERSATION
       */

      const { data: conversation, error: conversationError } =
        await supabase
          .from("conversations")
          .select("id, buyer, seller_id, product_id")
          .eq("id", numericConversationId)
          .single();

      if (conversationError || !conversation) {
        console.error(
          "Erreur récupération conversation :",
          conversationError
        );

        if (isMounted) {
          setMessage(
            "Impossible de récupérer cette conversation."
          );
          setLoading(false);
        }

        return;
      }

      const typedConversation =
        conversation as ConversationData;

      /*
       * VÉRIFICATION DE L'UTILISATEUR
       */

      const isBuyer =
        user.id === typedConversation.buyer;

      const isSeller =
        user.id === typedConversation.seller_id;

      if (!isBuyer && !isSeller) {
        if (isMounted) {
          setMessage(
            "Vous n'avez pas accès à cette conversation."
          );
          setLoading(false);
        }

        return;
      }

      /*
       * AUTRE UTILISATEUR
       */

      const otherId = isBuyer
        ? typedConversation.seller_id
        : typedConversation.buyer;

      if (isMounted) {
        setOtherUserId(otherId);
      }

      /*
       * ========================================================
       * RÉCUPÉRER L'ANNONCE
       * ========================================================
       */

      if (typedConversation.product_id) {
        const { data: product, error: productError } =
          await supabase
            .from("products")
            .select("id, name, price, image_url")
            .eq("id", typedConversation.product_id)
            .maybeSingle();

        if (productError) {
          console.error(
            "Erreur récupération produit :",
            productError
          );
        }

        if (isMounted && product) {
          setProductInfo(product as ProductInfo);
        }
      }

      /*
       * ========================================================
       * PROFIL DE L'AUTRE UTILISATEUR
       * ========================================================
       */

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", otherId)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Erreur récupération profil :",
          profileError
        );
      }

      if (isMounted) {
        setOtherUserName(
          profile?.display_name || "Utilisateur"
        );
      }

      /*
       * ========================================================
       * MESSAGES
       * ========================================================
       */

      const { data: messagesData, error: messagesError } =
        await supabase
          .from("messages")
          .select(
            "id, sender_id, content, created_at"
          )
          .eq(
            "conversation_id",
            numericConversationId
          )
          .order("created_at", {
            ascending: true,
          });

      if (messagesError) {
        console.error(
          "Erreur récupération messages :",
          messagesError
        );

        if (isMounted) {
          setMessage(
            "Impossible de récupérer les messages."
          );
          setLoading(false);
        }

        return;
      }

      if (isMounted) {
        setMessages(
          (messagesData || []) as Message[]
        );
      }

      /*
       * ========================================================
       * MARQUER LES NOTIFICATIONS COMME LUES
       * ========================================================
       */

      const {
        error: notificationReadError,
      } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq(
          "conversation_id",
          numericConversationId
        )
        .eq("is_read", false);

      if (notificationReadError) {
        console.error(
          "Erreur lecture notifications :",
          notificationReadError
        );
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadConversation();

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  /*
   * ============================================================
   * DESCENDRE VERS LE DERNIER MESSAGE
   * ============================================================
   */

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }

    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * ============================================================
   * ENVOYER UN MESSAGE
   * ============================================================
   */

  async function envoyerMessage() {
    const contenuMessage = newMessage.trim();

    if (
      !contenuMessage ||
      sending ||
      !otherUserId ||
      !conversationId
    ) {
      return;
    }

    const numericConversationId =
      Number(conversationId);

    if (!Number.isInteger(numericConversationId)) {
      setMessage(
        "Identifiant de conversation invalide."
      );
      return;
    }

    setSending(true);
    setMessage("");

    /*
     * UTILISATEUR CONNECTÉ
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Vous devez être connecté.");
      setSending(false);
      return;
    }

    /*
     * INSERTION DU MESSAGE
     */

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: numericConversationId,
        sender_id: user.id,
        content: contenuMessage,
      })
      .select(
        "id, sender_id, content, created_at"
      )
      .single();

    if (error) {
      console.error(
        "Erreur envoi message :",
        error
      );

      setMessage(
        "Impossible d'envoyer le message : " +
          error.message
      );

      setSending(false);
      return;
    }

    /*
     * AJOUTER LE MESSAGE À L'ÉCRAN
     */

    if (data) {
      setMessages((current) => [
        ...current,
        data as Message,
      ]);
    }

    /*
     * ========================================================
     * NOTIFICATION POUR L'AUTRE UTILISATEUR
     * ========================================================
     */

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
          content:
            `${senderName} vous a envoyé un message : ${contenuMessage}`,
          conversation_id:
            numericConversationId,
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

  /*
   * ============================================================
   * CHARGEMENT
   * ============================================================
   */

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          <div className="loader"></div>

          <h2>
            Ouverture de la conversation...
          </h2>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERREUR
   * ============================================================
   */

  if (message && !currentUserId) {
    return (
      <main className="page">
        <div className="error-page">
          <div className="error-icon">!</div>

          <h2>
            Impossible d'ouvrir la conversation
          </h2>

          <p>{message}</p>

          <Link
            href="/messages"
            className="return-button"
          >
            Retour aux messages
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="page">

      {/* HEADER */}

      <header className="chat-header">

        <Link
          href="/messages"
          className="back-button"
          aria-label="Retour aux messages"
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

          <span>
            Conversation DONA
          </span>
        </div>

      </header>

      {/* =====================================================
          CONTEXTE DE L'ANNONCE
          ===================================================== */}

      {productInfo && (
        <Link
          href={`/acheter/${productInfo.id}`}
          className="listing-context"
        >

          <div className="listing-image-wrap">

            {productInfo.image_url ? (
              <img
                src={productInfo.image_url}
                alt={productInfo.name}
                className="listing-image"
              />
            ) : (
              <div className="listing-placeholder">
                D
              </div>
            )}

          </div>

          <div className="listing-text">

            <span className="listing-label">
              ANNONCE
            </span>

            <span className="listing-title">
              {productInfo.name}
            </span>

            <span className="listing-price">
              {Number(
                productInfo.price
              ).toLocaleString("fr-FR")}{" "}
              FCFA
            </span>

          </div>

          <span className="listing-arrow">
            →
          </span>

        </Link>
      )}

      {/* =====================================================
          MESSAGES
          ===================================================== */}

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

            <h3>
              Aucun message
            </h3>

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

                <p>
                  {item.content}
                </p>

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

      {/* =====================================================
          COMPOSER
          ===================================================== */}

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
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
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

      {/* =====================================================
          STYLE
          ===================================================== */}

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

        /* =========================
           HEADER
           ========================= */

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
          z-index: 20;
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

        /* =========================
           CONTEXTE ANNONCE
           ========================= */

        .listing-context {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          min-height: 70px;

          display: flex;
          align-items: center;
          gap: 12px;

          padding: 10px 18px;

          background: #fff;

          border-bottom: 1px solid #f0dfe7;

          text-decoration: none;
          color: #352832;

          position: sticky;
          top: 74px;
          z-index: 15;

          box-shadow:
            0 3px 12px
            rgba(160, 85, 120, 0.04);
        }

        /*
         * IMAGE OVALE
         */

        .listing-image-wrap {
          width: 62px;
          height: 42px;
          flex-shrink: 0;

          overflow: hidden;

          border-radius: 999px;

          background: #fce6f0;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .listing-image {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;
        }

        .listing-placeholder {
          width: 100%;
          height: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #b43f72;

          font-size: 14px;
          font-weight: 800;
        }

        .listing-text {
          min-width: 0;

          flex: 1;

          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .listing-label {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: #b43f72;
        }

        .listing-title {
          font-size: 13px;
          font-weight: 700;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .listing-price {
          font-size: 12px;
          color: #d95b91;
          font-weight: 700;
        }

        .listing-arrow {
          width: 28px;
          height: 28px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #fce6f0;

          color: #b43f72;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 15px;
        }

        .listing-context:hover {
          background: #fffafd;
        }

        /* =========================
           MESSAGES
           ========================= */

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

        /* =========================
           BULLES
           ========================= */

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

          box-shadow:
            0 3px 10px
            rgba(160, 85, 120, 0.05);
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

        /* =========================
           VIDE
           ========================= */

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

        /* =========================
           COMPOSER
           ========================= */

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

          z-index: 30;
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

          box-shadow:
            0 5px 20px
            rgba(160, 85, 120, 0.08);
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

        /* =========================
           PAGE ERREUR
           ========================= */

        .error-page {
          min-height: 100vh;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 25px;
        }

        .error-icon {
          width: 55px;
          height: 55px;

          border-radius: 50%;

          background: #fff0f0;
          color: #b44747;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 25px;
          font-weight: 800;

          margin-bottom: 15px;
        }

        .error-page h2 {
          margin: 0 0 8px;
          font-size: 19px;
        }

        .error-page p {
          color: #806c77;

          font-size: 13px;

          max-width: 400px;

          margin: 0 0 20px;
        }

        .return-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          padding: 11px 18px;

          background: #d95b91;
          color: white;

          text-decoration: none;

          border-radius: 12px;

          font-size: 13px;
          font-weight: 700;
        }

        .return-button:hover {
          background: #c94d83;
        }

        /* =========================
           LOADING
           ========================= */

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

          animation:
            spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           MOBILE
           ========================= */

        @media (max-width: 600px) {

          .chat-header {
            padding: 0 14px;
          }

          .listing-context {
            padding: 9px 14px;
            min-height: 64px;
          }

          .listing-image-wrap {
            width: 58px;
            height: 38px;
          }

          .listing-title {
            font-size: 12px;
          }

          .listing-price {
            font-size: 11px;
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

