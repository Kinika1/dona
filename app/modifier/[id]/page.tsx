"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Caracteristiques = {
  taille?: string;
  etat?: string;
  matiere?: string;
  couleur?: string;
  marque?: string;
  modele?: string;
  capacite?: string;
  typeArticle?: string;
  genre?: string;
  auteur?: string;
  langue?: string;
  contenance?: string;
  dimensions?: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  user_id: string;
  image_url: string | null;
};

const sousCategories: Record<string, string[]> = {
  mode: [
    "Robes",
    "Hauts",
    "Pantalons",
    "Jupes",
    "Vestes",
    "Chaussures",
    "Sacs",
    "Accessoires",
  ],
  maison: [
    "Meubles",
    "Décoration",
    "Cuisine",
    "Électroménager",
    "Linge de maison",
    "Jardin",
  ],
  electronique: [
    "Téléphones",
    "Ordinateurs",
    "Tablettes",
    "Télévisions",
    "Audio",
    "Accessoires",
    "Consoles / jeux vidéo",
  ],
  beaute: [
    "Maquillage",
    "Parfums",
    "Soins visage",
    "Soins corps",
    "Cheveux",
    "Hygiène",
    "Accessoires beauté",
  ],
  sport: [
    "Vêtements",
    "Chaussures",
    "Équipement",
    "Accessoires",
  ],
  livres: [
    "Romans",
    "Scolaire",
    "Universitaire",
    "Jeunesse",
    "BD / Manga",
    "Autres livres",
  ],
  autre: [],
};

const etats = [
  "Neuf",
  "Comme neuf",
  "Très bon état",
  "Bon état",
  "État satisfaisant",
];

const tailles = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Autre",
];

const couleurs = [
  "Noir",
  "Blanc",
  "Gris",
  "Rouge",
  "Rose",
  "Orange",
  "Jaune",
  "Vert",
  "Bleu",
  "Violet",
  "Marron",
  "Beige",
  "Bleu marine",
  "Multicolore",
  "Autre",
];

const genres = [
  "Femme",
  "Homme",
  "Enfant",
];

const langues = [
  "Français",
  "Anglais",
  "Espagnol",
  "Arabe",
  "Autre",
];

function champDescription(
  label: string,
  valeur: string | undefined
) {
  if (!valeur) return "";

  return `${label} : ${valeur}`;
}

function extraireCaracteristiques(
  descriptionComplete: string
) {
  const marqueur =
    "--- Informations de l'article ---";

  const position =
    descriptionComplete.indexOf(marqueur);

  if (position === -1) {
    return {
      description: descriptionComplete,
      caracteristiques: {} as Caracteristiques,
    };
  }

  const descriptionNormale =
    descriptionComplete
      .substring(0, position)
      .trim();

  const informations =
    descriptionComplete
      .substring(
        position + marqueur.length
      )
      .trim();

  const caracteristiques: Caracteristiques =
    {};

  const lignes =
    informations
      .split("\n")
      .map((ligne) => ligne.trim())
      .filter(Boolean);

  for (const ligne of lignes) {
    const separateur =
      ligne.indexOf(" : ");

    if (separateur === -1) continue;

    const label =
      ligne
        .substring(0, separateur)
        .trim();

    const valeur =
      ligne
        .substring(separateur + 3)
        .trim();

    if (!valeur) continue;

    switch (label) {
      case "Genre":
        caracteristiques.genre = valeur;
        break;

      case "Taille":
        caracteristiques.taille = valeur;
        break;

      case "État":
        caracteristiques.etat = valeur;
        break;

      case "Matière":
        caracteristiques.matiere = valeur;
        break;

      case "Couleur":
        caracteristiques.couleur = valeur;
        break;

      case "Marque":
        caracteristiques.marque = valeur;
        break;

      case "Modèle":
        caracteristiques.modele = valeur;
        break;

      case "Capacité":
        caracteristiques.capacite = valeur;
        break;

      case "Contenance":
        caracteristiques.contenance = valeur;
        break;

      case "Auteur":
        caracteristiques.auteur = valeur;
        break;

      case "Genre":
        caracteristiques.typeArticle = valeur;
        break;

      case "Langue":
        caracteristiques.langue = valeur;
        break;

      case "Dimensions":
        caracteristiques.dimensions = valeur;
        break;
    }
  }

  return {
    description: descriptionNormale,
    caracteristiques,
  };
}

export default function ModifierAnnonce() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [nomProduit, setNomProduit] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [prix, setPrix] =
    useState("");

  const [categorie, setCategorie] =
    useState("");

  const [sousCategorie, setSousCategorie] =
    useState("");

  const [caracteristiques, setCaracteristiques] =
    useState<Caracteristiques>({});

  const [image, setImage] =
    useState<File | null>(null);

  const [imageUrl, setImageUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  function modifierCaracteristique(
    champ: keyof Caracteristiques,
    valeur: string
  ) {
    setCaracteristiques((anciennes) => ({
      ...anciennes,
      [champ]: valeur,
    }));
  }

  function changerCategorie(
    nouvelleCategorie: string
  ) {
    setCategorie(nouvelleCategorie);
    setSousCategorie("");
    setCaracteristiques({});
  }

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage(
          "Vous devez être connecté pour modifier cette annonce."
        );
        setLoading(false);
        return;
      }

      const { data, error } =
        await supabase
          .from("products")
          .select(
            "id, name, description, price, category, user_id, image_url"
          )
          .eq("id", id)
          .single();

      if (error) {
        setMessage(
          "Erreur lors du chargement de l'annonce : " +
            error.message
        );
        setLoading(false);
        return;
      }

      const product = data as Product;

      if (product.user_id !== user.id) {
        setMessage(
          "Vous n'êtes pas autorisé à modifier cette annonce."
        );
        setLoading(false);
        return;
      }

      const {
        description: descriptionNormale,
        caracteristiques: caracteristiquesExtraites,
      } = extraireCaracteristiques(
        product.description || ""
      );

      let categoriePrincipale =
        product.category || "";

      let sousCategorieExtraite = "";

      if (
        product.category &&
        product.category.includes(" > ")
      ) {
        const morceaux =
          product.category.split(" > ");

        categoriePrincipale =
          morceaux[0];

        sousCategorieExtraite =
          morceaux.slice(1).join(" > ");
      }

      setNomProduit(product.name);
      setDescription(descriptionNormale);
      setPrix(String(product.price));
      setCategorie(categoriePrincipale);
      setSousCategorie(
        sousCategorieExtraite
      );
      setCaracteristiques(
        caracteristiquesExtraites
      );
      setImageUrl(product.image_url);

      setLoading(false);
    }

    loadProduct();
  }, [id]);

  function afficherCaracteristiques() {
    if (!categorie) return null;

    const styleChamp = {
      width: "100%",
      padding: "10px",
      marginTop: "5px",
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "5px",
        }}
      >
        <h3 style={{ margin: "0" }}>
          Informations sur l'article
        </h3>

        {categorie === "mode" && (
          <>
            <div>
              <label>Genre</label>
              <select
                value={
                  caracteristiques.genre || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "genre",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir
                </option>

                {genres.map((genre) => (
                  <option
                    key={genre}
                    value={genre}
                  >
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Taille</label>
              <select
                value={
                  caracteristiques.taille || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "taille",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir une taille
                </option>

                {tailles.map((taille) => (
                  <option
                    key={taille}
                    value={taille}
                  >
                    {taille}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Couleur</label>
              <select
                value={
                  caracteristiques.couleur || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "couleur",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir une couleur
                </option>

                {couleurs.map((couleur) => (
                  <option
                    key={couleur}
                    value={couleur}
                  >
                    {couleur}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Matière</label>
              <input
                type="text"
                placeholder="Exemple : Coton, polyester..."
                value={
                  caracteristiques.matiere || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "matiere",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              />
            </div>

            <div>
              <label>État</label>
              <select
                value={
                  caracteristiques.etat || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "etat",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir l'état
                </option>

                {etats.map((etat) => (
                  <option
                    key={etat}
                    value={etat}
                  >
                    {etat}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {categorie === "maison" && (
          <>
            <div>
              <label>Marque</label>
              <input
                type="text"
                placeholder="Marque (facultatif)"
                value={
                  caracteristiques.marque || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "marque",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>

            <div>
              <label>Matière</label>
              <input
                type="text"
                placeholder="Exemple : Bois, métal..."
                value={
                  caracteristiques.matiere || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "matiere",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>

            <div>
              <label>Dimensions</label>
              <input
                type="text"
                placeholder="Exemple : 120 × 60 cm"
                value={
                  caracteristiques.dimensions ||
                  ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "dimensions",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>

            <div>
              <label>État</label>
              <select
                value={
                  caracteristiques.etat || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "etat",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir l'état
                </option>

                {etats.map((etat) => (
                  <option
                    key={etat}
                    value={etat}
                  >
                    {etat}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {categorie === "electronique" && (
          <>
            <div>
              <label>Marque</label>
              <input
                type="text"
                placeholder="Exemple : Samsung"
                value={
                  caracteristiques.marque || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "marque",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              />
            </div>

            <div>
              <label>Modèle</label>
              <input
                type="text"
                placeholder="Exemple : Galaxy S25"
                value={
                  caracteristiques.modele || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "modele",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              />
            </div>

            <div>
              <label>État</label>
              <select
                value={
                  caracteristiques.etat || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "etat",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir l'état
                </option>

                {etats.map((etat) => (
                  <option
                    key={etat}
                    value={etat}
                  >
                    {etat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Couleur</label>
              <select
                value={
                  caracteristiques.couleur || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "couleur",
                    e.target.value
                  )
                }
                style={styleChamp}
              >
                <option value="">
                  Choisir une couleur
                </option>

                {couleurs.map((couleur) => (
                  <option
                    key={couleur}
                    value={couleur}
                  >
                    {couleur}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Capacité</label>
              <input
                type="text"
                placeholder="Exemple : 256 Go"
                value={
                  caracteristiques.capacite || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "capacite",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>
          </>
        )}

        {categorie === "beaute" && (
          <>
            <div>
              <label>Marque</label>
              <input
                type="text"
                placeholder="Exemple : L'Oréal"
                value={
                  caracteristiques.marque || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "marque",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>

            <div>
              <label>État</label>
              <select
                value={
                  caracteristiques.etat || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "etat",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir l'état
                </option>

                {etats.map((etat) => (
                  <option
                    key={etat}
                    value={etat}
                  >
                    {etat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Contenance</label>
              <input
                type="text"
                placeholder="Exemple : 50 ml"
                value={
                  caracteristiques.contenance ||
                  ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "contenance",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>
          </>
        )}

        {categorie === "sport" && (
          <>
            <div>
              <label>Genre</label>
              <select
                value={
                  caracteristiques.genre || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "genre",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir
                </option>

                {genres.map((genre) => (
                  <option
                    key={genre}
                    value={genre}
                  >
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Marque</label>
              <input
                type="text"
                placeholder="Exemple : Nike"
                value={
                  caracteristiques.marque || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "marque",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>

            <div>
              <label>Taille</label>
              <select
                value={
                  caracteristiques.taille || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "taille",
                    e.target.value
                  )
                }
                style={styleChamp}
              >
                <option value="">
                  Choisir une taille
                </option>

                {tailles.map((taille) => (
                  <option
                    key={taille}
                    value={taille}
                  >
                    {taille}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>État</label>
              <select
                value={
                  caracteristiques.etat || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "etat",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir l'état
                </option>

                {etats.map((etat) => (
                  <option
                    key={etat}
                    value={etat}
                  >
                    {etat}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {categorie === "livres" && (
          <>
            <div>
              <label>Auteur</label>
              <input
                type="text"
                placeholder="Nom de l'auteur"
                value={
                  caracteristiques.auteur || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "auteur",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              />
            </div>

            <div>
              <label>Genre</label>
              <input
                type="text"
                placeholder="Exemple : Roman, histoire..."
                value={
                  caracteristiques.typeArticle ||
                  ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "typeArticle",
                    e.target.value
                  )
                }
                style={styleChamp}
              />
            </div>

            <div>
              <label>Langue</label>
              <select
                value={
                  caracteristiques.langue || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "langue",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir la langue
                </option>

                {langues.map((langue) => (
                  <option
                    key={langue}
                    value={langue}
                  >
                    {langue}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>État</label>
              <select
                value={
                  caracteristiques.etat || ""
                }
                onChange={(e) =>
                  modifierCaracteristique(
                    "etat",
                    e.target.value
                  )
                }
                required
                style={styleChamp}
              >
                <option value="">
                  Choisir l'état
                </option>

                {etats.map((etat) => (
                  <option
                    key={etat}
                    value={etat}
                  >
                    {etat}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {categorie === "autre" && (
          <div>
            <label>État</label>

            <select
              value={
                caracteristiques.etat || ""
              }
              onChange={(e) =>
                modifierCaracteristique(
                  "etat",
                  e.target.value
                )
              }
              required
              style={styleChamp}
            >
              <option value="">
                Choisir l'état
              </option>

              {etats.map((etat) => (
                <option
                  key={etat}
                  value={etat}
                >
                  {etat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage(
      "Enregistrement en cours..."
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(
        "Vous devez être connecté pour modifier cette annonce."
      );
      setSaving(false);
      return;
    }

    if (!nomProduit.trim()) {
      setMessage(
        "Veuillez renseigner le nom du produit."
      );
      setSaving(false);
      return;
    }

    if (!categorie) {
      setMessage(
        "Veuillez choisir une catégorie."
      );
      setSaving(false);
      return;
    }

    if (
      !sousCategorie &&
      categorie !== "autre"
    ) {
      setMessage(
        "Veuillez choisir une sous-catégorie."
      );
      setSaving(false);
      return;
    }

    let nouvelleImageUrl = imageUrl;

    if (image) {
      const fileExtension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `${user.id}/${Date.now()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(
            fileName,
            image
          );

      if (uploadError) {
        setMessage(
          "Erreur lors de l'envoi de la photo : " +
            uploadError.message
        );
        console.error(
          "Erreur upload :",
          uploadError
        );
        setSaving(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      nouvelleImageUrl = publicUrl;
    }

    const caracteristiquesTexte = [
      champDescription(
        "Genre",
        caracteristiques.genre
      ),
      champDescription(
        "Taille",
        caracteristiques.taille
      ),
      champDescription(
        "État",
        caracteristiques.etat
      ),
      champDescription(
        "Matière",
        caracteristiques.matiere
      ),
      champDescription(
        "Couleur",
        caracteristiques.couleur
      ),
      champDescription(
        "Marque",
        caracteristiques.marque
      ),
      champDescription(
        "Modèle",
        caracteristiques.modele
      ),
      champDescription(
        "Capacité",
        caracteristiques.capacite
      ),
      champDescription(
        "Contenance",
        caracteristiques.contenance
      ),
      champDescription(
        "Auteur",
        caracteristiques.auteur
      ),
      champDescription(
        "Genre",
        caracteristiques.typeArticle
      ),
      champDescription(
        "Langue",
        caracteristiques.langue
      ),
      champDescription(
        "Dimensions",
        caracteristiques.dimensions
      ),
    ]
      .filter(Boolean)
      .join("\n");

    const descriptionFinale =
      caracteristiquesTexte
        ? `${description.trim()}\n\n--- Informations de l'article ---\n${caracteristiquesTexte}`
        : description.trim();

    const categorieFinale =
      sousCategorie
        ? `${categorie} > ${sousCategorie}`
        : categorie;

    const {
      data: updatedProduct,
      error: updateError,
    } = await supabase
      .from("products")
      .update({
        name: nomProduit.trim(),
        description: descriptionFinale,
        price: Number(prix),
        category: categorieFinale,
        image_url: nouvelleImageUrl,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "Erreur complète UPDATE :",
        updateError
      );

      setMessage(
        "Erreur lors de la modification : " +
          updateError.message
      );

      setSaving(false);
      return;
    }

    if (!updatedProduct) {
      setMessage(
        "La modification n'a modifié aucune annonce."
      );
      setSaving(false);
      return;
    }

    setMessage(
      "Annonce modifiée avec succès !"
    );

    setTimeout(() => {
      router.push("/annonces");
    }, 800);
  }

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h1>DONA</h1>
        <h2>Modifier mon annonce</h2>
        <p>
          Chargement de l'annonce...
        </p>
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
      <h1>DONA</h1>

      <h2>Modifier mon annonce</h2>

      {imageUrl && (
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <p>Photo actuelle :</p>

          <img
            src={imageUrl}
            alt={nomProduit}
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div>
          <label htmlFor="nomProduit">
            Nom du produit
          </label>

          <br />

          <input
            id="nomProduit"
            type="text"
            value={nomProduit}
            onChange={(e) =>
              setNomProduit(
                e.target.value
              )
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div>
          <label htmlFor="description">
            Description
          </label>

          <br />

          <textarea
            id="description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            required
            rows={5}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div>
          <label htmlFor="prix">
            Prix
          </label>

          <br />

          <input
            id="prix"
            type="number"
            value={prix}
            onChange={(e) =>
              setPrix(e.target.value)
            }
            required
            min="1"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div>
          <label htmlFor="categorie">
            Catégorie principale
          </label>

          <br />

          <select
            id="categorie"
            value={categorie}
            onChange={(e) =>
              changerCategorie(
                e.target.value
              )
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          >
            <option value="">
              Choisir une catégorie
            </option>

            <option value="mode">
              Mode
            </option>

            <option value="maison">
              Maison
            </option>

            <option value="electronique">
              Électronique
            </option>

            <option value="beaute">
              Beauté
            </option>

            <option value="sport">
              Sport
            </option>

            <option value="livres">
              Livres
            </option>

            <option value="autre">
              Autres
            </option>
          </select>
        </div>

        {categorie && (
          <div>
            <label htmlFor="sousCategorie">
              Sous-catégorie
            </label>

            <br />

            {categorie === "autre" ? (
              <p
                style={{
                  marginTop: "8px",
                  color: "#777",
                }}
              >
                Cette annonce sera
                classée dans
                « Autres ».
              </p>
            ) : (
              <select
                id="sousCategorie"
                value={sousCategorie}
                onChange={(e) =>
                  setSousCategorie(
                    e.target.value
                  )
                }
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                }}
              >
                <option value="">
                  Choisir une
                  sous-catégorie
                </option>

                {sousCategories[
                  categorie
                ]?.map(
                  (
                    sousCategorieItem
                  ) => (
                    <option
                      key={
                        sousCategorieItem
                      }
                      value={
                        sousCategorieItem
                      }
                    >
                      {
                        sousCategorieItem
                      }
                    </option>
                  )
                )}
              </select>
            )}
          </div>
        )}

        {afficherCaracteristiques()}

        <div>
          <label htmlFor="image">
            Ajouter ou remplacer la
            photo
          </label>

          <br />

          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file =
                e.target.files?.[0] ||
                null;

              setImage(file);
            }}
            style={{
              marginTop: "5px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px",
            cursor: saving
              ? "not-allowed"
              : "pointer",
          }}
        >
          {saving
            ? "Enregistrement..."
            : "Enregistrer les modifications"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "20px",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          marginTop: "20px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.push("/annonces")
          }
        >
          Annuler
        </button>
      </div>
    </main>
  );
}

