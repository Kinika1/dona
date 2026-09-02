"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Connexion() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");

  const handleConnexion = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: motDePasse,
    });

    if (error) {
      setMessage(`Erreur de connexion : ${error.message}`);
      return;
    }

    router.push("/accueil");
  };

  return (
    <main>
      <h1>DONA</h1>

      <h2>Connexion</h2>

      <p>Connectez-vous à votre compte DONA.</p>

      <form onSubmit={handleConnexion}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="motDePasse">Mot de passe</label>

          <input
            id="motDePasse"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>

        <button type="submit">Se connecter</button>
      </form>

      <p>
        <a href="/mot-de-passe-oublie">
          Mot de passe oublié ?
        </a>
      </p>

      {message && <p>{message}</p>}

      <a href="/inscription">Créer un compte</a>
    </main>
  );
}