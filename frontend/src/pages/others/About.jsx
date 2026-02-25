import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import MenuButtons from "../../components/Buttons/Menu.jsx";
import SEOHead from "../../components/SEOHead.jsx";
import Footer from "../../components/Footer.jsx";
import "./About.scss";

export default function About() {
  const screenRef = useRef(null);

  useGSAP(() => {
    gsap.to(screenRef.current, {
      duration: 0.45,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  return (
    <>
      <SEOHead
        title="À Propos - Maison Hoolis"
        description="Découvrez l'histoire et les valeurs de Maison Hoolis, créateur de vêtements haut de gamme."
        keywords="maison hoolis, à propos, histoire, luxe français"
        url="https://maisonhoolis.com/about"
      />

      <div ref={screenRef} className="about-container">
        <div className="about-content">
          <h1>À Propos</h1>

          <section>
            <h2>Qui sommes-nous</h2>
            <p>
              MAISON HOOLIS est un collectif de quatre créateurs originaires de la banlieue sud de Paris.
              Des profils différents, des sensibilités multiples, réunies par une même volonté : mettre en
              commun nos compétences pour créer un projet plus grand que ce que nous aurions pu construire seuls.
            </p>
            <p>
              Nous n'avons pas suivi de parcours académique en mode, en design ou en couture. Notre apprentissage
              s'est fait autrement, par la pratique, par l'expérimentation et par une passion commune pour le beau
              textile, les objets bien faits et la notion de beauté dans son sens le plus large.
            </p>
            <p>
              Le projet est né du faire. Des premières pièces teintes à la main, des t-shirts réalisés en séries
              limitées ou en pièces uniques, puis des pulls brodés, travaillés un sur un. Nous avons crocheté sans
              savoir parfaitement crocheter, cousu sans être couturiers, avec une seule idée en tête : apprendre en
              faisant, dépasser nos limites et explorer celles de la mode.
            </p>
            <p>
              Depuis deux ans, MAISONHOOLIS produit localement en France, en collaboration étroite avec un atelier
              de réinsertion. Cette relation nous permet de travailler avec un savoir-faire professionnel tout en
              inscrivant notre démarche dans une logique sociale et responsable, à l'opposé des mécanismes de la fast fashion.
            </p>
            <p>
              Avec le temps, un autre pan s'est naturellement greffé au projet : l'achat-revente. D'abord par passion,
              puis par cohérence artistique et économique, cette activité est devenue une part intégrante de notre identité.
              Elle nous permet d'approfondir notre connaissance des objets, des matières et des savoir-faire, tout en
              nourrissant la création.
            </p>
            <p>
              Aujourd'hui, MAISONHOOLIS est à la fois une maison de conception et une maison de sélection. Plus d'une
              centaine de sacs ont été vendus, ainsi que de nombreuses pièces d'horlogerie. Certains clients viennent
              pour nos créations, d'autres pour nos pièces de seconde main. Les deux font désormais partie du même ADN.
            </p>
            <p className="highlight">
              MAISONHOOLIS est une maison en mouvement, portée par l'expérimentation, la transmission et une culture
              exigeante de l'objet.
            </p>
          </section>

          <section>
            <h2>Que faisons-nous</h2>
            <p>
              MAISONHOOLIS est une maison de création et de sélection, structurée autour d'une exigence commune :
              proposer des pièces rares, durables et pensées dans le détail.
            </p>
            <p>
              Nous concevons et produisons nos propres designs, sous forme de pièces uniques ou de très petites séries.
              Chaque création est développée comme un objet à part entière, avec une attention particulière portée aux
              matières, aux proportions et à la cohérence globale. Ici, la quantité n'est jamais un objectif. La qualité, toujours.
            </p>
            <p>
              Depuis 2023, notre production textile s'appuie exclusivement sur des textiles de seconde main et des matières
              existantes. Ce choix est à la fois esthétique, écologique et économique. À l'heure où l'industrie privilégie
              des textiles dérivés du plastique et une production low cost déconnectée de toute réalité humaine, nous avons
              choisi de travailler avec des matières durables, principalement naturelles, et de produire localement.
            </p>
            <p>
              Les textiles sont sourcés à Paris ou auprès de partenaires de proximité, ce qui nous permet de produire
              rapidement, en quantités maîtrisées, sans compromis sur la qualité. L'upcycling est au cœur de notre démarche :
              certaines pièces issues de l'achat revente, lorsqu'elles ne peuvent être revendues, deviennent matière première.
              Elles sont transformées, réinterprétées et intégrées à nos créations. Rien n'est laissé au hasard, rien n'est
              produit sans intention.
            </p>
            <p>
              En parallèle du textile, MAISONHOOLIS développe des projets de maroquinerie premium. Des sacs et pochettes
              entièrement conceptualisés de A à Z, à partir de designs maison. Les formes, les techniques et les associations
              de matières sont pensées en interne, avec des matériaux nobles, des cuirs sélectionnés et des matières de seconde
              main, dans une logique de durabilité et d'exclusivité. Ces pièces sont produites en France, en quantités très limitées.
            </p>
            <p>
              MAISONHOOLIS est également un pôle de production événementielle et de création de contenu. Défilés, pop ups,
              vidéos et shootings sont pensés et réalisés en interne, afin de garantir une cohérence totale entre les pièces,
              leur image et leur mise en scène.
            </p>
            <p>
              Enfin, MAISONHOOLIS est un acteur reconnu de l'achat revente de beaux objets. Sacs et montres sont sélectionnés
              avec la même exigence que nos créations. Pièces de caractère, objets premium, choisis pour leur qualité, leur
              histoire et leur potentiel de transmission.
            </p>
            <p className="manifesto">
              MAISONHOOLIS défend une vision exigeante et responsable de la création.<br/>
              Produire moins.<br/>
              Produire mieux.<br/>
              Et prouver qu'une production premium, locale et consciente est possible.
            </p>
          </section>

          <section>
            <h2>Où nous trouver</h2>
            <p>
              Les créations MAISONHOOLIS sont visibles en physique et en ligne, dans des lieux et sur des plateformes
              sélectionnés avec la même exigence que nos pièces.
            </p>
            <p>
              Nos créations sont exposées à la <strong>Friperie Factory</strong>, située à la Cité artisanale des Champs Élysées,
              55 rue Alexandre Solzhenitsyn, 91000 Évry Courcouronnes. C'est là que notre production textile est présentée de
              manière permanente, dans un cadre fidèle à notre démarche et à notre vision.
            </p>
            <p>
              MAISONHOOLIS est également présente lors de ventes éphémères à Paris. Ces événements prennent la forme de boutiques
              temporaires et de ventes privées, pensées comme des moments de rencontre, de découverte et d'échange autour des
              pièces, de leur histoire et de leur fabrication.
            </p>
            <p>
              En ligne, nos pièces de seconde main et nos sélections sont accessibles sur plusieurs plateformes. MAISONHOOLIS
              est présente sur Whatnot, Vinted, Vestiaire Collective et Catawiki, via différents comptes gérés par les membres
              du collectif.
            </p>
            <p>
              Enfin, un site MAISONHOOLIS est actuellement en préparation. Il réunira nos créations, nos sélections et notre
              univers dans un espace unique, et sera disponible très prochainement.
            </p>
            <p className="closing">
              Si vous cherchez MAISONHOOLIS, vous savez désormais où nous trouver.
            </p>
          </section>
        </div>
        <Footer />
        <MenuButtons screenRef={screenRef} />
      </div>
    </>
  );
}
