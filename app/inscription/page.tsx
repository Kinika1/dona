"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Inscription() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [contact, setContact] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      nom === "" ||
      prenom === "" ||
      contact === "" ||
      motDePasse === "" ||
      confirmation === ""
    ) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    if (motDePasse !== confirmation) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: contact,
      password: motDePasse,
      options: {
        data: {
          display_name: `${prenom} ${nom}`,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Compte créé ! Vérifiez votre adresse e-mail pour confirmer votre compte."
    );

    router.push("/accueil");
  }

  return (
    <main>
      <h1>DONA</h1>

      <h2>Créer un compte</h2>

      <p>Créez votre compte DONA pour acheter et vendre.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />

        <input
          type="email"
          placeholder="Adresse e-mail"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />

        <button type="submit">Créer mon compte</button>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}