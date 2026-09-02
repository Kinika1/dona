"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Notification = {
  id: number;
  created_at: string;
  type: string;
  title: string;
  content: string;
  conversation_id: number | null;
  is_read: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerNotifications();
  }, []);

  async function chargerNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, created_at, type, title, content, conversation_id, is_read"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement notifications :", error);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setLoading(false);
  }

  async function ouvrirNotification(notification: Notification) {
    // On la marque comme lue
    if (!notification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      setNotifications((anciennes) =>
        anciennes.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }

    // Si c'est une notification liée à une conversation,
    // on ouvre directement la conversation.
    if (
      notification.type === "message" &&
      notification.conversation_id !== null
    ) {
      window.location.href = `/messages/${notification.conversation_id}`;
    }
  }

  async function toutMarquerCommeLu() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((anciennes) =>
      anciennes.map((n) => ({ ...n, is_read: true }))
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff8fb",
        padding: "24px 18px 100px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                color: "#333",
              }}
            >
              Notifications
            </h1>

            <p
              style={{
                marginTop: "6px",
                color: "#777",
                fontSize: "14px",
              }}
            >
              Retrouvez ici vos dernières notifications.
            </p>
          </div>

          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={toutMarquerCommeLu}
              style={{
                border: "none",
                background: "#fce6f0",
                color: "#c44f82",
                padding: "9px 12px",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Tout lire
            </button>
          )}
        </div>

        {loading ? (
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "30px",
              textAlign: "center",
              color: "#777",
            }}
          >
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "40px 20px",
              textAlign: "center",
              color: "#777",
              boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>
              🔔
            </div>

            <p style={{ margin: 0 }}>
              Vous n'avez aucune notification pour le moment.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => ouvrirNotification(notification)}
                style={{
                  width: "100%",
                  border: "none",
                  textAlign: "left",
                  cursor:
                    notification.type === "message" &&
                    notification.conversation_id !== null
                      ? "pointer"
                      : "default",
                  background: notification.is_read ? "white" : "#fff0f6",
                  borderRadius: "18px",
                  padding: "16px",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#fce6f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "20px",
                  }}
                >
                  {notification.type === "message" ? "💬" : "🔔"}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <strong
                      style={{
                        color: "#333",
                        fontSize: "15px",
                      }}
                    >
                      {notification.title}
                    </strong>

                    {!notification.is_read && (
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#d95b91",
                          display: "inline-block",
                        }}
                      />
                    )}
                  </div>

                  <p
                    style={{
                      margin: "6px 0",
                      color: "#666",
                      fontSize: "14px",
                      lineHeight: 1.4,
                    }}
                  >
                    {notification.content}
                  </p>

                  <small
                    style={{
                      color: "#999",
                      fontSize: "11px",
                    }}
                  >
                    {new Date(notification.created_at).toLocaleString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </small>
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: "25px" }}>
          <Link
            href="/accueil"
            style={{
              color: "#c44f82",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

