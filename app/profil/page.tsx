"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type ProfilData = {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export default function Profil() {
  const router = useRouter();

  const [profil, setProfil] =
    useState<ProfilData | null>(null);

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const chargerProfil = async () => {
      setChargement(true);
      setErreur("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/connexion");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "display_name, email, phone, avatar_url"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        setErreur(
          `Erreur profil : ${error.message}`
        );
        setChargement(false);
        return;
      }

      setProfil(data);
      setChargement(false);
    };

    chargerProfil();
  }, [router]);

  const handleDeconnexion = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      setErreur(
        `Impossible de vous déconnecter : ${error.message}`
      );
      return;
    }

    router.push("/connexion");
  };

  // ==========================================
  // CHARGEMENT
  // ==========================================

  if (chargement) {
    return (
      <main className="page">
        <div className="loading">
          <div className="loader"></div>

          <h2>Votre profil</h2>

          <p>Chargement de vos informations...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERREUR
  // ==========================================

  if (erreur) {
    return (
      <main className="page">
        <header className="topbar">
          <Link
            href="/accueil"
            className="logo"
          >
            DONA
          </Link>

          <nav>
            <Link href="/acheter">
              Acheter
            </Link>

            <Link href="/vendre">
              Vendre
            </Link>

            <Link href="/messages">
              Messages
            </Link>

            <Link
              href="/profil"
              className="active"
            >
              Profil
            </Link>
          </nav>
        </header>

        <section className="error-state">
          <div className="error-icon">
            !
          </div>

          <h2>Impossible d'afficher le profil</h2>

          <p>{erreur}</p>

          <Link href="/accueil">
            Retour à l'accueil
          </Link>
        </section>
      </main>
    );
  }

  // ==========================================
  // PROFIL
  // ==========================================

  const displayName =
    profil?.display_name ||
    "Utilisateur DONA";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <main className="page">

      {/* HEADER */}

      <header className="topbar">

        <Link
          href="/accueil"
          className="logo"
        >
          DONA
        </Link>

        <nav>

          <Link href="/acheter">
            Acheter
          </Link>

          <Link href="/vendre">
            Vendre
          </Link>

          <Link href="/messages">
            Messages
          </Link>

          <Link
            href="/profil"
            className="active"
          >
            Profil
          </Link>

        </nav>

      </header>

      {/* CONTENU */}

      <section className="content">

        <Link
          href="/accueil"
          className="back"
        >
          ← Retour à l'accueil
        </Link>

        <div className="title-area">

          <span className="small-title">
            DONA
          </span>

          <h1>Mon profil</h1>

          <p>
            Gérez vos informations personnelles
            et votre compte.
          </p>

        </div>

        {/* CARTE PROFIL */}

        <section className="profile-card">

          <div className="profile-top">

            {/* PHOTO */}

            <div className="avatar-wrapper">

              {profil?.avatar_url ? (
                <img
                  src={profil.avatar_url}
                  alt="Ma photo de profil"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {initial}
                </div>
              )}

            </div>

            {/* NOM */}

            <div className="profile-heading">

              <h2>{displayName}</h2>

              <p>
                Membre de la communauté DONA
              </p>

            </div>

          </div>

          {/* INFORMATIONS */}

          <div className="information-section">

            <h3>
              Mes informations
            </h3>

            <div className="information-list">

              <div className="information-item">

                <div className="information-icon">
                  ✉
                </div>

                <div>
                  <span>E-mail</span>

                  <strong>
                    {profil?.email ||
                      "Non renseigné"}
                  </strong>
                </div>

              </div>

              <div className="information-item">

                <div className="information-icon">
                  ☎
                </div>

                <div>
                  <span>Téléphone</span>

                  <strong>
                    {profil?.phone ||
                      "Non renseigné"}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {/* MODIFIER */}

          <button
            type="button"
            className="edit-button"
            onClick={() =>
              router.push(
                "/profil/modifier"
              )
            }
          >
            Modifier mon profil
          </button>

        </section>

        {/* MENU */}

        <section className="menu-section">

          <h3>
            Mon espace
          </h3>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              router.push(
                "/profil/favoris"
              )
            }
          >

            <div className="menu-icon favorite">
              ♡
            </div>

            <div className="menu-text">
              <strong>
                Mes favoris
              </strong>

              <span>
                Retrouvez les annonces que
                vous avez enregistrées.
              </span>
            </div>

            <span className="menu-arrow">
              ›
            </span>

          </button>

        </section>

        {/* DÉCONNEXION */}

        <section className="logout-section">

          <button
            type="button"
            className="logout-button"
            onClick={handleDeconnexion}
          >
            <span>↪</span>
            Se déconnecter
          </button>

        </section>

      </section>

      {/* FOOTER */}

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
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* HEADER */

        .topbar {
          height: 72px;
          padding: 0 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #f3e3eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .logo {
          font-size: 27px;
          font-weight: 800;
          color: #d95b91;
          text-decoration: none;
          letter-spacing: 1px;
        }

        nav {
          display: flex;
          gap: 25px;
        }

        nav a {
          color: #55424d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        nav a:hover,
        nav a.active {
          color: #d95b91;
        }

        /* CONTENU */

        .content {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 35px 25px 70px;
          flex: 1;
        }

        .back {
          color: #a85a7d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .title-area {
          margin-top: 35px;
          margin-bottom: 28px;
        }

        .small-title {
          color: #d95b91;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .title-area h1 {
          margin: 6px 0;
          font-size: 38px;
          color: #30232b;
        }

        .title-area p {
          margin: 0;
          color: #806c77;
          font-size: 15px;
        }

        /* CARTE PROFIL */

        .profile-card {
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 8px 28px rgba(
            160,
            85,
            120,
            0.07
          );
        }

        .profile-top {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 25px;
          border-bottom: 1px solid #f3e3eb;
        }

        .avatar-wrapper {
          flex-shrink: 0;
        }

        .avatar-image,
        .avatar-placeholder {
          width: 105px;
          height: 105px;
          border-radius: 50%;
        }

        .avatar-image {
          display: block;
          object-fit: cover;
          border: 4px solid #fce6f0;
        }

        .avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fce6f0;
          color: #b43f72;
          border: 4px solid #f8dce8;
          font-size: 38px;
          font-weight: 800;
        }

        .profile-heading h2 {
          margin: 0 0 7px;
          font-size: 25px;
          color: #352832;
        }

        .profile-heading p {
          margin: 0;
          color: #a18d97;
          font-size: 13px;
        }

        /* INFORMATIONS */

        .information-section {
          padding: 25px 0;
        }

        .information-section h3,
        .menu-section h3 {
          margin: 0 0 15px;
          font-size: 16px;
          color: #352832;
        }

        .information-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .information-item {
          display: flex;
          align-items: center;
          gap: 13px;
          background: #fff9fc;
          border: 1px solid #f3e3eb;
          border-radius: 14px;
          padding: 13px;
        }

        .information-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: #fce6f0;
          color: #b43f72;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        .information-item div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .information-item span {
          color: #a18d97;
          font-size: 11px;
        }

        .information-item strong {
          color: #493842;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        /* BOUTON MODIFIER */

        .edit-button {
          width: 100%;
          border: none;
          background: #d95b91;
          color: white;
          padding: 14px;
          border-radius: 13px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .edit-button:hover {
          background: #c94d83;
        }

        /* MENU */

        .menu-section {
          margin-top: 25px;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 18px;
          padding: 16px;
          cursor: pointer;
          box-shadow: 0 5px 18px rgba(
            160,
            85,
            120,
            0.05
          );
        }

        .menu-item:hover {
          border-color: #e7bdd0;
          background: #fffafd;
        }

        .menu-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .menu-icon.favorite {
          background: #fce6f0;
          color: #d95b91;
        }

        .menu-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-text strong {
          color: #352832;
          font-size: 14px;
        }

        .menu-text span {
          color: #9a858f;
          font-size: 11px;
          line-height: 1.4;
        }

        .menu-arrow {
          color: #c38aa5;
          font-size: 27px;
        }

        /* DÉCONNEXION */

        .logout-section {
          margin-top: 22px;
        }

        .logout-button {
          width: 100%;
          border: 1px solid #f0dfe7;
          background: white;
          color: #b04c70;
          padding: 13px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .logout-button:hover {
          background: #fff4f7;
          border-color: #e7bdd0;
        }

        .logout-button span {
          margin-right: 7px;
        }

        /* LOADING */

        .loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #806c77;
        }

        .loading h2 {
          margin: 0 0 6px;
          color: #352832;
          font-size: 18px;
        }

        .loading p {
          margin: 0;
          font-size: 13px;
        }

        .loader {
          width: 30px;
          height: 30px;
          border: 3px solid #f2d9e4;
          border-top-color: #d95b91;
          border-radius: 50%;
          margin-bottom: 18px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ERREUR */

        .error-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .error-icon {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: #fff0f0;
          color: #b44747;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          font-weight: 800;
          margin-bottom: 15px;
        }

        .error-state h2 {
          margin: 0 0 8px;
        }

        .error-state p {
          color: #806c77;
          margin-bottom: 20px;
        }

        .error-state a {
          color: #c44f82;
          font-weight: 700;
          text-decoration: none;
        }

        /* FOOTER */

        footer {
          border-top: 1px solid #f0dfe7;
          background: white;
          padding: 25px;
          display: flex;
          justify-content: center;
          gap: 10px;
          color: #9a7e8b;
          font-size: 12px;
        }

        footer strong {
          color: #d95b91;
        }

        /* MOBILE */

        @media (max-width: 600px) {

          .topbar {
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

          .content {
            padding: 25px 16px 50px;
          }

          .title-area h1 {
            font-size: 31px;
          }

          .profile-card {
            padding: 20px;
            border-radius: 20px;
          }

          .profile-top {
            gap: 14px;
          }

          .avatar-image,
          .avatar-placeholder {
            width: 80px;
            height: 80px;
          }

          .avatar-placeholder {
            font-size: 29px;
          }

          .profile-heading h2 {
            font-size: 20px;
          }

          .profile-heading p {
            font-size: 11px;
          }

          footer {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 400px) {

          .profile-top {
            align-items: flex-start;
            flex-direction: column;
          }

        }

      `}</style>
    </main>
  );
}

