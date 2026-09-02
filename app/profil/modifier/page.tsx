"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ModifierProfil() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  const [afficherEmail, setAfficherEmail] =
    useState(false);

  const [afficherTelephone, setAfficherTelephone] =
    useState(false);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [chargement, setChargement] =
    useState(true);

  const [enregistrement, setEnregistrement] =
    useState(false);

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const chargerProfil = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErreur("Vous devez être connecté.");
        setChargement(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "display_name, phone, email, avatar_url, show_email, show_phone"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        setErreur(
          `Impossible de charger votre profil : ${error.message}`
        );
        setChargement(false);
        return;
      }

      setNom(data?.display_name || "");
      setTelephone(data?.phone || "");
      setEmail(user.email || data?.email || "");

      setAvatarUrl(data?.avatar_url || null);

      setAfficherEmail(
        data?.show_email ?? false
      );

      setAfficherTelephone(
        data?.show_phone ?? false
      );

      setChargement(false);
    };

    chargerProfil();
  }, []);

  const enregistrerProfil = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setErreur("");
    setEnregistrement(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErreur("Vous devez être connecté.");
        return;
      }

      if (!email.trim()) {
        setErreur(
          "Veuillez saisir une adresse e-mail."
        );
        return;
      }

      const nouvelEmail = email.trim();

      // ==========================================
      // CHANGEMENT D'EMAIL
      // ==========================================

      if (
        nouvelEmail !== (user.email || "")
      ) {
        const { error: emailError } =
          await supabase.auth.updateUser({
            email: nouvelEmail,
          });

        if (emailError) {
          setErreur(
            `Impossible de modifier l'adresse e-mail : ${emailError.message}`
          );
          return;
        }

        setMessage(
          "Votre demande de changement d'e-mail a été envoyée. Consultez votre boîte e-mail pour les confirmations demandées par DONA."
        );
      }

      let nouvelleAvatarUrl = avatarUrl;

      // ==========================================
      // UPLOAD PHOTO
      // ==========================================

      if (photo) {
        const extension =
          photo.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const nomFichier =
          `${user.id}-${Date.now()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("avatars")
            .upload(nomFichier, photo);

        if (uploadError) {
          setErreur(
            `Impossible d'envoyer la photo : ${uploadError.message}`
          );
          return;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("avatars")
            .getPublicUrl(nomFichier);

        nouvelleAvatarUrl =
          publicUrlData.publicUrl;
      }

      // ==========================================
      // ENREGISTREMENT PROFIL
      // ==========================================

      const { error: profilError } =
        await supabase
          .from("profiles")
          .update({
            display_name: nom,
            phone: telephone,
            avatar_url: nouvelleAvatarUrl,
            show_email: afficherEmail,
            show_phone: afficherTelephone,
          })
          .eq("id", user.id);

      if (profilError) {
        setErreur(
          `L'e-mail a été traité, mais les autres informations n'ont pas pu être enregistrées : ${profilError.message}`
        );
        return;
      }

      setAvatarUrl(nouvelleAvatarUrl);
      setPhoto(null);

      if (
        nouvelEmail === (user.email || "")
      ) {
        setMessage(
          "Votre profil a été enregistré."
        );
      }
    } catch (error) {
      console.error(error);

      setErreur(
        "Une erreur inattendue est survenue."
      );
    } finally {
      setEnregistrement(false);
    }
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

          <p>
            Chargement de vos informations...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

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
          href="/profil"
          className="back"
        >
          ← Retour à mon profil
        </Link>

        <div className="title-area">

          <span className="small-title">
            MON COMPTE
          </span>

          <h1>
            Modifier mon profil
          </h1>

          <p>
            Mettez à jour vos informations
            personnelles.
          </p>

        </div>

        {/* MESSAGES */}

        {erreur && (
          <div className="alert error">
            <span className="alert-icon">
              !
            </span>

            <p>{erreur}</p>
          </div>
        )}

        {message && (
          <div className="alert success">
            <span className="alert-icon">
              ✓
            </span>

            <p>{message}</p>
          </div>
        )}

        <form
          onSubmit={enregistrerProfil}
        >

          {/* PHOTO */}

          <section className="card">

            <div className="section-heading">

              <div>
                <h2>
                  Photo de profil
                </h2>

                <p>
                  Cette photo sera visible
                  sur votre profil.
                </p>
              </div>

            </div>

            <div className="photo-area">

              <div className="avatar">

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Photo de profil"
                  />
                ) : (
                  <span>
                    {nom
                      ? nom
                          .charAt(0)
                          .toUpperCase()
                      : "D"}
                  </span>
                )}

              </div>

              <div className="photo-actions">

                <label
                  htmlFor="photo"
                  className="photo-button"
                >
                  Choisir une photo
                </label>

                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const fichier =
                      e.target.files?.[0] ||
                      null;

                    setPhoto(fichier);
                  }}
                />

                {photo && (
                  <p className="selected-photo">
                    ✓ {photo.name}
                  </p>
                )}

                <small>
                  JPG, PNG ou autre image.
                </small>

              </div>

            </div>

          </section>

          {/* INFORMATIONS */}

          <section className="card">

            <div className="section-heading">

              <h2>
                Informations personnelles
              </h2>

              <p>
                Ces informations permettent
                aux utilisateurs de vous
                identifier.
              </p>

            </div>

            <div className="fields">

              {/* NOM */}

              <div className="field">

                <label htmlFor="nom">
                  Nom
                </label>

                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) =>
                    setNom(e.target.value)
                  }
                  placeholder="Votre nom"
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="field">

                <label htmlFor="email">
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="votre@email.com"
                  required
                />

                <small>
                  Une confirmation peut être
                  demandée en cas de
                  changement.
                </small>

              </div>

              {/* TELEPHONE */}

              <div className="field">

                <label htmlFor="telephone">
                  Téléphone
                </label>

                <input
                  id="telephone"
                  type="tel"
                  value={telephone}
                  onChange={(e) =>
                    setTelephone(
                      e.target.value
                    )
                  }
                  placeholder="Votre numéro de téléphone"
                />

              </div>

            </div>

          </section>

          {/* CONFIDENTIALITÉ */}

          <section className="card">

            <div className="section-heading">

              <h2>
                Confidentialité
              </h2>

              <p>
                Choisissez les informations
                visibles par les autres
                utilisateurs.
              </p>

            </div>

            <div className="privacy-list">

              {/* EMAIL */}

              <label className="privacy-item">

                <div className="privacy-icon">
                  ✉
                </div>

                <div className="privacy-text">

                  <strong>
                    Afficher mon e-mail
                  </strong>

                  <span>
                    Permettre aux autres
                    utilisateurs de voir
                    votre adresse e-mail
                    sur votre profil public.
                  </span>

                </div>

                <input
                  type="checkbox"
                  checked={afficherEmail}
                  onChange={(e) =>
                    setAfficherEmail(
                      e.target.checked
                    )
                  }
                />

                <span className="toggle">
                  <span></span>
                </span>

              </label>

              {/* TELEPHONE */}

              <label className="privacy-item">

                <div className="privacy-icon">
                  ☎
                </div>

                <div className="privacy-text">

                  <strong>
                    Afficher mon téléphone
                  </strong>

                  <span>
                    Permettre aux autres
                    utilisateurs de voir
                    votre numéro sur votre
                    profil public.
                  </span>

                </div>

                <input
                  type="checkbox"
                  checked={afficherTelephone}
                  onChange={(e) =>
                    setAfficherTelephone(
                      e.target.checked
                    )
                  }
                />

                <span className="toggle">
                  <span></span>
                </span>

              </label>

            </div>

          </section>

          {/* ENREGISTRER */}

          <button
            type="submit"
            className="save-button"
            disabled={enregistrement}
          >
            {enregistrement
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>

        </form>

        <button
          type="button"
          className="cancel-button"
          onClick={() =>
            router.push("/profil")
          }
        >
          Annuler
        </button>

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
          font-size: 36px;
          color: #30232b;
        }

        .title-area p {
          margin: 0;
          color: #806c77;
          font-size: 15px;
        }

        /* CARTES */

        .card {
          background: white;
          border: 1px solid #f0dfe7;
          border-radius: 22px;
          padding: 25px;
          margin-bottom: 18px;
          box-shadow:
            0 7px 25px
            rgba(160, 85, 120, 0.06);
        }

        .section-heading {
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .section-heading p {
          margin: 0;
          color: #9a858f;
          font-size: 12px;
          line-height: 1.5;
        }

        /* PHOTO */

        .photo-area {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .avatar {
          width: 105px;
          height: 105px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #fce6f0;
          border: 4px solid #f8dce8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar span {
          color: #b43f72;
          font-size: 38px;
          font-weight: 800;
        }

        .photo-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
        }

        .photo-actions input {
          display: none;
        }

        .photo-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 16px;
          border-radius: 11px;
          background: #fce6f0;
          color: #b43f72;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .photo-button:hover {
          background: #f8dce8;
        }

        .photo-actions small {
          color: #a18d97;
          font-size: 10px;
        }

        .selected-photo {
          margin: 0;
          color: #4d9b70;
          font-size: 11px;
          max-width: 300px;
          overflow-wrap: anywhere;
        }

        /* CHAMPS */

        .fields {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          color: #493842;
          font-size: 13px;
          font-weight: 700;
        }

        .field input {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #ead9e1;
          border-radius: 12px;
          outline: none;
          background: #fffafd;
          color: #352832;
          font-size: 14px;
        }

        .field input:focus {
          border-color: #d95b91;
          box-shadow:
            0 0 0 3px #fce6f0;
        }

        .field small {
          color: #a18d97;
          font-size: 10px;
        }

        /* CONFIDENTIALITÉ */

        .privacy-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .privacy-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1px solid #f1e1e8;
          border-radius: 15px;
          background: #fffafd;
          cursor: pointer;
        }

        .privacy-item:hover {
          border-color: #e8bfd1;
        }

        .privacy-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #fce6f0;
          color: #b43f72;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .privacy-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 8px;
        }

        .privacy-text strong {
          font-size: 13px;
          color: #403039;
        }

        .privacy-text span {
          color: #9a858f;
          font-size: 10px;
          line-height: 1.4;
        }

        .privacy-item input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .toggle {
          width: 42px;
          height: 24px;
          border-radius: 20px;
          background: #ddcbd4;
          padding: 3px;
          flex-shrink: 0;
          transition: 0.2s;
        }

        .toggle span {
          display: block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow:
            0 1px 4px
            rgba(0, 0, 0, 0.15);
          transition: 0.2s;
        }

        .privacy-item
          input:checked
          + .toggle {
          background: #d95b91;
        }

        .privacy-item
          input:checked
          + .toggle
          span {
          transform: translateX(18px);
        }

        /* BOUTON */

        .save-button {
          width: 100%;
          border: none;
          background: #d95b91;
          color: white;
          padding: 15px;
          border-radius: 13px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 3px;
        }

        .save-button:hover {
          background: #c94d83;
        }

        .save-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .cancel-button {
          width: 100%;
          border: 1px solid #efdce5;
          background: white;
          color: #806c77;
          padding: 13px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
        }

        .cancel-button:hover {
          background: #fff4f8;
        }

        /* ALERTES */

        .alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-radius: 14px;
          padding: 13px 15px;
          margin-bottom: 18px;
        }

        .alert p {
          margin: 0;
          font-size: 12px;
          line-height: 1.5;
        }

        .alert-icon {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .alert.error {
          background: #fff1f1;
          border: 1px solid #f2d4d4;
          color: #a34242;
        }

        .alert.error .alert-icon {
          background: #f4dada;
        }

        .alert.success {
          background: #f0faf4;
          border: 1px solid #d5eddd;
          color: #397957;
        }

        .alert.success .alert-icon {
          background: #d8efdf;
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
            font-size: 30px;
          }

          .card {
            padding: 20px;
            border-radius: 19px;
          }

          .photo-area {
            align-items: flex-start;
          }

          .avatar {
            width: 85px;
            height: 85px;
          }

          .avatar span {
            font-size: 29px;
          }

          .privacy-item {
            align-items: flex-start;
          }

          .privacy-icon {
            width: 36px;
            height: 36px;
          }

          .toggle {
            margin-top: 6px;
          }

          footer {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 420px) {

          .photo-area {
            flex-direction: column;
          }

          .photo-actions {
            width: 100%;
          }

          .photo-button {
            width: 100%;
          }

        }

      `}</style>
    </main>
  );
}

