import { Instagram, Twitter, Github } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/",
      label: "Siga-nos no Instagram",
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      href: "https://x.com/",
      label: "Siga-nos no X",
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/GMB-Rs",
      label: "Veja nosso código no GitHub",
    },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo / Sobre */}
          <div>
            <Link to="/" className="inline-block">
              <h2 className="text-xl font-bold hover:text-primary transition-colors">
                Lumma
              </h2>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Plataforma para descobrir as melhores ferramentas para
              desenvolvedores e público geral.
            </p>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-semibold mb-3">Redes Sociais</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    title={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 hover:scale-110 transform"
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-3">Contato</h3>
            <a
              href="mailto:Lumma@gmail.com"
              className="text-sm text-muted-foreground hover:text-primary transition-colors block"
            >
              Lumma@gmail.com
            </a>
            <p className="text-sm text-muted-foreground mt-4">
              © {currentYear} Lumma. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
      <div className="h-2 w-full bg-linear-to-r from-sky-300 via-blue-500 to-blue-800"></div>{" "}
    </footer>
  );
}

export default Footer;
