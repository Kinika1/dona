"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Conversation = {
  id: number;
  buyer: string;
  seller_id: string;
  created_at: string;
};

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

function formatMessageDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const messageDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const differenceInDays = Math.floor(
    (today.getTime() - messageDay.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (differenceInDays === 0) {
    return `Aujourd’hui à ${time}`;
  }

  if (differenceInDays === 1) {
    return `Hier à ${time}`;
  }

  return `${date.toLocaleDateString("fr-FR")} à ${time}`;
}

export default function Messages() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [profileNames, setProfileNames] = useState<
    Record<string, string>
  >({});

  const [lastMessages, setLastMessages] = useState<
    Record<number, Message>
  >({});

  const [currentUserId, setCurrentUserId] = useState("");

  const [unreadConversationIds, setUnreadConversationIds] =
    useState<number[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let channel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let actif = true;

    async function loadConversations() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!actif) return;

      if (userError || !user) {
        setErrorMessage("Vous devez être connecté.");
        setLoading(false);
        return;
      }

      const currentId = user.id;

      setCurrentUserId(currentId);

      // ==========================================
      // RÉCUPÉRER LES CONVERSATIONS
      // ==========================================

      const {
        data: conversationData,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select("id, buyer, seller_id, created_at")
        .or(
          `buyer.eq.${currentId},seller_id.eq.${currentId}`
        )
        .order("created_at", {
          ascending: false,
        });

      if (!actif) return;

      if (conversationError) {
        setErrorMessage(
          "ERREUR CONVERSATIONS : " +
            conversationError.message
        );

        setLoading(false);
        return;
      }

      const conversationList =
        (conversationData || []) as Conversation[];

      setConversations(conversationList);

      // ==========================================
      // RÉCUPÉRER LES DERNIERS MESSAGES
      // ==========================================

      if (conversationList.length > 0) {
        const conversationIds =
          conversationList.map(
            (conversation) => conversation.id
          );

        const {
          data: messages,
          error: messagesError,
        } = await supabase
          .from("messages")
          .select(
            "id, conversation_id, sender_id, content, created_at"
          )
          .in(
            "conversation_id",
            conversationIds
          )
          .order("created_at", {
            ascending: false,
          });

        if (!actif) return;

        if (messagesError) {
          console.error(
            "Erreur récupération messages :",
            messagesError
          );
        } else {
          const latestMessages: Record<
            number,
            Message
          > = {};

          for (const item of messages || []) {
            if (
              !latestMessages[
                item.conversation_id
              ]
            ) {
              latestMessages[
                item.conversation_id
              ] = item as Message;
            }
          }

          setLastMessages(latestMessages);
        }

        // ==========================================
        // RÉCUPÉRER LES NOMS DES AUTRES UTILISATEURS
        // ==========================================

        const otherUserIds =
          conversationList.map(
            (conversation) => {
              if (
                conversation.buyer === currentId
              ) {
                return conversation.seller_id;
              }

              return conversation.buyer;
            }
          );

        const uniqueIds = Array.from(
          new Set(otherUserIds)
        );

        const names: Record<
          string,
          string
        > = {};

        for (const otherId of uniqueIds) {
          const {
            data: profile,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("id", otherId)
            .maybeSingle();

          if (!actif) return;

          if (profileError) {
            console.error(
              "Erreur récupération profil :",
              profileError
            );
            continue;
          }

          if (profile) {
            names[profile.id] =
              profile.display_name ||
              "Utilisateur";
          }
        }

        setProfileNames(names);
      }

      // ==========================================
      // RÉCUPÉRER LES NOTIFICATIONS NON LUES
      // ==========================================

      const {
        data: unreadNotifications,
        error: notificationError,
      } = await supabase
        .from("notifications")
        .select(
          "id, conversation_id, is_read"
        )
        .eq("user_id", currentId)
        .eq("is_read", false);

      if (!actif) return;

      if (notificationError) {
        console.error(
          "Erreur notifications :",
          notificationError
        );
      } else {
        const unreadIds = Array.from(
          new Set(
            (unreadNotifications || [])
              .map(
                (notification) =>
                  notification.conversation_id
              )
              .filter(
                (
                  id
                ): id is number =>
                  id !== null
              )
          )
        );

        setUnreadConversationIds(
          unreadIds
        );
      }

      setLoading(false);

      // ==========================================
      // REALTIME DES NOTIFICATIONS
      // ==========================================

      const channelName =
        `notifications-${currentId}-${Date.now()}`;

      channel =
        supabase.channel(channelName);

      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentId}`,
        },
        (payload) => {
          if (!actif) return;

          const notification =
            payload.new as {
              conversation_id:
                | number
                | null;
              is_read: boolean;
            };

          if (
            notification.is_read ||
            notification.conversation_id ===
              null
          ) {
            return;
          }

          setUnreadConversationIds(
            (current) => {
              const conversationId =
                notification.conversation_id as number;

              if (
                current.includes(
                  conversationId
                )
              ) {
                return current;
              }

              return [
                ...current,
                conversationId,
              ];
            }
          );
        }
      );

      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "Erreur Realtime notifications."
          );
        }

        if (status === "TIMED_OUT") {
          console.error(
            "Realtime notifications : délai dépassé."
          );
        }
      });
    }

    loadConversations();

    return () => {
      actif = false;

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []);

  // ==========================================
  // CHARGEMENT
  // ==========================================

  if (loading) {
    return (
      <main className="page">
        <header className="topbar">
          <Link href="/accueil" className="logo">
            DONA
          </Link>

          <nav>
            <Link href="/acheter">Acheter</Link>
            <Link href="/vendre">Vendre</Link>
            <Link href="/messages">Messages</Link>
            <Link href="/profil">Profil</Link>
          </nav>
        </header>

        <section className="loading-state">
          <div className="loader"></div>
          <h2>Vos messages</h2>
          <p>Chargement de vos conversations...</p>
        </section>
      </main>
    );
  }

  // ==========================================
  // ERREUR
  // ==========================================

  if (errorMessage) {
    return (
      <main className="page">
        <header className="topbar">
          <Link href="/accueil" className="logo">
            DONA
          </Link>

          <nav>
            <Link href="/acheter">Acheter</Link>
            <Link href="/vendre">Vendre</Link>
            <Link href="/messages">Messages</Link>
            <Link href="/profil">Profil</Link>
          </nav>
        </header>

        <section className="error-state">
          <div className="error-icon">!</div>

          <h2>Impossible d'afficher vos messages</h2>

          <p>{errorMessage}</p>

          <Link href="/accueil">
            Retour à l'accueil
          </Link>
        </section>
      </main>
    );
  }

  // ==========================================
  // PAGE MESSAGES
  // ==========================================

  return (
    <main className="page">

      {/* HEADER */}

      <header className="topbar">
        <Link href="/accueil" className="logo">
          DONA
        </Link>

        <nav>
          <Link href="/acheter">Acheter</Link>
          <Link href="/vendre">Vendre</Link>

          <Link
            href="/messages"
            className="active"
          >
            Messages
          </Link>

          <Link href="/profil">Profil</Link>
        </nav>
      </header>

      {/* CONTENU */}

      <section className="content">

        <Link
          href="/accueil"
          className="back"
        >
          ← Retour à l'accueil
        </Link>

        <div className="title-area">
          <span className="small-title">
            DONA
          </span>

          <div className="title-row">
            <div>
              <h1>Messages</h1>

              <p>
                Retrouvez vos échanges avec les
                membres de DONA.
              </p>
            </div>

            {unreadConversationIds.length >
              0 && (
              <div className="unread-count">
                <span>
                  {unreadConversationIds.length}
                </span>

                <small>
                  {unreadConversationIds.length >
                  1
                    ? " conversations non lues"
                    : " conversation non lue"}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* LISTE DES CONVERSATIONS */}

        {conversations.length === 0 ? (
          <section className="empty">
            <div className="empty-icon">
              💬
            </div>

            <h2>Aucune conversation</h2>

            <p>
              Lorsque vous contacterez un vendeur
              ou qu'un acheteur vous écrira, votre
              conversation apparaîtra ici.
            </p>

            <Link
              href="/acheter"
              className="empty-button"
            >
              Découvrir les annonces
            </Link>
          </section>
        ) : (
          <section className="conversation-list">

            {conversations.map(
              (conversation) => {
                const otherUserId =
                  conversation.buyer ===
                  currentUserId
                    ? conversation.seller_id
                    : conversation.buyer;

                const otherUserName =
                  profileNames[
                    otherUserId
                  ] || "Utilisateur";

                const lastMessage =
                  lastMessages[
                    conversation.id
                  ];

                const isUnread =
                  unreadConversationIds.includes(
                    conversation.id
                  );

                return (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className="conversation-link"
                  >
                    <article
                      className={`conversation ${
                        isUnread
                          ? "unread"
                          : ""
                      }`}
                    >

                      {/* AVATAR */}

                      <div
                        className="avatar"
                      >
                        {otherUserName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      {/* TEXTE */}

                      <div className="conversation-main">

                        <div className="conversation-top">

                          <h3>
                            {otherUserName}
                          </h3>

                          {lastMessage && (
                            <time>
                              {formatMessageDate(
                                lastMessage.created_at
                              )}
                            </time>
                          )}

                        </div>

                        {lastMessage ? (
                          <p
                            className={
                              isUnread
                                ? "last-message unread-text"
                                : "last-message"
                            }
                          >
                            {lastMessage.content}
                          </p>
                        ) : (
                          <p className="last-message empty-message">
                            Aucun message
                          </p>
                        )}

                      </div>

                      {/* INDICATEUR NON LU */}

                      {isUnread && (
                        <span className="unread-dot"></span>
                      )}

                      {/* FLÈCHE */}

                      <span className="arrow">
                        ›
                      </span>

                    </article>
                  </Link>
                );
              }
            )}

          </section>
        )}

      </section>

      {/* FOOTER */}

      <footer>
        <strong>DONA</strong>

        <span>
          Achetez. Vendez. Échangez.
        </span>
      </footer>

      <style jsx>{`

        .page {
          min-height: 100vh;
          background: #fff9fc;
          color: #352832;
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* HEADER */

        .topbar {
          height: 72px;
          padding: 0 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #f3e3eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .logo {
          font-size: 27px;
          font-weight: 800;
          color: #d95b91;
          text-decoration: none;
          letter-spacing: 1px;
        }

        nav {
          display: flex;
          gap: 25px;
        }

        nav a {
          color: #55424d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        nav a:hover,
        nav a.active {
          color: #d95b91;
        }

        /* CONTENU */

        .content {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 35px 25px 70px;
          flex: 1;
        }

        .back {
          color: #a85a7d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .title-area {
          margin-top: 35px;
          margin-bottom: 28px;
        }

        .small-title {
          color: #d95b91;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .title-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        h1 {
          margin: 6px 0;
          font-size: 38px;
          color: #30232b;
        }

        .title-area p {
          margin: 0;
          color: #806c77;
          font-size: 16px;
        }

        .unread-count {
          background: #fce6f0;
          color: #b43f72;
          border-radius: 15px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }

        .unread-count span {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: #d95b91;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .unread-count small {
          font-size: 11px;
          font-weight: 700;
        }

        /* CONVERSATIONS */

        .conversation-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .conversation-link {
          text-decoration: none;
          color: inherit;
        }

        .conversation {
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 18px;
          padding: 16px 18px;
          min-height: 78px;
          box-shadow: 0 5px 18px rgba(
            160,
            85,
            120,
            0.05
          );
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .conversation:hover {
          transform: translateY(-2px);
          border-color: #e8bdd0;
          box-shadow: 0 10px 25px rgba(
            160,
            85,
            120,
            0.1
          );
        }

        .conversation.unread {
          background: #fff6fa;
          border: 1.5px solid #e8a8c2;
        }

        /* AVATAR */

        .avatar {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #fce6f0;
          color: #c44f82;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 800;
        }

        .unread .avatar {
          background: #f5c9dc;
          color: #a93b6d;
        }

        /* TEXTE */

        .conversation-main {
          min-width: 0;
          flex: 1;
        }

        .conversation-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 5px;
        }

        .conversation-top h3 {
          margin: 0;
          font-size: 16px;
          color: #352832;
        }

        .conversation-top time {
          color: #a18d97;
          font-size: 11px;
          white-space: nowrap;
        }

        .last-message {
          margin: 0;
          color: #806c77;
          font-size: 13px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 600px;
        }

        .unread-text {
          color: #4e3944;
          font-weight: 700;
        }

        .empty-message {
          color: #aa969f;
          font-style: italic;
        }

        /* NON LU */

        .unread-dot {
          flex-shrink: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d95b91;
          box-shadow: 0 0 0 4px #fce6f0;
        }

        .arrow {
          flex-shrink: 0;
          color: #c38aa5;
          font-size: 27px;
          line-height: 1;
        }

        /* VIDE */

        .empty {
          text-align: center;
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 22px;
          padding: 60px 25px;
          max-width: 650px;
          margin: 35px auto;
        }

        .empty-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: #fce6f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
        }

        .empty h2 {
          margin: 0 0 10px;
          font-size: 22px;
        }

        .empty p {
          max-width: 470px;
          margin: 0 auto 25px;
          color: #806c77;
          font-size: 14px;
          line-height: 1.6;
        }

        .empty-button {
          display: inline-block;
          background: #d95b91;
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
        }

        /* CHARGEMENT */

        .loading-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #806c77;
        }

        .loading-state h2 {
          color: #352832;
          margin: 0 0 5px;
        }

        .loading-state p {
          margin: 0;
          font-size: 14px;
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

        /* ERREUR */

        .error-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
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

        .error-state h2 {
          margin: 0 0 8px;
        }

        .error-state p {
          color: #806c77;
          margin-bottom: 20px;
        }

        .error-state a {
          color: #c44f82;
          font-weight: 700;
          text-decoration: none;
        }

        /* FOOTER */

        footer {
          border-top: 1px solid #f0dfe7;
          background: white;
          padding: 25px;
          display: flex;
          justify-content: center;
          gap: 10px;
          color: #9a7e8b;
          font-size: 12px;
        }

        footer strong {
          color: #d95b91;
        }

        /* MOBILE */

        @media (max-width: 650px) {

          .topbar {
            padding: 0 18px;
          }

          nav {
            gap: 12px;
          }

          nav a {
            font-size: 12px;
          }

          nav a:nth-child(3) {
            display: none;
          }

          .content {
            padding: 25px 16px 50px;
          }

          h1 {
            font-size: 31px;
          }

          .title-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .unread-count {
            padding: 8px 11px;
          }

          .conversation {
            gap: 12px;
            padding: 14px;
          }

          .avatar {
            width: 46px;
            height: 46px;
            font-size: 17px;
          }

          .conversation-top {
            align-items: flex-start;
            flex-direction: column;
            gap: 3px;
          }

          .conversation-top time {
            font-size: 10px;
          }

          .arrow {
            font-size: 23px;
          }

          footer {
            flex-direction: column;
            align-items: center;
          }
        }

      `}</style>
    </main>
  );
}

