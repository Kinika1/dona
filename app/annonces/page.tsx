"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type ProductImage = {
  id: number;
  product_id: number;
  image_url: string;
};

type Product = {
  id: number;
  created_at: string;
  name: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  image_url: string | null;
  images?: ProductImage[];
};

export default function Annonces() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, created_at, name, description, price, category, user_id, image_url"
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        setErrorMessage("ERREUR ANNONCES : " + error.message);
        setLoading(false);
        return;
      }

      const productsData = data || [];

      const productIds = productsData.map(
        (product) => product.id
      );

      let images: ProductImage[] = [];

      if (productIds.length > 0) {
        const {
          data: imagesData,
          error: imagesError,
        } = await supabase
          .from("product_images")
          .select("id, product_id, image_url")
          .in("product_id", productIds)
          .order("id", {
            ascending: true,
          });

        if (imagesError) {
          console.error(
            "Erreur chargement des photos :",
            imagesError.message
          );
        } else {
          images = imagesData || [];
        }
      }

      const productsWithImages: Product[] = productsData.map(
        (product) => ({
          ...product,
          images: images.filter(
            (image) => image.product_id === product.id
          ),
        })
      );

      setProducts(productsWithImages);
      setLoading(false);
    }

    loadProducts();
  }, []);

  async function supprimerAnnonce(product: Product) {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer l'annonce "${product.name}" ?\n\nCette action est irréversible.`
    );

    if (!confirmation) {
      return;
    }

    setDeletingId(product.id);
    setDeleteMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setDeleteMessage(
        "Vous devez être connecté pour supprimer cette annonce."
      );
      setDeletingId(null);
      return;
    }

    if (user.id !== product.user_id) {
      setDeleteMessage(
        "Vous n'êtes pas autorisé à supprimer cette annonce."
      );
      setDeletingId(null);
      return;
    }

    const {
      data: deletedProduct,
      error,
    } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Erreur lors de la suppression :",
        error
      );

      setDeleteMessage(
        "Erreur lors de la suppression : " +
          error.message
      );

      setDeletingId(null);
      return;
    }

    if (!deletedProduct) {
      setDeleteMessage(
        "L'annonce n'a pas pu être supprimée."
      );

      setDeletingId(null);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (item) => item.id !== product.id
      )
    );

    setDeleteMessage(
      "Annonce supprimée avec succès."
    );

    setDeletingId(null);
  }

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

        <section className="loading-section">
          <div className="loader"></div>
          <h2>Chargement des annonces...</h2>
          <p>Un instant, nous préparons votre espace DONA.</p>
        </section>
      </main>
    );
  }

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

        <section className="content">
          <Link href="/accueil" className="back">
            ← Retour à l'accueil
          </Link>

          <div className="error-box">
            <div className="error-icon">!</div>
            <h2>Une erreur est survenue</h2>
            <p>{errorMessage}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">

      {/* NAVIGATION */}
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

      {/* CONTENU */}
      <section className="content">

        <Link href="/accueil" className="back">
          ← Retour à l'accueil
        </Link>

        <div className="title-area">
          <span className="small-title">
            DONA · ANNONCES
          </span>

          <h1>Toutes les annonces</h1>

          <p>
            Découvrez les articles actuellement proposés
            sur DONA.
          </p>
        </div>

        {/* MESSAGE SUPPRESSION */}
        {deleteMessage && (
          <div className="success-message">
            <span>✓</span>
            {deleteMessage}
          </div>
        )}

        {/* AUCUNE ANNONCE */}
        {products.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">♡</div>

            <h2>Aucune annonce pour le moment</h2>

            <p>
              Il n'y a encore aucune annonce publiée
              sur DONA.
            </p>

            <Link
              href="/vendre"
              className="empty-button"
            >
              Publier une annonce
            </Link>
          </div>
        ) : (
          <>
            <div className="results-header">
              <div>
                <h2>
                  {products.length}{" "}
                  {products.length > 1
                    ? "annonces"
                    : "annonce"}
                </h2>

                <p>
                  Les annonces les plus récentes
                  apparaissent en premier.
                </p>
              </div>

              <Link
                href="/vendre"
                className="sell-button"
              >
                + Vendre
              </Link>
            </div>

            {/* GRILLE */}
            <section className="products-grid">

              {products.map((product) => {

                const photos =
                  product.images &&
                  product.images.length > 0
                    ? product.images
                    : product.image_url
                    ? [
                        {
                          id: 0,
                          product_id: product.id,
                          image_url:
                            product.image_url,
                        },
                      ]
                    : [];

                const isOwner =
                  currentUserId === product.user_id;

                return (
                  <article
                    key={product.id}
                    className="product-card"
                  >

                    {/* IMAGE */}
                    <div className="image-container">

                      {photos.length > 0 ? (
                        <img
                          src={photos[0].image_url}
                          alt={product.name}
                        />
                      ) : (
                        <div className="no-image">
                          <span>♡</span>
                          <p>Pas de photo</p>
                        </div>
                      )}

                      <span className="category">
                        {product.category}
                      </span>

                      {photos.length > 1 && (
                        <span className="photo-count">
                          📷 {photos.length}
                        </span>
                      )}

                    </div>

                    {/* INFORMATIONS */}
                    <div className="product-info">

                      <div className="product-top">
                        <h3>{product.name}</h3>

                        {isOwner && (
                          <span className="owner-badge">
                            Votre annonce
                          </span>
                        )}
                      </div>

                      <p className="description">
                        {product.description}
                      </p>

                      <div className="price">
                        {Number(
                          product.price
                        ).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </div>

                      <p className="date">
                        Publié le{" "}
                        {new Date(
                          product.created_at
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>

                      <Link
                        href={`/acheter/${product.id}`}
                        className="product-button"
                      >
                        Voir le produit
                      </Link>

                      {/* ACTIONS PROPRIÉTAIRE */}
                      {isOwner && (
                        <div className="owner-actions">

                          <Link
                            href={`/modifier/${product.id}`}
                            className="edit-button"
                          >
                            Modifier
                          </Link>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              supprimerAnnonce(
                                product
                              )
                            }
                            disabled={
                              deletingId ===
                              product.id
                            }
                          >
                            {deletingId ===
                            product.id
                              ? "Suppression..."
                              : "Supprimer"}
                          </button>

                        </div>
                      )}

                    </div>
                  </article>
                );
              })}

            </section>
          </>
        )}

      </section>

      {/* FOOTER */}
      <footer>
        <strong>DONA</strong>
        <span>Achetez. Vendez. Échangez.</span>
      </footer>

      <style jsx>{`

        .page {
          min-height: 100vh;
          background: #fff9fc;
          color: #352832;
          font-family: Arial, sans-serif;
        }

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
          z-index: 20;
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
          transition: color 0.2s ease;
        }

        nav a:hover {
          color: #d95b91;
        }

        .content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 35px 25px 70px;
        }

        .back {
          color: #a85a7d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .title-area {
          margin-top: 35px;
          margin-bottom: 35px;
        }

        .small-title {
          color: #d95b91;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        h1 {
          margin: 7px 0 8px;
          font-size: 38px;
          color: #30232b;
        }

        .title-area p {
          margin: 0;
          color: #806c77;
          font-size: 16px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .results-header h2 {
          margin: 0 0 5px;
          font-size: 20px;
          color: #352832;
        }

        .results-header p {
          margin: 0;
          color: #9a7e8b;
          font-size: 13px;
        }

        .sell-button {
          background: #d95b91;
          color: white;
          text-decoration: none;
          padding: 12px 19px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 6px 15px rgba(217, 91, 145, 0.18);
          transition: all 0.2s ease;
        }

        .sell-button:hover {
          background: #c94d83;
          transform: translateY(-1px);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .product-card {
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(160, 85, 120, 0.07);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(160, 85, 120, 0.13);
        }

        .image-container {
          height: 245px;
          position: relative;
          background: #f8edf2;
          overflow: hidden;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .category {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.94);
          color: #a84f78;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .photo-count {
          position: absolute;
          right: 12px;
          bottom: 12px;
          background: rgba(50, 35, 43, 0.75);
          color: white;
          padding: 6px 9px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .no-image {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #c28ca6;
        }

        .no-image span {
          font-size: 38px;
        }

        .no-image p {
          margin: 6px 0;
          font-size: 12px;
        }

        .product-info {
          padding: 18px;
        }

        .product-top {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .product-info h3 {
          margin: 0;
          font-size: 18px;
          color: #352832;
        }

        .owner-badge {
          display: inline-block;
          width: fit-content;
          background: #fce6f0;
          color: #b43f72;
          padding: 5px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
        }

        .description {
          color: #806c77;
          font-size: 13px;
          line-height: 1.5;
          min-height: 40px;
          margin: 10px 0 13px;

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price {
          color: #d04e88;
          font-size: 19px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .date {
          color: #a18d97;
          font-size: 11px;
          margin: 0 0 15px;
        }

        .product-button {
          display: block;
          text-align: center;
          background: #fce6f0;
          color: #b43f72;
          text-decoration: none;
          padding: 11px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 700;
          transition: background 0.2s ease;
        }

        .product-button:hover {
          background: #f8d7e5;
        }

        .owner-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 10px;
        }

        .edit-button,
        .delete-button {
          padding: 10px;
          border-radius: 10px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
        }

        .edit-button {
          background: #f5eef2;
          color: #65505c;
        }

        .delete-button {
          background: #fff0f0;
          color: #b44747;
          border: 1px solid #f3d5d5;
        }

        .delete-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #eefaf2;
          border: 1px solid #d1ead9;
          color: #3d7651;
          padding: 13px 15px;
          border-radius: 12px;
          margin-bottom: 22px;
          font-size: 13px;
          font-weight: 600;
        }

        .success-message span {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #d7f0df;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .empty {
          text-align: center;
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 22px;
          padding: 60px 25px;
          max-width: 600px;
          margin: 25px auto;
          box-shadow: 0 8px 25px rgba(160, 85, 120, 0.05);
        }

        .empty-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: #fce6f0;
          color: #d95b91;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .empty h2 {
          margin: 0 0 8px;
          font-size: 21px;
        }

        .empty p {
          color: #806c77;
          font-size: 14px;
          margin-bottom: 25px;
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

        .loading-section {
          min-height: 65vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: #806c77;
        }

        .loading-section h2 {
          margin: 5px 0;
          color: #352832;
          font-size: 20px;
        }

        .loading-section p {
          font-size: 13px;
        }

        .loader {
          width: 32px;
          height: 32px;
          border: 3px solid #f2d9e4;
          border-top-color: #d95b91;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-box {
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 20px;
          padding: 50px 25px;
          text-align: center;
          max-width: 600px;
          margin: 50px auto;
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
          margin: 0 auto 15px;
          font-size: 25px;
          font-weight: 800;
        }

        .error-box h2 {
          margin: 0 0 10px;
        }

        .error-box p {
          color: #806c77;
          font-size: 13px;
        }

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

        @media (max-width: 800px) {

          nav {
            gap: 12px;
          }

          nav a {
            font-size: 12px;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 560px) {

          .topbar {
            padding: 0 18px;
          }

          nav {
            gap: 10px;
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

          .results-header {
            align-items: flex-start;
            gap: 15px;
          }

          .sell-button {
            padding: 10px 13px;
            font-size: 12px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .image-container {
            height: 270px;
          }

          .owner-actions {
            grid-template-columns: 1fr 1fr;
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

