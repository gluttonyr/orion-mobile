import { createApi } from "@/service/api.config";

// Mêmes coordonnées que le web (SupportPages.tsx).
export const SUPPORT_EMAIL = "orionmarket9@gmail.com";
export const SUPPORT_PHONE = "+228 97 79 01 49";
export const SUPPORT_WHATSAPP_URL = `https://wa.me/22897790149?text=${encodeURIComponent("Bonjour, j’ai besoin d’aide sur Orion.")}`;

export type HelpQuestion = { id: number; categorieId: number; titre: string; description: string };
export type HelpCategory = { id: number; titre: string; description: string; questions: HelpQuestion[] };
export type AboutTeamMember = { id: number; name: string; role: string; bio?: string | null; photo?: string | null; position?: number };

const aideApi = createApi("aide");
const aboutApi = createApi("about");

export const supportService = {
  getHelpCategories: async (): Promise<HelpCategory[]> => (await aideApi.get("/")).data,
  getAboutTeam: async (): Promise<AboutTeamMember[]> => (await aboutApi.get("/team")).data,
};

export const CONDITIONS_LAST_UPDATE = "28 octobre 2026";

export type Article = { id: string; title: string; paragraphs: string[] };

export const CONDITIONS: Article[] = [
  { id: "presentation", title: "Présentation et acceptation", paragraphs: [
    "Orion est une plateforme qui met en relation des acheteurs, des commerçants et des porteurs d’opportunités en Afrique. Elle permet de publier et de consulter des produits, des boutiques et des missions.",
    "En créant un compte ou en utilisant Orion, tu acceptes les présentes conditions. Si tu n’es pas d’accord, tu ne dois pas utiliser la plateforme.",
  ] },
  { id: "compte", title: "Inscription et compte", paragraphs: [
    "Tu dois avoir au moins 18 ans, ou l’accord d’un représentant légal, pour créer un compte. Les informations fournies doivent être exactes et à jour.",
    "Le profil choisi à l’inscription (Commerçant ou Jeune entrepreneur) est définitif. Tu es responsable de la confidentialité de ton mot de passe et des actions faites depuis ton compte.",
    "Un seul compte par personne, sauf accord de notre part.",
  ] },
  { id: "role", title: "Rôle d’Orion", paragraphs: [
    "Orion est une plateforme d’intermédiation. Nous ne sommes pas le vendeur des produits publiés par les commerçants et nous ne sommes pas partie au contrat de vente conclu entre un acheteur et un commerçant.",
    "Nous faisons de notre mieux pour vérifier les comptes et les contenus, sans pouvoir garantir la qualité, la légalité ou la disponibilité de chaque produit ou offre.",
  ] },
  { id: "paiements", title: "Achats, paiements et remise", paragraphs: [
    "Les paiements sont traités par notre prestataire FedaPay. Orion ne collecte ni ne conserve aucune donnée bancaire.",
    "Une commande est confirmée lorsque FedaPay valide le paiement. Le montant est alors conservé par Orion jusqu’à la remise de la commande.",
    "À la remise, l’acheteur scanne le QR code présenté par le commerçant. Ce scan confirme la réception et libère le paiement au commerçant : il ne doit être fait qu’une fois la commande reçue.",
    "Les frais éventuels de l’opérateur de paiement restent à la charge de la personne qui paie, sauf indication contraire.",
  ] },
  { id: "commercants", title: "Obligations des commerçants", paragraphs: [
    "Le commerçant s’engage à publier des informations exactes (description, prix, photos, stock), à livrer les produits commandés et payés, et à respecter les lois applicables.",
    "L’offre Standard gratuite permet une boutique et jusqu’à 40 produits. Il est interdit de vendre des produits illégaux, contrefaits, dangereux ou réglementés sans autorisation.",
  ] },
  { id: "opportunites", title: "Opportunités", paragraphs: [
    "Les missions publiées dans la section Opportunités sont sous la responsabilité de leur auteur. Orion n’est pas l’employeur et ne garantit ni l’obtention d’une mission ni l’exactitude d’une offre.",
    "La publication d’une mission est payante (500 FCFA). Elle devient visible après confirmation du paiement par FedaPay.",
  ] },
  { id: "interdits", title: "Comportements interdits", paragraphs: [
    "Il est interdit d’utiliser Orion pour tromper ou escroquer d’autres utilisateurs, usurper une identité, publier des contenus illégaux, violents, haineux ou à caractère sexuel, envoyer du spam ou perturber le fonctionnement de la plateforme.",
    "Il est aussi interdit de demander un paiement en dehors d’Orion pour contourner les règles de la plateforme, ou de collecter les données d’autres utilisateurs sans autorisation.",
  ] },
  { id: "responsabilite", title: "Responsabilité et litiges", paragraphs: [
    "En cas de problème avec une commande, contacte d’abord le commerçant par la messagerie. Si le problème n’est pas résolu, écris au support avec ta référence de commande : nous pouvons aider à la médiation, sans obligation de résultat.",
    "Dans la limite permise par la loi, Orion n’est pas responsable des pertes liées à une transaction entre utilisateurs, à une interruption du service ou à un événement indépendant de notre volonté (panne de réseau ou d’un opérateur de paiement, par exemple).",
  ] },
  { id: "suspension", title: "Suspension et fermeture de compte", paragraphs: [
    "Nous pouvons suspendre ou supprimer un compte, ou retirer un contenu, en cas de non-respect de ces conditions, de fraude ou de signalements sérieux.",
    "Tu peux demander la fermeture de ton compte à tout moment en nous écrivant.",
  ] },
  { id: "donnees", title: "Données personnelles", paragraphs: [
    "Nous utilisons tes données uniquement pour faire fonctionner Orion : compte, commandes, livraison, paiements, sécurité et support.",
  ] },
  { id: "modification", title: "Modification des conditions", paragraphs: [
    "Nous pouvons modifier ces conditions. En cas de changement important, nous t’en informons sur la plateforme. Continuer à utiliser Orion après la modification vaut acceptation des nouvelles conditions.",
  ] },
  { id: "droit", title: "Droit applicable et contact", paragraphs: [
    "Ces conditions sont régies par le droit togolais. En cas de litige non résolu à l’amiable, les tribunaux compétents de Lomé seront saisis.",
    `Pour toute question sur ces conditions, écris-nous à ${SUPPORT_EMAIL}.`,
  ] },
];

