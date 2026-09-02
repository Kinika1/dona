"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

type Product = {
  id: number;
  created_at: string;
  name: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  image_url: string | null;
};

export default function Recherche() {
  const searchParams = useSearchParams();
  const recherche = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function rechercherProduits() {
      setLoading(true);
      setErrorMessage("");

      const terme = recherche.trim();

      if (!terme) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, created_at, name, description, price, category, user_id, image_url"
        )
        .or(
          `name.ilike.%${terme}%,description.ilike.%${terme}%,category.ilike.%${terme}%`
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        setErrorMessage(
          "Erreur lors de la recherche : " + error.message
        );
        setLoading(false);
        return;
      }

      setProducts(data || []);
      setLoading(false);
    }

    rechercherProduits();
  }, [recherche]);

  return (
    <main className="page">

      {/* ================= HEADER ================= */}

      <header className="topbar">

        <Link href="/accueil" className="logo">
          <span className="logo-d">D</span>
          <span>ONA</span>
        </Link>

        <nav>
          <Link href="/acheter">Acheter</Link>
          <Link href="/vendre">Vendre</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/profil">Profil</Link>
        </nav>

      </header>


      {/* ================= CONTENU ================= */}

      <section className="content">

        <Link href="/accueil" className="back">
          <span>←</span>
          Retour à l'accueil
        </Link>


        {/* INTRODUCTION */}

        <div className="title-area">

          <div className="eyebrow">
            <span></span>
            DONA
          </div>

          <h1>
            Trouvez ce que
            <br />
            <span>vous cherchez.</span>
          </h1>

          {recherche ? (
            <p>
              Résultats de recherche pour{" "}
              <strong>« {recherche} »</strong>
            </p>
          ) : (
            <p>
              Recherchez facilement parmi les annonces
              disponibles sur DONA.
            </p>
          )}

        </div>


        {/* ================= BARRE DE RECHERCHE ================= */}

        <form action="/recherche" className="search-box">

          <div className="search-symbol">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
              />
              <path d="M16 16L21 21" />
            </svg>
          </div>

          <input
            type="text"
            name="q"
            defaultValue={recherche}
            placeholder="Que recherchez-vous ?"
          />

          <button type="submit">
            Rechercher
          </button>

        </form>


        {/* ================= CHARGEMENT ================= */}

        {loading && (
          <div className="state">

            <div className="loader"></div>

            <h2>Recherche en cours...</h2>

            <p>
              Nous cherchons les meilleures annonces pour vous.
            </p>

          </div>
        )}


        {/* ================= ERREUR ================= */}

        {errorMessage && (
          <div className="error">

            <div className="error-icon">!</div>

            <div>
              <strong>Une erreur est survenue</strong>
              <p>{errorMessage}</p>
            </div>

          </div>
        )}


        {/* ================= AUCUN RÉSULTAT ================= */}

        {!loading &&
          !errorMessage &&
          recherche &&
          products.length === 0 && (

            <div className="empty">

              <div className="empty-heart">
                ♡
              </div>

              <h2>Aucun résultat</h2>

              <p>
                Nous n'avons trouvé aucune annonce
                correspondant à
                <strong> « {recherche} »</strong>.
              </p>

              <div className="empty-actions">

                <Link
                  href="/acheter"
                  className="primary-button"
                >
                  Découvrir les annonces
                </Link>

                <Link
                  href="/accueil"
                  className="secondary-button"
                >
                  Nouvelle recherche
                </Link>

              </div>

            </div>
          )}


        {/* ================= RÉSULTATS ================= */}

        {!loading &&
          !errorMessage &&
          products.length > 0 && (

            <>

              <div className="results-header">

                <div>

                  <span className="results-label">
                    RÉSULTATS
                  </span>

                  <h2>
                    {products.length}{" "}
                    {products.length > 1
                      ? "annonces trouvées"
                      : "annonce trouvée"}
                  </h2>

                </div>

              </div>


              <section className="products-grid">

                {products.map((product) => (

                  <article
                    key={product.id}
                    className="product-card"
                  >

                    {/* IMAGE */}

                    <Link
                      href={`/acheter/${product.id}`}
                      className="image-container"
                    >

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={product.name}
                        />

                      ) : (

                        <div className="no-image">

                          <div className="no-image-icon">
                            ♡
                          </div>

                          <span>
                            Pas de photo
                          </span>

                        </div>
                      )}

                      <span className="category">
                        {product.category}
                      </span>

                      <span className="favorite-icon">
                        ♡
                      </span>

                    </Link>


                    {/* INFORMATIONS */}

                    <div className="product-info">

                      <h3>
                        {product.name}
                      </h3>

                      <p className="description">
                        {product.description}
                      </p>

                      <div className="product-bottom">

                        <div>

                          <div className="price">
                            {Number(
                              product.price
                            ).toLocaleString("fr-FR")}{" "}
                            <span>FCFA</span>
                          </div>

                          <p className="date">
                            Publié le{" "}
                            {new Date(
                              product.created_at
                            ).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>

                        </div>

                      </div>

                      <Link
                        href={`/acheter/${product.id}`}
                        className="product-button"
                      >
                        Voir l'annonce
                        <span>→</span>
                      </Link>

                    </div>

                  </article>

                ))}

              </section>

            </>
          )}

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <div className="footer-logo">
          DONA
        </div>

        <p>
          Achetez. Vendez. Échangez.
        </p>

        <span>
          © DONA
        </span>

      </footer>


      {/* ================= DESIGN ================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 85% 5%,
              rgba(247, 205, 224, 0.28),
              transparent 28%
            ),
            #fff9fc;
          color: #33242c;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* ================= HEADER ================= */

        .topbar {
          height: 76px;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.94);
          border-bottom: 1px solid #f2e1e9;
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(12px);
        }


        .logo {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #d6538b;
          text-decoration: none;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 1px;
        }


        .logo-d {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #f7d5e3;
          color: #c9477c;
          font-size: 21px;
        }


        nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }


        nav a {
          color: #594651;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s ease;
        }


        nav a:hover {
          color: #d6538b;
        }


        /* ================= CONTENU ================= */

        .content {
          width: min(1120px, 100%);
          margin: 0 auto;
          padding: 38px 28px 80px;
        }


        .back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #9e607c;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: 0.2s ease;
        }


        .back:hover {
          color: #d6538b;
          transform: translateX(-2px);
        }


        .back span {
          font-size: 18px;
        }


        /* ================= TITRE ================= */

        .title-area {
          margin-top: 50px;
          margin-bottom: 30px;
        }


        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d6538b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }


        .eyebrow span {
          width: 25px;
          height: 2px;
          background: #e89abb;
          border-radius: 5px;
        }


        .title-area h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 55px);
          line-height: 1.05;
          letter-spacing: -1.8px;
          color: #33242c;
          font-weight: 800;
        }


        .title-area h1 span {
          color: #d6538b;
        }


        .title-area p {
          margin: 16px 0 0;
          color: #876f7a;
          font-size: 15px;
          line-height: 1.6;
        }


        .title-area strong {
          color: #c7477c;
        }


        /* ================= RECHERCHE ================= */

        .search-box {
          width: 100%;
          min-height: 68px;
          padding: 7px;
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #efdce5;
          border-radius: 18px;
          box-shadow:
            0 12px 35px rgba(178, 87, 127, 0.08);
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
          margin-bottom: 48px;
        }


        .search-box:focus-within {
          border-color: #df8fb0;
          box-shadow:
            0 14px 38px rgba(178, 87, 127, 0.13);
        }


        .search-symbol {
          width: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
        }


        .search-symbol svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #ce7198;
          stroke-width: 1.8;
          stroke-linecap: round;
        }


        .search-box input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #382932;
          font-size: 15px;
          padding: 16px 8px;
        }


        .search-box input::placeholder {
          color: #b39ca7;
        }


        .search-box button {
          border: none;
          background: #d6538b;
          color: white;
          padding: 14px 23px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 7px 16px rgba(214, 83, 139, 0.22);
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }


        .search-box button:hover {
          background: #c7467d;
          transform: translateY(-1px);
        }


        /* ================= RÉSULTATS ================= */

        .results-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20px;
        }


        .results-label {
          display: block;
          color: #c96b91;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }


        .results-header h2 {
          margin: 0;
          font-size: 22px;
          color: #3a2932;
        }


        /* ================= CARTES ================= */

        .products-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 24px;
        }


        .product-card {
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 22px;
          overflow: hidden;
          box-shadow:
            0 8px 28px rgba(168, 81, 120, 0.07);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }


        .product-card:hover {
          transform: translateY(-6px);
          box-shadow:
            0 18px 38px rgba(168, 81, 120, 0.13);
        }


        /* ================= IMAGE ================= */

        .image-container {
          display: block;
          height: 255px;
          position: relative;
          background: #f9edf3;
          overflow: hidden;
          text-decoration: none;
        }


        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }


        .product-card:hover
        .image-container img {
          transform: scale(1.04);
        }


        .category {
          position: absolute;
          top: 13px;
          left: 13px;
          padding: 7px 11px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.94);
          color: #ad4e79;
          font-size: 10px;
          font-weight: 800;
          box-shadow:
            0 4px 12px rgba(92, 44, 65, 0.08);
        }


        .favorite-icon {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.94);
          color: #c95c87;
          border-radius: 50%;
          font-size: 20px;
          box-shadow:
            0 4px 12px rgba(92, 44, 65, 0.08);
        }


        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #bd8ca4;
        }


        .no-image-icon {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4dce7;
          font-size: 30px;
          margin-bottom: 9px;
        }


        .no-image span {
          font-size: 11px;
          font-weight: 600;
        }


        /* ================= INFOS PRODUIT ================= */

        .product-info {
          padding: 19px;
        }


        .product-info h3 {
          margin: 0 0 7px;
          color: #35262e;
          font-size: 18px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }


        .description {
          color: #88717b;
          font-size: 12px;
          line-height: 1.55;
          height: 38px;
          overflow: hidden;
          margin: 0 0 14px;
        }


        .product-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }


        .price {
          color: #d04e85;
          font-size: 19px;
          font-weight: 900;
        }


        .price span {
          font-size: 11px;
          font-weight: 800;
        }


        .date {
          margin: 5px 0 16px;
          color: #ad99a2;
          font-size: 10px;
        }


        .product-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          color: #b64275;
          background: #fceaf2;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 12px;
          font-weight: 800;
          transition: 0.2s ease;
        }


        .product-button span {
          font-size: 17px;
          transition: transform 0.2s ease;
        }


        .product-button:hover {
          background: #f8dbe7;
        }


        .product-button:hover span {
          transform: translateX(4px);
        }


        /* ================= CHARGEMENT ================= */

        .state {
          text-align: center;
          padding: 80px 20px;
        }


        .loader {
          width: 38px;
          height: 38px;
          margin: 0 auto 18px;
          border: 3px solid #f1d9e4;
          border-top-color: #d6538b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }


        .state h2 {
          margin: 0 0 7px;
          color: #493640;
          font-size: 18px;
        }


        .state p {
          margin: 0;
          color: #947d88;
          font-size: 13px;
        }


        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* ================= ERREUR ================= */

        .error {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 17px;
          background: #fff2f2;
          border: 1px solid #f2d1d1;
          border-radius: 15px;
          color: #a94b4b;
        }


        .error-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f3d0d0;
          font-weight: 900;
        }


        .error strong {
          font-size: 13px;
        }


        .error p {
          margin: 4px 0 0;
          font-size: 12px;
        }


        /* ================= AUCUN RÉSULTAT ================= */

        .empty {
          max-width: 620px;
          margin: 20px auto;
          padding: 65px 30px;
          text-align: center;
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 25px;
          box-shadow:
            0 12px 35px rgba(168, 81, 120, 0.07);
        }


        .empty-heart {
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fce8f1;
          color: #d6538b;
          font-size: 38px;
        }


        .empty h2 {
          margin: 0 0 9px;
          color: #3a2932;
          font-size: 24px;
        }


        .empty p {
          max-width: 420px;
          margin: 0 auto 26px;
          color: #88727d;
          font-size: 13px;
          line-height: 1.6;
        }


        .empty p strong {
          color: #c94c81;
        }


        .empty-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }


        .primary-button,
        .secondary-button {
          padding: 12px 18px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }


        .primary-button {
          color: white;
          background: #d6538b;
          box-shadow:
            0 7px 16px rgba(214, 83, 139, 0.18);
        }


        .secondary-button {
          color: #a94d77;
          background: #fce8f1;
        }


        /* ================= FOOTER ================= */

        footer {
          min-height: 115px;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          flex-wrap: wrap;
          background: white;
          border-top: 1px solid #f0dfe7;
        }


        .footer-logo {
          color: #d6538b;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 1px;
        }


        footer p {
          margin: 0;
          color: #9c8590;
          font-size: 12px;
        }


        footer > span {
          color: #c0aab4;
          font-size: 11px;
        }


        /* ================= TABLETTE ================= */

        @media (max-width: 850px) {

          .topbar {
            padding: 0 25px;
          }

          nav {
            gap: 15px;
          }

          .products-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }


        /* ================= MOBILE ================= */

        @media (max-width: 600px) {

          .topbar {
            height: 68px;
            padding: 0 16px;
          }


          .logo {
            font-size: 23px;
          }


          .logo-d {
            width: 30px;
            height: 30px;
            font-size: 18px;
          }


          nav {
            gap: 9px;
          }


          nav a {
            font-size: 11px;
          }


          nav a:nth-child(3) {
            display: none;
          }


          .content {
            padding: 27px 15px 55px;
          }


          .title-area {
            margin-top: 38px;
            margin-bottom: 24px;
          }


          .title-area h1 {
            font-size: 38px;
            letter-spacing: -1.2px;
          }


          .title-area p {
            font-size: 13px;
          }


          .search-box {
            min-height: 60px;
            border-radius: 15px;
            margin-bottom: 38px;
          }


          .search-symbol {
            width: 40px;
          }


          .search-symbol svg {
            width: 19px;
            height: 19px;
          }


          .search-box input {
            font-size: 13px;
            padding: 13px 5px;
          }


          .search-box button {
            padding: 12px 13px;
            border-radius: 11px;
            font-size: 11px;
          }


          .products-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }


          .image-container {
            height: 280px;
          }


          .product-info {
            padding: 17px;
          }


          .empty {
            padding: 50px 20px;
          }


          .empty-actions {
            flex-direction: column;
          }


          .primary-button,
          .secondary-button {
            width: 100%;
          }


          footer {
            flex-direction: column;
            gap: 7px;
          }

        }

      `}</style>

    </main>
  );
}

