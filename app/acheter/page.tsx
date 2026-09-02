"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
};

export default function Recherche() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function getProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, category, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur Supabase :", error);
        setMessage("Impossible de charger les produits.");
        return;
      }

      setProducts(data || []);
    }

    getProducts();
  }, []);

  function handleSearch() {
    const term = search.trim().toLowerCase();

    setSearched(true);

    if (term === "") {
      setResults(products);
      return;
    }

    const filteredProducts = products.filter((product) =>
      `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(term)
    );

    setResults(filteredProducts);
  }

  return (
    <main>
      <header>
        <h1>DONA</h1>
        <p>Achetez. Vendez. Échangez.</p>
      </header>

      <section>
        <h2>Rechercher une annonce</h2>

        <input
          type="search"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button type="button" onClick={handleSearch}>
          Rechercher
        </button>
      </section>

      <section>
        <h2>Résultat</h2>

        {message && <p>{message}</p>}

        {!message && !searched && (
          <p>
            Tapez le nom d'un produit, une catégorie ou un mot-clé pour
            commencer une recherche.
          </p>
        )}

        {!message && searched && results.length === 0 && (
          <p>Aucune annonce ne correspond à votre recherche.</p>
        )}

        {searched &&
          results.map((product) => (
            <article key={product.id}>
              <h3>{product.name}</h3>

              <p>{product.description}</p>

              <p>
                <strong>{product.price} FCFA</strong>
              </p>

              <p>Catégorie : {product.category}</p>

              <p>
                Publié le{" "}
                {new Date(product.created_at).toLocaleDateString("fr-FR")}
              </p>

              <Link href={`/acheter/${product.id}`}>
                Voir le produit
              </Link>
            </article>
          ))}
      </section>

      <Link href="/accueil">
        Retour à l'accueil
      </Link>
    </main>
  );
}