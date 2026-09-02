"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const envoyerLien = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setErreur("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      }
    );

    if (error) {
      setErreur(
        `Impossible d'envoyer le lien : ${error.message}`
      );
      return;
    }

    setMessage(
      "Si cette adresse e-mail correspond à un compte DONA, un lien de réinitialisation a été envoyé."
    );
  };

  return (
    <main>
      <h1>DONA</h1>

      <h2>Mot de passe oublié ?</h2>

      <p>
        Entrez votre adresse e-mail pour recevoir un lien de
        réinitialisation.
      </p>

      <form onSubmit={envoyerLien}>
        <div>
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit">
          Envoyer le lien
        </button>
      </form>

      {erreur && <p>{erreur}</p>}
      {message && <p>{message}</p>}
    </main>
  );
}