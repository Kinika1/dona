"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams, useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  user_id: string;
  image_url: string | null;
};

type Seller = {
  id: string;
  display_name: string | null;
};

export default function Produit() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);

  const [message, setMessage] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [loadingContact, setLoadingContact] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");

  useEffect(() => {
    async function getProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, category, created_at, user_id, image_url"
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur Supabase :", error);
        setMessage("Impossible de charger ce produit.");
        return;
      }

      setProduct(data);

      // Comptabiliser une vue
      const { error: viewError } = await supabase.rpc(
        "increment_product_views",
        {
          product_id: data.id,
        }
      );

      if (viewError) {
        console.error(
          "Erreur lors du comptage de la vue :",
          viewError
        );
      }

      // Vérifier si l'utilisateur connecté a déjà ajouté
      // cette annonce à ses favoris
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: favoriteData, error: favoriteError } =
          await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", data.id)
            .maybeSingle();

        if (favoriteError) {
          console.error(
            "Erreur lors de la vérification du favori :",
            favoriteError
          );
        } else {
          setIsFavorite(!!favoriteData);
        }
      }

      // Récupérer le profil du vendeur
      const { data: sellerData, error: sellerError } =
        await supabase
          .from("profiles")
          .select("id, display_name")
          .eq("id", data.user_id)
          .single();

      if (sellerError) {
        console.error(
          "Erreur lors du chargement du profil vendeur :",
          sellerError
        );
        return;
      }

      setSeller(sellerData);
    }

    if (id) {
      getProduct();
    }
  }, [id]);

  async function gererFavori() {
    setFavoriteMessage("");
    setLoadingFavorite(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setFavoriteMessage(
          "Vous devez être connecté pour ajouter une annonce aux favoris."
        );

        return;
      }

      if (!product) {
        setFavoriteMessage("Produit introuvable.");
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

        if (error) {
          console.error(
            "Erreur lors de la suppression du favori :",
            error
          );

          setFavoriteMessage(
            "Impossible de retirer cette annonce des favoris."
          );

          return;
        }

        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

        if (error) {
          console.error(
            "Erreur lors de l'ajout du favori :",
            error
          );

          setFavoriteMessage(
            "Impossible d'ajouter cette annonce aux favoris."
          );

          return;
        }

        setIsFavorite(true);
      }
    } catch (error) {
      console.error(
        "Erreur inattendue lors de la gestion du favori :",
        error
      );

      setFavoriteMessage(
        "Une erreur est survenue."
      );
    } finally {
      setLoadingFavorite(false);
    }
  }

  async function contacterVendeur() {
    setContactMessage("");
    setLoadingContact(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setContactMessage(
          "Vous devez être connecté pour contacter le vendeur."
        );
        return;
      }

      if (!product) {
        setContactMessage("Produit introuvable.");
        return;
      }

      if (user.id === product.user_id) {
        setContactMessage(
          "Vous ne pouvez pas contacter le vendeur de votre propre produit."
        );
        return;
      }

      const {
        data: existingConversation,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select("id")
        .eq("buyer", user.id)
        .eq("seller_id", product.user_id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (conversationError) {
        console.error(
          "Erreur lors de la recherche de la conversation :",
          conversationError
        );

        setContactMessage(
          "ERREUR RECHERCHE : " + conversationError.message
        );

        return;
      }

      if (existingConversation) {
        router.push(`/messages/${existingConversation.id}`);
        return;
      }

      const {
        data: newConversation,
        error: insertError,
      } = await supabase
        .from("conversations")
        .insert({
          buyer: user.id,
          seller_id: product.user_id,
          product_id: product.id,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error(
          "Erreur lors de la création de la conversation :",
          insertError
        );

        setContactMessage(
          "ERREUR CREATION : " + insertError.message
        );

        return;
      }

      if (!newConversation) {
        setContactMessage(
          "ERREUR : la conversation n'a pas été retournée par Supabase."
        );

        return;
      }

      router.push(`/messages/${newConversation.id}`);
    } catch (error) {
      console.error("Erreur inattendue :", error);

      setContactMessage(
        "ERREUR INATTENDUE : " + String(error)
      );
    } finally {
      setLoadingContact(false);
    }
  }

  if (message) {
    return (
      <main
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h1>DONA</h1>

        <p>{message}</p>

        <Link href="/acheter">
          Retour aux produits
        </Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h1>DONA</h1>

        <p>Chargement du produit...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <header>
        <h1>DONA</h1>

        <p>Achetez. Vendez. Échangez.</p>
      </header>

      <section
        style={{
          marginTop: "20px",
        }}
      >
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: "12px",
              display: "block",
              margin: "0 auto 20px",
            }}
          />
        )}

        <h2>{product.name}</h2>

        <p>{product.description}</p>

        <p>
          <strong>
            {Number(product.price).toLocaleString("fr-FR")} FCFA
          </strong>
        </p>

        <p>
          Catégorie : {product.category}
        </p>

        <p>
          Publié le{" "}
          {new Date(
            product.created_at
          ).toLocaleDateString("fr-FR")}
        </p>

        {/* Vendeur */}

        <div style={{ marginTop: "20px" }}>
          <strong>Vendeur : </strong>

          {seller ? (
            <Link href={`/vendeur/${product.user_id}`}>
              {seller.display_name ||
                "Voir le profil du vendeur"}
            </Link>
          ) : (
            <span>Chargement du vendeur...</span>
          )}
        </div>

        {/* FAVORI */}

        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            onClick={gererFavori}
            disabled={loadingFavorite}
            style={{
              padding: "10px 16px",
              cursor: loadingFavorite
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loadingFavorite
              ? "Chargement..."
              : isFavorite
              ? "❤️ Retirer des favoris"
              : "♡ Ajouter aux favoris"}
          </button>

          {favoriteMessage && (
            <p style={{ marginTop: "10px" }}>
              {favoriteMessage}
            </p>
          )}
        </div>
      </section>

      <section
        style={{
          marginTop: "25px",
        }}
      >
        <button
          type="button"
          onClick={contacterVendeur}
          disabled={loadingContact}
          style={{
            padding: "12px 20px",
            cursor: loadingContact
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loadingContact
            ? "Ouverture..."
            : "Contacter le vendeur"}
        </button>

        {contactMessage && (
          <p style={{ marginTop: "15px" }}>
            {contactMessage}
          </p>
        )}
      </section>

      <div
        style={{
          marginTop: "25px",
        }}
      >
        <Link href="/acheter">
          Retour aux produits
        </Link>
      </div>
    </main>
  );
}