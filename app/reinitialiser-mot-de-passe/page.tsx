"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function ReinitialiserMotDePasse() {
  const router = useRouter();

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const changerMotDePasse = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setErreur("");

    if (nouveauMotDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      setErreur(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: nouveauMotDePasse,
    });

    if (error) {
      setErreur(
        `Impossible de modifier le mot de passe : ${error.message}`
      );
      return;
    }

    setMessage(
      "Votre mot de passe a été modifié avec succès."
    );

    setTimeout(() => {
      router.push("/connexion");
    }, 1500);
  };

  return (
    <main>
      <h1>DONA</h1>

      <h2>Nouveau mot de passe</h2>

      <p>
        Choisissez votre nouveau mot de passe.
      </p>

      <form onSubmit={changerMotDePasse}>
        <div>
          <label htmlFor="nouveauMotDePasse">
            Nouveau mot de passe
          </label>

          <input
            id="nouveauMotDePasse"
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) =>
              setNouveauMotDePasse(e.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="confirmation">
            Confirmer le nouveau mot de passe
          </label>

          <input
            id="confirmation"
            type="password"
            value={confirmation}
            onChange={(e) =>
              setConfirmation(e.target.value)
            }
            required
          />
        </div>

        <button type="submit">
          Modifier le mot de passe
        </button>
      </form>

      {erreur && <p>{erreur}</p>}
      {message && <p>{message}</p>}
    </main>
  );
}