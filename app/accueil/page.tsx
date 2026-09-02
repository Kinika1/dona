"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
  user_id: string;
};

/* =========================================================
   CATÉGORIES
========================================================= */

const categories = [
  { name: "Toutes", value: "toutes", icon: "▦" },
  { name: "Mode", value: "mode", icon: "♧" },
  { name: "Maison", value: "maison", icon: "▱" },
  {
    name: "Électronique",
    value: "electronique",
    icon: "▯",
  },
  { name: "Beauté", value: "beaute", icon: "♙" },
  { name: "Sport", value: "sport", icon: "◇" },
  { name: "Livres", value: "livres", icon: "▤" },
  { name: "Autres", value: "autre", icon: "＋" },
];

/* =========================================================
   LOGO
========================================================= */

function Logo() {
  return (
    <Link
      href="/accueil"
      aria-label="DONA - Accueil"
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <svg
        width="120"
        height="82"
        viewBox="0 0 150 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="
            M75 28
            C75 20 82 16 82 10
            C82 4 78 1 73 1
            C67 1 63 5 63 11
          "
          fill="none"
          stroke="#111111"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="
            M75 28
            L24 53
            C17 57 14 61 14 67
          "
          fill="none"
          stroke="#111111"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="
            M75 28
            L126 53
            C133 57 136 61 136 67
          "
          fill="none"
          stroke="#111111"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M63 35 L75 28 L87 35 L75 40 Z"
          fill="#83cddd"
        />

        <text
          x="75"
          y="79"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="48"
          fontWeight="700"
          letterSpacing="-3"
          fill="#111111"
        >
          dona
        </text>
      </svg>

      <span
        style={{
          marginTop: "-10px",
          fontSize: "9px",
          letterSpacing: "2px",
          color: "#df78a0",
          fontWeight: 600,
        }}
      >
        ACHETEZ · VENDEZ · ÉCHANGEZ
      </span>
    </Link>
  );
}

/* =========================================================
   ICÔNE RECHERCHE
========================================================= */

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

/* =========================================================
   ICÔNE FAVORI
========================================================= */

function HeartIcon({
  filled = false,
}: {
  filled?: boolean;
}) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill={filled ? "#df78a0" : "none"}
      stroke="#df78a0"
      strokeWidth="1.8"
    >
      <path d="M20.8 8.8c0 5-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" />
    </svg>
  );
}

/* =========================================================
   ICÔNE MESSAGE
========================================================= */

function MessageIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.1-.6L4 20l1.3-3.8A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
      <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
    </svg>
  );
}

/* =========================================================
   ICÔNE NOTIFICATION
========================================================= */

function NotificationIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

/* =========================================================
   ICÔNE UTILISATEUR
========================================================= */

function UserIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
    </svg>
  );
}

/* =========================================================
   ICÔNE MENU
========================================================= */

function MenuIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

/* =========================================================
   ICÔNE FILTRES
========================================================= */

function SlidersIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="2" fill="white" />
      <circle cx="15" cy="12" r="2" fill="white" />
      <circle cx="10" cy="18" r="2" fill="white" />
    </svg>
  );
}

/* =========================================================
   NORMALISATION DES CATÉGORIES
========================================================= */

function normaliserCategorie(valeur: string | null) {
  return (
    valeur
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim() || ""
  );
}

/* =========================================================
   FILTRAGE DES PRODUITS
========================================================= */

function filtrerProduits(
  categorie: string,
  liste: Product[]
) {
  const categorieNormalisee =
    normaliserCategorie(categorie);

  return liste.filter((product) => {
    const categorieProduit =
      normaliserCategorie(product.category);

    if (categorieNormalisee === "toutes") {
      return true;
    }

    if (
      categorieNormalisee === "autre" ||
      categorieNormalisee === "autres"
    ) {
      return (
        categorieProduit === "autre" ||
        categorieProduit === "autres" ||
        categorieProduit.startsWith("autre >") ||
        categorieProduit.startsWith("autres >")
      );
    }

    return (
      categorieProduit === categorieNormalisee ||
      categorieProduit.startsWith(
        `${categorieNormalisee} >`
      )
    );
  });
}

/* =========================================================
   PAGE ACCUEIL
========================================================= */

export default function Accueil() {
  const [recherche, setRecherche] =
    useState("");

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categorieActive, setCategorieActive] =
    useState("toutes");

  const [favoris, setFavoris] =
    useState<number[]>([]);

  const [hasUnreadMessages, setHasUnreadMessages] =
    useState(false);

  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState(false);

  /* =====================================================
     CHARGEMENT INITIAL
  ===================================================== */

  useEffect(() => {
    chargerProduits();
    chargerFavoris();

    let channel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let actif = true;

    async function chargerEtatNotifications(
      userId: string
    ) {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, is_read")
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error(
          "Impossible de charger les notifications non lues :",
          error
        );
        return;
      }

      if (!actif) {
        return;
      }

      const notificationsNonLues = data || [];

      setHasUnreadNotifications(
        notificationsNonLues.length > 0
      );

      setHasUnreadMessages(
        notificationsNonLues.some(
          (notification) =>
            notification.type === "message"
        )
      );
    }

    async function initialiserNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!actif) {
        return;
      }

      if (!user) {
        setHasUnreadMessages(false);
        setHasUnreadNotifications(false);
        return;
      }

      await chargerEtatNotifications(user.id);

      if (!actif) {
        return;
      }

      channel = supabase
        .channel(
          `accueil-notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            chargerEtatNotifications(user.id);
          }
        )
        .subscribe();
    }

    initialiserNotifications();

    return () => {
      actif = false;

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []);

  /* =====================================================
     CHARGER LES PRODUITS
  ===================================================== */

  async function chargerProduits() {
    const { data, error } =
      await supabase
        .from("products")
        .select(
          "id, name, price, category, image_url, user_id"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(20);

    if (error) {
      console.error(
        "Impossible de charger les produits :",
        error
      );
      return;
    }

    if (data) {
      setProducts(data);
    }
  }

  /* =====================================================
     CHARGER LES FAVORIS
  ===================================================== */

  async function chargerFavoris() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFavoris([]);
      return;
    }

    const { data, error } =
      await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "Impossible de charger vos favoris :",
        error
      );
      return;
    }

    setFavoris(
      (data || []).map((favori) =>
        Number(favori.product_id)
      )
    );
  }

  /* =====================================================
     RECHERCHE
  ===================================================== */

  function lancerRecherche() {
    const valeur =
      recherche.trim();

    if (valeur) {
      window.location.href =
        `/recherche?q=${encodeURIComponent(
          valeur
        )}`;
    } else {
      window.location.href =
        "/recherche";
    }
  }

  /* =====================================================
     FAVORIS
  ===================================================== */

  async function toggleFavori(id: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "Vous devez être connecté pour ajouter un favori."
      );
      return;
    }

    const dejaFavori =
      favoris.includes(id);

    /* =================================================
       RETIRER UN FAVORI
    ================================================= */

    if (dejaFavori) {
      const { error } =
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", id);

      if (error) {
        console.error(
          "Impossible de retirer le favori :",
          error
        );
        return;
      }

      setFavoris((anciens) =>
        anciens.filter(
          (favori) =>
            favori !== id
        )
      );

      return;
    }

    /* =================================================
       AJOUTER UN FAVORI
    ================================================= */

    const { error } =
      await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          product_id: id,
        });

    if (error) {
      console.error(
        "Impossible d'ajouter le favori :",
        error
      );
      return;
    }

    setFavoris((anciens) => [
      ...anciens,
      id,
    ]);

    /* =================================================
       NOTIFICATION DU PROPRIÉTAIRE DE L'ANNONCE

       La notification est créée uniquement lorsque
       l'article vient d'être ajouté aux favoris.

       Si l'utilisateur retire ensuite le favori,
       aucune notification n'est créée.

       Si l'utilisateur est lui-même propriétaire
       de l'annonce, aucune notification n'est créée.
    ================================================= */

    const produit = products.find(
      (item) => item.id === id
    );

    if (
      produit &&
      produit.user_id &&
      produit.user_id !== user.id
    ) {
      const { data: profilUtilisateur } =
        await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

      const nomUtilisateur =
        profilUtilisateur?.display_name ||
        "Un utilisateur";

      const { error: notificationError } =
        await supabase
          .from("notifications")
          .insert({
            user_id: produit.user_id,
            type: "favorite",
            title:
              "Votre article a été ajouté aux favoris",
            content:
              `${nomUtilisateur} a ajouté votre article « ${produit.name} » à ses favoris.`,
            conversation_id: null,
            is_read: false,
          });

      if (notificationError) {
        console.error(
          "Erreur création notification favori :",
          notificationError
        );
      }
    }
  }

  /* =====================================================
     PRODUITS FILTRÉS
  ===================================================== */

  const produitsFiltres =
    filtrerProduits(
      categorieActive,
      products
    );

  /* =====================================================
     AFFICHAGE
  ===================================================== */

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #fff8fb;
          color: #333333;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        button,
        input {
          font-family: inherit;
        }

        .dona-page {
          min-height: 100vh;
          padding-bottom: 100px;
        }

        .top-header {
          max-width: 1180px;
          margin: 0 auto;
          padding: 22px 28px 8px;
          display: grid;
          grid-template-columns:
            1fr auto 1fr;
          align-items: center;
        }

        .header-left {
          display: flex;
          justify-content: flex-start;
          color: #df78a0;
        }

        .header-right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 20px;
          color: #df78a0;
        }

        .icon-button {
          border: none;
          background: transparent;
          padding: 5px;
          cursor: pointer;
          color: inherit;
        }

        .notification {
          position: relative;
        }

        .nav-icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .nav-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d95b91;
          box-shadow:
            0 0 0 3px white;
        }

        .notification .nav-dot {
          top: 0;
          right: 0;
        }

        .nav-icon-wrapper .nav-dot {
          top: -1px;
          right: -3px;
        }

        .search-area {
          max-width: 1180px;
          margin: 18px auto 0;
          padding: 0 28px;
        }

        .search-box {
          width: 100%;
          height: 62px;
          background: white;
          border: 1px solid #f0e1e7;
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 0 18px;
          box-shadow:
            0 5px 18px
            rgba(150, 100, 120, 0.08);
          color: #aaa;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          color: #444;
          background: transparent;
          padding: 0 13px;
        }

        .search-input::placeholder {
          color: #aaa;
        }

        .filter-button {
          border: none;
          background: transparent;
          color: #83cddd;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .categories {
          max-width: 1180px;
          margin: 20px auto 0;
          padding: 0 28px;
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .categories::-webkit-scrollbar {
          display: none;
        }

        .category-button {
          flex: 0 0 auto;
          min-width: 105px;
          height: 104px;
          border: 1px solid #f0e4e8;
          background: white;
          border-radius: 22px;
          color: #777;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }

        .category-icon {
          font-size: 29px;
          line-height: 1;
          color: #83cddd;
        }

        .category-button.active {
          background: #fff0f5;
          border-color: #f9d7e4;
          color: #df78a0;
        }

        .category-button.active
          .category-icon {
          color: #df78a0;
        }

        .annonces-header {
          max-width: 1180px;
          margin: 32px auto 15px;
          padding: 0 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .annonces-title {
          margin: 0;
          font-size: 23px;
          color: #252525;
        }

        .voir-tout {
          color: #df78a0;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
        }

        .products-grid {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 28px;
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .product-card {
          background: white;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid #f0e4e8;
          box-shadow:
            0 5px 18px
            rgba(130, 90, 110, 0.08);
          text-decoration: none;
          color: inherit;
          transition:
            transform 0.15s ease;
        }

        .product-card:hover {
          transform: translateY(-2px);
        }

        .product-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 0.88;
          background: #f7f1f3;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 14px;
        }

        .favorite-button {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background:
            rgba(255, 255, 255, 0.94);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .product-info {
          padding: 14px 15px 16px;
        }

        .product-name {
          margin: 0 0 7px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          margin: 0 0 8px;
          color: #83cddd;
          font-size: 16px;
          font-weight: 700;
        }

        .product-category {
          margin: 0;
          color: #999;
          font-size: 13px;
        }

        .empty-products {
          max-width: 1180px;
          margin: 40px auto;
          padding: 40px 28px;
          text-align: center;
          color: #999;
        }

        .bottom-nav {
          position: fixed;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%);
          width:
            min(700px, calc(100% - 28px));
          height: 74px;
          background:
            rgba(255, 255, 255, 0.97);
          border: 1px solid #f0e4e8;
          border-radius: 28px;
          box-shadow:
            0 8px 30px
            rgba(100, 70, 90, 0.15);
          display: grid;
          grid-template-columns:
            repeat(5, 1fr);
          align-items: center;
          z-index: 20;
        }

        .bottom-link {
          height: 100%;
          text-decoration: none;
          color: #888;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 11px;
        }

        .bottom-link.active {
          color: #df78a0;
          font-weight: 600;
        }

        .publish-button {
          width: 58px;
          height: 58px;
          margin: -24px auto 0;
          border-radius: 50%;
          background: #83cddd;
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          font-weight: 300;
          box-shadow:
            0 6px 15px
            rgba(131, 205, 221, 0.45);
        }

        @media (max-width: 900px) {
          .products-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .category-button {
            min-width: 96px;
            height: 96px;
          }
        }

        @media (max-width: 600px) {
          .top-header {
            padding: 14px 18px 5px;
          }

          .search-area,
          .categories,
          .annonces-header,
          .products-grid {
            padding-left: 18px;
            padding-right: 18px;
          }

          .search-box {
            height: 56px;
            border-radius: 18px;
          }

          .products-grid {
            gap: 12px;
          }

          .product-card {
            border-radius: 18px;
          }

          .product-info {
            padding: 11px 12px 13px;
          }

          .product-name {
            font-size: 14px;
          }

          .product-price {
            font-size: 14px;
          }

          .bottom-nav {
            height: 70px;
          }
        }
      `}</style>

      <main className="dona-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="top-header">

          <div className="header-left">
            <button
              className="icon-button"
              aria-label="Menu"
            >
              <MenuIcon />
            </button>
          </div>

          <Logo />

          <div className="header-right">

            <Link
              href="/messages"
              className="icon-button notification"
              aria-label="Messages"
            >
              <MessageIcon />

              {hasUnreadMessages && (
                <span className="nav-dot"></span>
              )}
            </Link>

            <Link
              href="/profil"
              className="icon-button"
              aria-label="Profil"
            >
              <UserIcon />
            </Link>

          </div>
        </header>

        {/* =================================================
            RECHERCHE
        ================================================= */}

        <section className="search-area">

          <div className="search-box">

            <SearchIcon />

            <input
              className="search-input"
              type="search"
              placeholder="Rechercher un article, une catégorie..."
              value={recherche}
              onChange={(e) =>
                setRecherche(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  lancerRecherche();
                }
              }}
            />

            <button
              className="filter-button"
              type="button"
              aria-label="Filtres"
              onClick={() => {
                window.location.href =
                  "/acheter";
              }}
            >
              <SlidersIcon />
            </button>

          </div>
        </section>

        {/* =================================================
            CATÉGORIES
        ================================================= */}

        <section className="categories">

          {categories.map(
            (categorie) => (
              <button
                key={categorie.value}
                className={`category-button ${
                  categorieActive ===
                  categorie.value
                    ? "active"
                    : ""
                }`}
                type="button"
                onClick={() => {
                  setCategorieActive(
                    categorie.value
                  );
                }}
              >
                <span className="category-icon">
                  {categorie.icon}
                </span>

                <span>
                  {categorie.name}
                </span>
              </button>
            )
          )}

        </section>

        {/* =================================================
            TITRE
        ================================================= */}

        <section className="annonces-header">

          <h1 className="annonces-title">
            Découvrez les annonces
          </h1>

          <Link
            href="/annonces"
            className="voir-tout"
          >
            Voir tout →
          </Link>

        </section>

        {/* =================================================
            PRODUITS
        ================================================= */}

        {produitsFiltres.length > 0 ? (

          <section className="products-grid">

            {produitsFiltres.map(
              (product) => (

                <Link
                  href={`/acheter/${product.id}`}
                  className="product-card"
                  key={product.id}
                >

                  <div className="product-image-wrapper">

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="no-image">
                        Pas de photo
                      </div>
                    )}

                    <button
                      type="button"
                      className="favorite-button"
                      aria-label={
                        favoris.includes(
                          product.id
                        )
                          ? "Retirer des favoris"
                          : "Ajouter aux favoris"
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        toggleFavori(
                          product.id
                        );
                      }}
                    >
                      <HeartIcon
                        filled={favoris.includes(
                          product.id
                        )}
                      />
                    </button>

                  </div>

                  <div className="product-info">

                    <h2 className="product-name">
                      {product.name}
                    </h2>

                    <p className="product-price">
                      {Number(
                        product.price
                      ).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      FCFA
                    </p>

                    <p className="product-category">
                      {product.category ||
                        "Autre"}
                    </p>

                  </div>

                </Link>
              )
            )}

          </section>

        ) : (

          <div className="empty-products">
            <p>
              Aucune annonce disponible
              pour cette catégorie.
            </p>
          </div>

        )}

        {/* =================================================
            NAVIGATION DU BAS
        ================================================= */}

        <nav className="bottom-nav">

          <Link
            href="/accueil"
            className="bottom-link active"
          >
            <span
              style={{
                fontSize: "25px",
              }}
            >
              ⌂
            </span>

            <span>
              Accueil
            </span>
          </Link>

          <Link
            href="/recherche"
            className="bottom-link"
          >
            <SearchIcon />

            <span>
              Recherche
            </span>
          </Link>

          <Link
            href="/vendre"
            className="publish-button"
            aria-label="Publier"
          >
            +
          </Link>

          <Link
            href="/messages"
            className="bottom-link"
          >
            <span className="nav-icon-wrapper">

              <MessageIcon />

              {hasUnreadMessages && (
                <span className="nav-dot"></span>
              )}

            </span>

            <span>
              Messages
            </span>
          </Link>

          <Link
            href="/notifications"
            className="bottom-link"
            aria-label="Notifications"
          >
            <span className="nav-icon-wrapper">

              <NotificationIcon />

              {hasUnreadNotifications && (
                <span className="nav-dot"></span>
              )}

            </span>

            <span>
              Notifications
            </span>
          </Link>

        </nav>

      </main>
    </>
  );
}