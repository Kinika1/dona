import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header>
        <img src="/logo-dona.jpg" alt="Logo DONA" />
      </header>

      <section>
        <h2>Achetez. Vendez. Échangez.</h2>

        <p>
          DONA met en relation les vendeurs et les acheteurs simplement.
        </p>

        <button>Commencer</button>

        <p>
          <Link href="/messages">Messages</Link>
        </p>

        <p>
          <Link href="/profil">Mon profil</Link>
        </p>
      </section>

      <footer>
        <p>DONA 2026</p>
      </footer>
    </main>
  );
}