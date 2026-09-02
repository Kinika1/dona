"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function MesFavoris() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const chargerFavoris = async () => {
      setChargement(true);
      setErreur("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/connexion");
        return;
      }

      const { data: favorites, error: favoritesError } =
        await supabase
          .from("favorites")
          .select("product_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (favoritesError) {
        console.error(
          "Erreur lors du chargement des favoris :",
          favoritesError
        );

        setErreur(
          `Impossible de charger vos favoris : ${favoritesError.message}`
        );

        setChargement(false);
        return;
      }

      if (!favorites || favorites.length === 0) {
        setProducts([]);
        setChargement(false);
        return;
      }

      const productIds = favorites.map(
        (favorite) => favorite.product_id
      );

      const { data: productsData, error: productsError } =
        await supabase
          .from("products")
          .select(
            "id, name, description, price, category, created_at, user_id, image_url"
          )
          .in("id", productIds);

      if (productsError) {
        console.error(
          "Erreur lors du chargement des annonces favorites :",
          productsError
        );

        setErreur(
          `Impossible de charger vos annonces favorites : ${productsError.message}`
        );

        setChargement(false);
        return;
      }

      const produitsParId = new Map(
        (productsData || []).map((product) => [
          product.id,
          product,
        ])
      );

      const produitsDansOrdre = productIds
        .map((productId) => produitsParId.get(productId))
        .filter(
          (product): product is Product =>
            product !== undefined
        );

      setProducts(produitsDansOrdre);
      setChargement(false);
    };

    chargerFavoris();
  }, [router]);

  const retirerDesFavoris = async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/connexion");
      return;
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error(
        "Erreur lors de la suppression du favori :",
        error
      );

      setErreur(
        `Impossible de retirer cette annonce des favoris : ${error.message}`
      );

      return;
    }

    setProducts((anciensProduits) =>
      anciensProduits.filter(
        (product) => product.id !== productId
      )
    );
  };

  if (chargement) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#fff8fb",
          padding: "30px 20px",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "45px",
            }}
          >
            <Link
              href="/profil"
              style={{
                textDecoration: "none",
                color: "#333",
                fontSize: "14px",
              }}
            >
              ← Retour
            </Link>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#df78a0",
              }}
            >
              DONA
            </div>
          </header>

          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px",
              }}
            >
              ♡
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                color: "#222",
              }}
            >
              Mes favoris
            </h1>

            <p
              style={{
                color: "#888",
                marginTop: "12px",
              }}
            >
              Chargement de vos annonces...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff8fb",
        padding: "25px 20px 50px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "45px",
          }}
        >
          <Link
            href="/profil"
            style={{
              textDecoration: "none",
              color: "#555",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            ← Mon profil
          </Link>

          <Link
            href="/accueil"
            style={{
              textDecoration: "none",
              color: "#df78a0",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            DONA
          </Link>

          <div
            style={{
              width: "75px",
            }}
          />
        </header>

        {/* TITRE */}

        <section
          style={{
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "30px",
              }}
            >
              ♡
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#222",
                letterSpacing: "-0.5px",
              }}
            >
              Mes favoris
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: "#888",
              fontSize: "15px",
            }}
          >
            Retrouvez les annonces que vous souhaitez
            garder de côté.
          </p>
        </section>

        {/* ERREUR */}

        {erreur && (
          <div
            style={{
              background: "#fff0f3",
              border: "1px solid #f3c4d2",
              color: "#b84b70",
              padding: "14px 16px",
              borderRadius: "14px",
              marginBottom: "25px",
              fontSize: "14px",
            }}
          >
            {erreur}
          </div>
        )}

        {/* AUCUN FAVORI */}

        {!erreur && products.length === 0 && (
          <section
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "70px 25px",
              textAlign: "center",
              boxShadow:
                "0 8px 30px rgba(120, 70, 90, 0.06)",
            }}
          >
            <div
              style={{
                width: "75px",
                height: "75px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "#fff0f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "38px",
                color: "#df78a0",
              }}
            >
              ♡
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "21px",
                color: "#222",
              }}
            >
              Aucun favori pour le moment
            </h2>

            <p
              style={{
                margin: "0 auto 25px",
                maxWidth: "430px",
                color: "#888",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              Lorsque vous trouverez une annonce
              qui vous plaît, ajoutez-la à vos favoris
              pour la retrouver facilement ici.
            </p>

            <Link
              href="/acheter"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#df78a0",
                color: "white",
                padding: "13px 25px",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              Découvrir les annonces
            </Link>
          </section>
        )}

        {/* CARTES */}

        {products.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "24px",
            }}
          >
            {products.map((product) => (
              <article
                key={product.id}
                style={{
                  background: "white",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow:
                    "0 8px 28px rgba(120, 70, 90, 0.08)",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* IMAGE */}

                <Link
                  href={`/acheter/${product.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "240px",
                      background: "#faf5f7",
                      overflow: "hidden",
                    }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#c8aab5",
                          fontSize: "14px",
                        }}
                      >
                        Pas de photo
                      </div>
                    )}

                    {/* COEUR */}

                    <div
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background:
                          "rgba(255,255,255,0.95)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#df78a0",
                        fontSize: "22px",
                        boxShadow:
                          "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    >
                      ♥
                    </div>
                  </div>

                  {/* INFORMATIONS */}

                  <div
                    style={{
                      padding: "18px 18px 8px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 7px",
                        color: "#999",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {product.category}
                    </p>

                    <h2
                      style={{
                        margin: "0 0 9px",
                        fontSize: "18px",
                        color: "#222",
                        lineHeight: 1.3,
                      }}
                    >
                      {product.name}
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "19px",
                        fontWeight: 800,
                        color: "#df78a0",
                      }}
                    >
                      {Number(
                        product.price
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>

                    <p
                      style={{
                        margin:
                          "10px 0 0",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      Publiée le{" "}
                      {new Date(
                        product.created_at
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </Link>

                {/* BOUTON RETIRER */}

                <div
                  style={{
                    padding: "10px 18px 18px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      retirerDesFavoris(
                        product.id
                      )
                    }
                    style={{
                      width: "100%",
                      border: "1px solid #f0d2dc",
                      background: "#fff7fa",
                      color: "#c95d83",
                      padding: "11px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    ♥ Retirer des favoris
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* RETOUR */}

        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
          }}
        >
          <Link
            href="/profil"
            style={{
              textDecoration: "none",
              color: "#777",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ← Retour à mon profil
          </Link>
        </div>
      </div>
    </main>
  );
}

