// Zen Fluent setup: its text, in French when Windows is.
using System.Globalization;

namespace ZenFluentSetup;

public static class S
{
    private static readonly bool French = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "fr";

    private static readonly Dictionary<string, (string En, string Fr)> Text = new()
    {
        ["Title"] = ("Zen Fluent setup", "Installation de Zen Fluent"),
        ["Lead"] = ("Mica, Acrylic and the controls of Windows 11 for Zen. Close Zen, pick its version, its profile and what to install.", "Mica, Acrylic et les contrôles de Windows 11 pour Zen. Fermez Zen, puis choisissez sa version, son profil et ce qu'il faut installer."),
        ["Edition"] = ("Zen version", "Version de Zen"),
        ["OtherFolder"] = ("Other folder…", "Autre dossier…"),
        ["TooOld"] = ("Zen Fluent needs Zen 1.23 or later: update {0} first.", "Zen Fluent nécessite Zen 1.23 ou plus récent : mettez d'abord {0} à jour."),
        ["Profile"] = ("Profile", "Profil"),
        ["OpensDefault"] = ("opened by default", "ouvert par défaut"),
        ["Components"] = ("What to install", "À installer"),
        ["Sine"] = ("Sine, the mod manager", "Sine, le gestionnaire de mods"),
        ["SineThere"] = ("Sine (already installed)", "Sine (déjà installé)"),
        ["Fluent"] = ("Zen Fluent: Mica, Acrylic and WinUI 3 for Zen", "Zen Fluent : Mica, Acrylic et WinUI 3 pour Zen"),
        ["Enhanced"] = ("Zen Fluent Enhanced: settings page, French interface, features", "Zen Fluent Enhanced : page de paramètres, interface en français, fonctions"),
        ["UnsafeJs"] = ("Allow the scripts of mods installed outside Sine's store (needed by Zen Fluent Enhanced: sine.allow-unsafe-js)", "Autoriser les scripts des mods installés hors de la boutique de Sine (nécessaire à Zen Fluent Enhanced : sine.allow-unsafe-js)"),
        ["CoreLine"] = ("The Fluent look: Mica, Acrylic and the controls of Windows 11, with every setting in Sine.", "Le style Fluent : Mica, Acrylic et les contrôles de Windows 11, avec tous ses réglages dans Sine."),
        ["CoreTag"] = ("CSS only", "CSS uniquement"),
        ["EnhancedLine"] = ("All of Zen Fluent, plus its settings page, the welcome tour, settings per space and the features.", "Tout Zen Fluent, plus sa page de paramètres, la visite guidée, les réglages par espace et les fonctions."),
        ["EnhancedTag"] = ("Includes Zen Fluent · runs scripts", "Inclut Zen Fluent · exécute des scripts"),
        ["ConsentNeeded"] = ("Check this box to install Zen Fluent Enhanced, or pick Zen Fluent.", "Cochez cette case pour installer Zen Fluent Enhanced, ou choisissez Zen Fluent."),
        ["SineNote"] = ("Sine, Zen's mod manager, is installed with it.", "Sine, le gestionnaire de mods de Zen, est installé avec."),
        ["SineKeptNote"] = ("Sine is already in this profile: it is kept.", "Sine est déjà dans ce profil : il est conservé."),
        ["Install"] = ("Install", "Installer"),
        ["Close"] = ("Close", "Fermer"),
        ["Details"] = ("Details", "Détails"),
        ["Installing"] = ("Installing…", "Installation…"),
        ["NoZen"] = ("Zen was not found. Pick its folder (the one with zen.exe).", "Zen est introuvable. Choisissez son dossier (celui qui contient zen.exe)."),
        ["NotZen"] = ("This folder has no zen.exe.", "Ce dossier ne contient pas zen.exe."),
        ["NoProfile"] = ("This version of Zen has no profile yet: open it once, then close it.", "Cette version de Zen n'a pas encore de profil : ouvrez-la une fois, puis fermez-la."),
        ["ZenRunning"] = ("Zen is open on this profile. Close it (every window), then install again.", "Zen est ouvert sur ce profil. Fermez-le (toutes les fenêtres), puis relancez l'installation."),
        ["NeedConsent"] = ("Zen Fluent Enhanced runs scripts: check the box that allows them, or uncheck Zen Fluent Enhanced.", "Zen Fluent Enhanced exécute des scripts : cochez la case qui les autorise, ou décochez Zen Fluent Enhanced."),
        ["Downloading"] = ("Downloading {0}…", "Téléchargement de {0}…"),
        ["Retry"] = ("GitHub did not answer: trying again in {0} s…", "GitHub ne répond pas : nouvel essai dans {0} s…"),
        ["GitHubDown"] = ("{0} does not answer (GitHub may be down): try again in a few minutes.", "{0} ne répond pas (GitHub est peut-être en panne) : réessayez dans quelques minutes."),
        ["Bootloader"] = ("Installing Sine's bootloader in {0}", "Installation du chargeur de Sine dans {0}"),
        ["Elevate"] = ("Zen's folder is protected: Windows asks for administrator rights for this step.", "Le dossier de Zen est protégé : Windows demande les droits d'administrateur pour cette étape."),
        ["ElevateRefused"] = ("Administrator rights were refused: Sine's bootloader could not be installed.", "Les droits d'administrateur ont été refusés : le chargeur de Sine n'a pas pu être installé."),
        ["BootloaderFailed"] = ("Sine's bootloader could not be written to {0}.", "Le chargeur de Sine n'a pas pu être écrit dans {0}."),
        ["Engine"] = ("Installing Sine in the profile", "Installation de Sine dans le profil"),
        ["SineKept"] = ("Sine is already installed: kept.", "Sine est déjà installé : conservé."),
        ["Mod"] = ("Installing {0}", "Installation de {0}"),
        ["Backup"] = ("Previous mods.json saved as {0}", "Ancien mods.json enregistré sous {0}"),
        ["PrefsSet"] = ("Setting preferences", "Réglage des préférences"),
        ["Cache"] = ("Clearing Zen's startup cache", "Vidage du cache de démarrage de Zen"),
        ["Done"] = ("Done. Open Zen: Zen Fluent is in Zen's settings.", "Terminé. Ouvrez Zen : Zen Fluent est dans les paramètres de Zen."),
        ["DoneTitle"] = ("Zen Fluent is installed", "Zen Fluent est installé"),
        ["Failed"] = ("The installation failed", "L'installation a échoué"),
        ["Source"] = ("Installs from: {0}", "Installe depuis : {0}"),
    };

    public static string Get(string key) =>
        Text.TryGetValue(key, out var text) ? (French ? text.Fr : text.En) : key;
}
