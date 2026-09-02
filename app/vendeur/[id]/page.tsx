"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Seller = {
  id: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  show_email: boolean;
  show_phone: boolean;
  created_at: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  image_url: string | null;
};

export default function ProfilVendeur() {
  const params = useParams();

  const sellerId = params.id as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSellerProfile() {
      setLoading(true);
      setMessage("");

      const { data: sellerData, error: sellerError } =
        await supabase
          .from("profiles")
          .select(
            "id, display_name, phone, email, avatar_url, show_email, show_phone, created_at"
          )
          .eq("id", sellerId)
          .single();

      if (sellerError) {
        console.error(
          "Erreur lors du chargement du vendeur :",
          sellerError
        );

        setMessage("Impossible de trouver ce vendeur.");
        setLoading(false);
        return;
      }

      setSeller(sellerData);

      const { data: productsData, error: productsError } =
        await supabase
          .from("products")
          .select(
            "id, name, description, price, category, created_at, image_url"
          )
          .eq("user_id", sellerId)
          .order("created_at", { ascending: false });

      if (productsError) {
        console.error(
          "Erreur lors du chargement des annonces :",
          productsError
        );

        setMessage(
          "Impossible de charger les annonces de ce vendeur."
        );

        setLoading(false);
        return;
      }

      setProducts(productsData || []);
      setLoading(false);
    }

    if (sellerId) {
      getSellerProfile();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h1>DONA</h1>

        <p>Chargement du profil vendeur...</p>
      </main>
    );
  }

  if (message || !seller) {
    return (
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h1>DONA</h1>

        <p>{message || "Vendeur introuvable."}</p>

        <Link href="/acheter">
          Retour aux produits
        </Link>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <header>
        <h1>DONA</h1>

        <p>Achetez. Vendez. Échangez.</p>
      </header>

      {/* PROFIL DU VENDEUR */}

      <section
        style={{
          marginTop: "30px",
        }}
      >
        {seller.avatar_url && (
          <img
            src={seller.avatar_url}
            alt={
              seller.display_name ||
              "Photo du vendeur"
            }
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "50%",
              display: "block",
              marginBottom: "15px",
            }}
          />
        )}

        <h2>
          {seller.display_name || "Vendeur"}
        </h2>

        {/* DATE D'INSCRIPTION */}

        {seller.created_at && (
          <p>
            <strong>Membre depuis :</strong>{" "}
            {new Date(
              seller.created_at
            ).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        {/* NOMBRE D'ANNONCES */}

        <p>
          <strong>
            {products.length}{" "}
            {products.length === 1
              ? "annonce"
              : "annonces"}
          </strong>
        </p>

        {/* EMAIL */}

        {seller.show_email && seller.email && (
          <p>
            Email : {seller.email}
          </p>
        )}

        {/* TELEPHONE */}

        {seller.show_phone && seller.phone && (
          <p>
            Téléphone : {seller.phone}
          </p>
        )}
      </section>

      {/* ANNONCES DU VENDEUR */}

      <section
        style={{
          marginTop: "35px",
        }}
      >
        <h2>
          Annonces de{" "}
          {seller.display_name || "ce vendeur"}
        </h2>

        {products.length === 0 ? (
          <p>
            Ce vendeur n'a aucune annonce pour le moment.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/acheter/${product.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "15px",
                }}
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  />
                )}

                <h3>{product.name}</h3>

                <p>
                  <strong>
                    {Number(
                      product.price
                    ).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    FCFA
                  </strong>
                </p>

                <p>
                  Catégorie :{" "}
                  {product.category}
                </p>

                <p>
                  Publié le{" "}
                  {new Date(
                    product.created_at
                  ).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <Link href="/acheter">
          Retour aux produits
        </Link>
      </div>
    </main>
  );
}