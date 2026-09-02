"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

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
  edition?: string;
  contenance?: string;
  dimensions?: string;
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

const genres = ["Femme", "Homme", "Enfant"];

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

export default function Vendre() {
  const router = useRouter();

  const [nomProduit, setNomProduit] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");

  const [categorie, setCategorie] = useState("");
  const [sousCategorie, setSousCategorie] = useState("");

  const [caracteristiques, setCaracteristiques] =
    useState<Caracteristiques>({});

  const [images, setImages] = useState<File[]>([]);

  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);

  function modifierCaracteristique(
    champ: keyof Caracteristiques,
    valeur: string
  ) {
    setCaracteristiques((anciennes) => ({
      ...anciennes,
      [champ]: valeur,
    }));
  }

  function changerCategorie(nouvelleCategorie: string) {
    setCategorie(nouvelleCategorie);
    setSousCategorie("");
    setCaracteristiques({});
  }

  function afficherCaracteristiques() {
    if (!categorie) return null;

    const inputClass = "form-input";
    const selectClass = "form-input";

    return (
      <div className="characteristics-section">
        <div className="section-heading">
          <div className="section-number">03</div>
          <div>
            <h2>Informations sur l'article</h2>
            <p>
              Aidez les acheteurs à mieux connaître votre produit.
            </p>
          </div>
        </div>

        <div className="characteristics-grid">
          {categorie === "mode" && (
            <>
              <div className="field">
                <label>Genre</label>
                <select
                  className={selectClass}
                  value={caracteristiques.genre || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "genre",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">Choisir</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Taille</label>
                <select
                  className={selectClass}
                  value={caracteristiques.taille || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "taille",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir une taille
                  </option>
                  {tailles.map((taille) => (
                    <option key={taille} value={taille}>
                      {taille}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Couleur</label>
                <select
                  className={selectClass}
                  value={caracteristiques.couleur || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "couleur",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir une couleur
                  </option>
                  {couleurs.map((couleur) => (
                    <option key={couleur} value={couleur}>
                      {couleur}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Matière</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : Coton, polyester..."
                  value={caracteristiques.matiere || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "matiere",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label>État</label>
                <select
                  className={selectClass}
                  value={caracteristiques.etat || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "etat",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir l'état
                  </option>
                  {etats.map((etat) => (
                    <option key={etat} value={etat}>
                      {etat}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {categorie === "sport" && (
            <>
              <div className="field">
                <label>Genre</label>
                <select
                  className={selectClass}
                  value={caracteristiques.genre || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "genre",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">Choisir</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Marque</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : Nike"
                  value={caracteristiques.marque || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "marque",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Taille</label>
                <select
                  className={selectClass}
                  value={caracteristiques.taille || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "taille",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Choisir une taille
                  </option>
                  {tailles.map((taille) => (
                    <option key={taille} value={taille}>
                      {taille}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>État</label>
                <select
                  className={selectClass}
                  value={caracteristiques.etat || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "etat",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir l'état
                  </option>
                  {etats.map((etat) => (
                    <option key={etat} value={etat}>
                      {etat}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {categorie === "electronique" && (
            <>
              <div className="field">
                <label>Marque</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : Samsung"
                  value={caracteristiques.marque || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "marque",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Modèle</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : Galaxy S25"
                  value={caracteristiques.modele || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "modele",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label>État</label>
                <select
                  className={selectClass}
                  value={caracteristiques.etat || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "etat",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir l'état
                  </option>
                  {etats.map((etat) => (
                    <option key={etat} value={etat}>
                      {etat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Couleur</label>
                <select
                  className={selectClass}
                  value={caracteristiques.couleur || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "couleur",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Choisir une couleur
                  </option>
                  {couleurs.map((couleur) => (
                    <option key={couleur} value={couleur}>
                      {couleur}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Capacité</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : 256 Go"
                  value={caracteristiques.capacite || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "capacite",
                      e.target.value
                    )
                  }
                />
              </div>
            </>
          )}

          {categorie === "beaute" && (
            <>
              <div className="field">
                <label>Marque</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : L'Oréal"
                  value={caracteristiques.marque || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "marque",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>État</label>
                <select
                  className={selectClass}
                  value={caracteristiques.etat || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "etat",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir l'état
                  </option>
                  {etats.map((etat) => (
                    <option key={etat} value={etat}>
                      {etat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Contenance</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : 50 ml"
                  value={caracteristiques.contenance || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "contenance",
                      e.target.value
                    )
                  }
                />
              </div>
            </>
          )}

          {categorie === "livres" && (
            <>
              <div className="field">
                <label>Auteur</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Nom de l'auteur"
                  value={caracteristiques.auteur || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "auteur",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Genre</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : Roman, histoire..."
                  value={caracteristiques.typeArticle || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "typeArticle",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Langue</label>
                <select
                  className={selectClass}
                  value={caracteristiques.langue || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "langue",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir la langue
                  </option>
                  {langues.map((langue) => (
                    <option key={langue} value={langue}>
                      {langue}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>État</label>
                <select
                  className={selectClass}
                  value={caracteristiques.etat || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "etat",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir l'état
                  </option>
                  {etats.map((etat) => (
                    <option key={etat} value={etat}>
                      {etat}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {categorie === "maison" && (
            <>
              <div className="field">
                <label>Marque</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Marque (facultatif)"
                  value={caracteristiques.marque || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "marque",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Matière</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : Bois, métal..."
                  value={caracteristiques.matiere || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "matiere",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Dimensions</label>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Exemple : 120 × 60 cm"
                  value={caracteristiques.dimensions || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "dimensions",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>État</label>
                <select
                  className={selectClass}
                  value={caracteristiques.etat || ""}
                  onChange={(e) =>
                    modifierCaracteristique(
                      "etat",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Choisir l'état
                  </option>
                  {etats.map((etat) => (
                    <option key={etat} value={etat}>
                      {etat}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {categorie === "autre" && (
            <div className="field">
              <label>État</label>
              <select
                className={selectClass}
                value={caracteristiques.etat || ""}
                onChange={(e) =>
                  modifierCaracteristique(
                    "etat",
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Choisir l'état
                </option>
                {etats.map((etat) => (
                  <option key={etat} value={etat}>
                    {etat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (publishing) return;

    setMessage("");
    setPublishing(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(
        "Vous devez être connecté pour publier une annonce."
      );
      setPublishing(false);
      return;
    }

    if (!nomProduit.trim()) {
      setMessage(
        "Veuillez renseigner le nom du produit."
      );
      setPublishing(false);
      return;
    }

    if (!categorie) {
      setMessage(
        "Veuillez choisir une catégorie."
      );
      setPublishing(false);
      return;
    }

    if (!sousCategorie && categorie !== "autre") {
      setMessage(
        "Veuillez choisir une sous-catégorie."
      );
      setPublishing(false);
      return;
    }

    if (images.length === 0) {
      setMessage(
        "Veuillez sélectionner au moins une photo."
      );
      setPublishing(false);
      return;
    }

    const caracteristiquesTexte = [
      champDescription("Genre", caracteristiques.genre),
      champDescription("Taille", caracteristiques.taille),
      champDescription("État", caracteristiques.etat),
      champDescription("Matière", caracteristiques.matiere),
      champDescription("Couleur", caracteristiques.couleur),
      champDescription("Marque", caracteristiques.marque),
      champDescription("Modèle", caracteristiques.modele),
      champDescription("Capacité", caracteristiques.capacite),
      champDescription("Contenance", caracteristiques.contenance),
      champDescription("Auteur", caracteristiques.auteur),
      champDescription("Genre", caracteristiques.typeArticle),
      champDescription("Langue", caracteristiques.langue),
      champDescription("Dimensions", caracteristiques.dimensions),
    ]
      .filter(Boolean)
      .join("\n");

    const descriptionFinale = caracteristiquesTexte
      ? `${description.trim()}\n\n--- Informations de l'article ---\n${caracteristiquesTexte}`
      : description.trim();

    const categorieFinale = sousCategorie
      ? `${categorie} > ${sousCategorie}`
      : categorie;

    const uploadedImages: {
      publicUrl: string;
      fileName: string;
    }[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      const fileExtension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `${user.id}/${Date.now()}-${i}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(fileName, image);

      if (uploadError) {
        setMessage(
          `Erreur lors de l'envoi de la photo ${i + 1} : ${uploadError.message}`
        );

        console.error(
          "Erreur upload :",
          uploadError
        );

        setPublishing(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      uploadedImages.push({
        publicUrl,
        fileName,
      });
    }

    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products")
      .insert({
        name: nomProduit.trim(),
        description: descriptionFinale,
        price: Number(prix),
        category: categorieFinale,
        user_id: user.id,
        image_url: uploadedImages[0].publicUrl,
      })
      .select("id")
      .single();

    if (productError || !product) {
      console.error(
        "Erreur création annonce :",
        productError
      );

      setMessage(
        `Erreur lors de la création de l'annonce : ${
          productError?.message ||
          "annonce introuvable"
        }`
      );

      setPublishing(false);
      return;
    }

    const imagesToInsert = uploadedImages.map(
      (uploadedImage, index) => ({
        product_id: product.id,
        image_url: uploadedImage.publicUrl,
        position: index,
      })
    );

    const { error: imagesError } =
      await supabase
        .from("product_images")
        .insert(imagesToInsert);

    if (imagesError) {
      console.error(
        "Erreur enregistrement des photos :",
        imagesError
      );

      setMessage(
        `L'annonce a été créée, mais les photos supplémentaires n'ont pas pu être enregistrées : ${imagesError.message}`
      );

      setPublishing(false);
      return;
    }

    router.push("/annonces");
  }

  return (
    <main className="page">

      <header className="topbar">
        <Link href="/accueil" className="logo">
          DONA
        </Link>

        <nav>
          <Link href="/acheter">Acheter</Link>
          <Link href="/annonces">Annonces</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/profil">Profil</Link>
        </nav>
      </header>

      <div className="page-background">

        <section className="hero">
          <Link href="/accueil" className="back">
            ← Retour à l'accueil
          </Link>

          <div className="hero-content">
            <div>
              <span className="eyebrow">
                DONA · VENTE
              </span>

              <h1>
                Donnez une nouvelle vie
                <br />
                à vos objets.
              </h1>

              <p>
                Créez votre annonce en quelques étapes
                et présentez votre produit aux acheteurs
                de DONA.
              </p>
            </div>

            <div className="hero-decoration">
              <span>✦</span>
              <span>♡</span>
              <span>✧</span>
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="form-card"
        >

          <div className="progress">
            <div className="progress-item active">
              <span>01</span>
              <p>Produit</p>
            </div>

            <div className="progress-line"></div>

            <div className="progress-item">
              <span>02</span>
              <p>Catégorie</p>
            </div>

            <div className="progress-line"></div>

            <div className="progress-item">
              <span>03</span>
              <p>Détails</p>
            </div>

            <div className="progress-line"></div>

            <div className="progress-item">
              <span>04</span>
              <p>Photos</p>
            </div>
          </div>

          <section className="form-section">

            <div className="section-heading">
              <div className="section-number">
                01
              </div>

              <div>
                <h2>Votre produit</h2>
                <p>
                  Présentez clairement ce que vous
                  souhaitez vendre.
                </p>
              </div>
            </div>

            <div className="field">
              <label htmlFor="nomProduit">
                Nom du produit
              </label>

              <input
                id="nomProduit"
                type="text"
                placeholder="Exemple : Robe longue fleurie"
                value={nomProduit}
                onChange={(e) =>
                  setNomProduit(e.target.value)
                }
                required
                className="form-input"
              />
            </div>

            <div className="field">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                placeholder="Décrivez votre produit, son état, ses particularités..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
                rows={6}
                className="form-input textarea"
              />

              <span className="field-hint">
                Une bonne description aide les acheteurs
                à prendre leur décision.
              </span>
            </div>

            <div className="price-field">

              <div className="field">
                <label htmlFor="prix">
                  Prix de vente
                </label>

                <div className="price-input">
                  <input
                    id="prix"
                    type="number"
                    placeholder="15 000"
                    value={prix}
                    onChange={(e) =>
                      setPrix(e.target.value)
                    }
                    required
                    min="1"
                    className="form-input"
                  />

                  <span>FCFA</span>
                </div>
              </div>

            </div>

          </section>

          <section className="form-section">

            <div className="section-heading">
              <div className="section-number">
                02
              </div>

              <div>
                <h2>Catégorisez votre article</h2>
                <p>
                  Cela permettra aux acheteurs de
                  retrouver facilement votre annonce.
                </p>
              </div>
            </div>

            <div className="category-grid">

              {[
                ["mode", "Mode", "♧"],
                ["maison", "Maison", "⌂"],
                ["electronique", "Électronique", "⌁"],
                ["beaute", "Beauté", "♡"],
                ["sport", "Sport", "◇"],
                ["livres", "Livres", "▤"],
                ["autre", "Autres", "＋"],
              ].map(([value, label, icon]) => (
                <button
                  type="button"
                  key={value}
                  className={`category-card ${
                    categorie === value
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    changerCategorie(value)
                  }
                >
                  <span className="category-icon">
                    {icon}
                  </span>

                  <span>{label}</span>

                  {categorie === value && (
                    <span className="check">
                      ✓
                    </span>
                  )}
                </button>
              ))}

            </div>

            {categorie && (
              <div className="subcategory-box">

                <label htmlFor="sousCategorie">
                  Sous-catégorie
                </label>

                {categorie === "autre" ? (
                  <p className="other-category">
                    Cette annonce sera classée dans
                    <strong> « Autres »</strong>.
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
                    className="form-input"
                  >
                    <option value="">
                      Choisir une sous-catégorie
                    </option>

                    {sousCategories[categorie]?.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                )}

              </div>
            )}

          </section>

          {afficherCaracteristiques()}

          <section className="form-section">

            <div className="section-heading">
              <div className="section-number">
                04
              </div>

              <div>
                <h2>Photos du produit</h2>
                <p>
                  Ajoutez plusieurs photos pour
                  présenter votre article sous tous
                  ses angles.
                </p>
              </div>
            </div>

            <label
              htmlFor="images"
              className="upload-zone"
            >
              <div className="upload-icon">
                ↑
              </div>

              <strong>
                Ajouter les photos
              </strong>

              <span>
                Cliquez ici pour sélectionner plusieurs
                images
              </span>

              <small>
                JPG, PNG ou autres formats image
              </small>
            </label>

            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(
                  e.target.files || []
                );

                setImages(files);
              }}
              required
              className="hidden-file-input"
            />

            {images.length > 0 && (
              <div className="preview-section">

                <div className="preview-header">
                  <strong>
                    {images.length}{" "}
                    {images.length > 1
                      ? "photos sélectionnées"
                      : "photo sélectionnée"}
                  </strong>

                  <span>
                    Votre première photo sera la
                    photo principale.
                  </span>
                </div>

                <div className="preview-grid">

                  {images.map((image, index) => (
                    <div
                      key={`${image.name}-${index}`}
                      className={`preview-card ${
                        index === 0
                          ? "main-photo"
                          : ""
                      }`}
                    >
                      <img
                        src={URL.createObjectURL(
                          image
                        )}
                        alt={`Photo ${index + 1}`}
                      />

                      {index === 0 && (
                        <span className="main-badge">
                          Photo principale
                        </span>
                      )}

                      <span className="photo-number">
                        {index + 1}
                      </span>
                    </div>
                  ))}

                </div>

              </div>
            )}

          </section>

          {message && (
            <div className="message">
              <span>!</span>
              {message}
            </div>
          )}

          <div className="submit-area">

            <div>
              <strong>
                Votre annonce est prête ?
              </strong>

              <p>
                Elle sera visible par les acheteurs
                après publication.
              </p>
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="submit-button"
            >
              {publishing
                ? "Publication en cours..."
                : "Publier mon annonce →"}
            </button>

          </div>

        </form>

      </div>

      <footer>
        <strong>DONA</strong>
        <span>
          Achetez. Vendez. Échangez.
        </span>
      </footer>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #fff9fc;
          color: #352832;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .topbar {
          height: 72px;
          padding: 0 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid #f1e0e8;
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(12px);
        }

        .logo {
          color: #d95b91;
          text-decoration: none;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        nav a {
          color: #55424d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s;
        }

        nav a:hover {
          color: #d95b91;
        }

        .page-background {
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(246, 192, 215, 0.25),
              transparent 28%
            ),
            #fff9fc;
          padding: 40px 20px 80px;
        }

        .hero {
          max-width: 980px;
          margin: 0 auto 35px;
        }

        .back {
          color: #a85a7d;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .hero-content {
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .eyebrow {
          color: #d95b91;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .hero h1 {
          margin: 9px 0 12px;
          font-size: 45px;
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: #30232b;
        }

        .hero p {
          max-width: 590px;
          margin: 0;
          color: #806c77;
          line-height: 1.7;
          font-size: 15px;
        }

        .hero-decoration {
          width: 130px;
          height: 130px;
          border-radius: 40% 60% 55% 45%;
          background: #fce6f0;
          color: #d95b91;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 23px;
          transform: rotate(-7deg);
          box-shadow:
            15px 15px 0 #f8dce8;
        }

        .form-card {
          max-width: 980px;
          margin: 0 auto;
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 28px;
          box-shadow:
            0 20px 60px rgba(160, 85, 120, 0.09);
          overflow: hidden;
        }

        .progress {
          padding: 25px 35px;
          background: #fffafd;
          border-bottom: 1px solid #f3e3eb;
          display: flex;
          align-items: center;
        }

        .progress-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #aa969f;
          white-space: nowrap;
        }

        .progress-item span {
          width: 29px;
          height: 29px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5e9ee;
          font-size: 10px;
          font-weight: 800;
        }

        .progress-item p {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
        }

        .progress-item.active {
          color: #d04e88;
        }

        .progress-item.active span {
          background: #d95b91;
          color: white;
        }

        .progress-line {
          height: 1px;
          flex: 1;
          background: #eadde3;
          margin: 0 16px;
        }

        .form-section,
        .characteristics-section {
          padding: 38px 45px;
          border-bottom: 1px solid #f2e6eb;
        }

        .section-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 27px;
        }

        .section-number {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fce6f0;
          color: #d04e88;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 900;
        }

        .section-heading h2 {
          margin: 0 0 5px;
          color: #352832;
          font-size: 21px;
        }

        .section-heading p {
          margin: 0;
          color: #927d87;
          font-size: 13px;
          line-height: 1.5;
        }

        .field {
          margin-bottom: 22px;
        }

        .field label,
        .subcategory-box label {
          display: block;
          margin-bottom: 8px;
          color: #4c3a44;
          font-size: 13px;
          font-weight: 800;
        }

        .form-input {
          width: 100%;
          border: 1px solid #eadde4;
          background: #fffdfd;
          color: #352832;
          border-radius: 13px;
          padding: 13px 14px;
          outline: none;
          font-size: 14px;
          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            background 0.2s;
        }

        .form-input:focus {
          border-color: #d95b91;
          background: white;
          box-shadow:
            0 0 0 4px rgba(217, 91, 145, 0.09);
        }

        .textarea {
          resize: vertical;
          min-height: 135px;
          line-height: 1.6;
        }

        .field-hint {
          display: block;
          margin-top: 7px;
          color: #a49199;
          font-size: 11px;
        }

        .price-input {
          position: relative;
        }

        .price-input input {
          padding-right: 75px;
        }

        .price-input span {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #a66d88;
          font-size: 12px;
          font-weight: 800;
        }

        .category-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
        }

        .category-card {
          position: relative;
          min-height: 105px;
          border: 1px solid #eadde4;
          border-radius: 17px;
          background: white;
          color: #594650;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 800;
          transition: 0.2s;
        }

        .category-card:hover {
          border-color: #e3a4bd;
          transform: translateY(-2px);
          box-shadow:
            0 8px 20px rgba(160, 85, 120, 0.07);
        }

        .category-card.selected {
          background: #fff2f7;
          border-color: #d95b91;
          color: #bd4277;
          box-shadow:
            0 8px 20px rgba(217, 91, 145, 0.1);
        }

        .category-icon {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #fce6f0;
          color: #d95b91;
          font-size: 20px;
        }

        .check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d95b91;
          color: white;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .subcategory-box {
          margin-top: 22px;
          padding: 20px;
          background: #fff8fb;
          border: 1px solid #f1dfe7;
          border-radius: 16px;
        }

        .other-category {
          margin: 0;
          color: #806c77;
          font-size: 13px;
        }

        .other-category strong {
          color: #d04e88;
        }

        .characteristics-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          column-gap: 18px;
        }

        .characteristics-grid .field {
          margin-bottom: 18px;
        }

        .upload-zone {
          min-height: 190px;
          border: 2px dashed #e5b8ca;
          background: #fff8fb;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: 0.2s;
        }

        .upload-zone:hover {
          background: #fff3f8;
          border-color: #d95b91;
        }

        .upload-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #fce6f0;
          color: #d95b91;
          font-size: 25px;
          margin-bottom: 12px;
        }

        .upload-zone strong {
          color: #4b3943;
          font-size: 14px;
        }

        .upload-zone span {
          margin-top: 6px;
          color: #8e7a84;
          font-size: 12px;
        }

        .upload-zone small {
          margin-top: 8px;
          color: #b09ca5;
          font-size: 10px;
        }

        .hidden-file-input {
          display: none;
        }

        .preview-section {
          margin-top: 22px;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 13px;
        }

        .preview-header strong {
          font-size: 13px;
          color: #4b3943;
        }

        .preview-header span {
          color: #a18d97;
          font-size: 11px;
        }

        .preview-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
        }

        .preview-card {
          position: relative;
          height: 145px;
          overflow: hidden;
          border-radius: 14px;
          background: #f7edf2;
          border: 1px solid #eadde4;
        }

        .preview-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .main-photo {
          border: 2px solid #d95b91;
        }

        .main-badge {
          position: absolute;
          left: 7px;
          bottom: 7px;
          background: rgba(255, 255, 255, 0.94);
          color: #b43f72;
          padding: 5px 7px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 800;
        }

        .photo-number {
          position: absolute;
          right: 7px;
          top: 7px;
          width: 23px;
          height: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          color: #7c6872;
          font-size: 10px;
          font-weight: 800;
        }

        .message {
          margin: 25px 45px 0;
          padding: 13px 16px;
          border-radius: 13px;
          background: #fff1f1;
          border: 1px solid #f0cccc;
          color: #ad4848;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .message span {
          width: 23px;
          height: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e77a7a;
          color: white;
          font-weight: 900;
        }

        .submit-area {
          padding: 28px 45px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #fffafd;
        }

        .submit-area strong {
          display: block;
          color: #3e3038;
          font-size: 14px;
        }

        .submit-area p {
          margin: 5px 0 0;
          color: #9a858f;
          font-size: 11px;
        }

        .submit-button {
          border: none;
          background: #d95b91;
          color: white;
          border-radius: 14px;
          padding: 15px 25px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 9px 22px rgba(217, 91, 145, 0.22);
          transition: 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background: #c94d83;
          transform: translateY(-2px);
          box-shadow:
            0 12px 25px rgba(217, 91, 145, 0.28);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        footer {
          border-top: 1px solid #f0dfe7;
          background: white;
          padding: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #9a7e8b;
          font-size: 12px;
        }

        footer strong {
          color: #d95b91;
        }

        @media (max-width: 800px) {

          .hero h1 {
            font-size: 37px;
          }

          .hero-decoration {
            width: 100px;
            height: 100px;
          }

          .category-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .preview-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .progress-item p {
            display: none;
          }
        }

        @media (max-width: 600px) {

          .topbar {
            height: 65px;
            padding: 0 18px;
          }

          nav {
            gap: 10px;
          }

          nav a {
            font-size: 11px;
          }

          nav a:nth-child(3) {
            display: none;
          }

          .page-background {
            padding:
              25px 12px 55px;
          }

          .hero {
            padding: 0 5px;
          }

          .hero-content {
            align-items: flex-start;
          }

          .hero-decoration {
            display: none;
          }

          .hero h1 {
            font-size: 31px;
            letter-spacing: -0.7px;
          }

          .hero p {
            font-size: 13px;
          }

          .form-card {
            border-radius: 21px;
          }

          .progress {
            padding: 18px 14px;
          }

          .progress-line {
            margin: 0 8px;
          }

          .progress-item span {
            width: 27px;
            height: 27px;
          }

          .form-section,
          .characteristics-section {
            padding:
              28px 18px;
          }

          .section-heading h2 {
            font-size: 18px;
          }

          .category-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .category-card {
            min-height: 95px;
          }

          .characteristics-grid {
            grid-template-columns: 1fr;
          }

          .preview-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .preview-card {
            height: 145px;
          }

          .preview-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .message {
            margin:
              20px 18px 0;
          }

          .submit-area {
            padding:
              23px 18px;
            flex-direction: column;
            align-items: stretch;
          }

          .submit-button {
            width: 100%;
          }

          footer {
            flex-direction: column;
          }
        }

      `}</style>
    </main>
  );
}

