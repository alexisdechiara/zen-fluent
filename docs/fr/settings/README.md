# Réglages

Version française de [docs/settings/README.md](../../settings/README.md).

Les réglages de Zen Fluent se trouvent dans Paramètres de Zen › Sine › Mods ›
la roue dentée sur la carte de Zen Fluent, ou sur la page de réglages de Zen
Fluent Enhanced. Chacun est une préférence (`about:config`) : un réglage peut
donc aussi être changé là, ou conservé dans `user.js`.

Les noms des réglages et de leurs valeurs sont donnés tels que Sine les
affiche, en anglais ; Zen Fluent Enhanced les traduit dans sa page de
réglages quand Zen est en français.

## Zen Fluent

Une page par groupe, avec les valeurs de chaque réglage et des notes :

| Groupe                                  | Contenu                                                         |
| --------------------------------------- | --------------------------------------------------------------- |
| [Appearance](appearance.md)             | Style, matériau, accent, coins, densité, police, flou Acrylic   |
| [Sidebar](sidebar.md)                   | Boutons, espaces de travail, mode compact                       |
| [Essentials](essentials.md)             | Tuile sélectionnée, taille, disposition, indicateurs            |
| [Extensions](extensions.md)             | La ligne des extensions épinglées : emplacement, taille, badges |
| [Variants](variants.md)                 | Fond et forme des boutons et des tuiles                         |
| [Tabs](tabs.md)                         | Texte, pastille, boutons de fermeture, son, conteneurs          |
| [URL bar](url-bar.md)                   | Forme, ligne d'accent, barre flottante, icônes                  |
| [Window and menus](window-and-menus.md) | Barre de titre, barre de chargement, menus, défilement          |
| [Animations](animations.md)             | Changement d'onglet, barre d'adresse, menus, icônes animées     |
| [Zones](zones.md)                       | Le style Fluent zone par zone                                   |
| [Zen settings](zen-settings.md)         | Des préférences de Zen et de Firefox                            |

Le tableau complet (chaque réglage, sa préférence et sa valeur par défaut,
vérifié par `npm run check`) n'existe qu'en anglais, pour ne pas en tenir
deux à jour : [docs/settings/README.md](../../settings/README.md#zen-fluent).

Les cases `zen-fluent.ui.open-<group>` sont les en-têtes des groupes (ouvert
ou fermé ; seul **Appearance** est ouvert par défaut) et
`zen-fluent.ui.expand-all` (**Show all settings**, `false` par défaut) ouvre
tous les groupes.

## Zen Fluent Enhanced

Une case par fonction, avec ses options. Ce que fait chaque fonction :
[enhanced.md](../enhanced.md). Les préférences et leurs valeurs par défaut :
[le tableau anglais](../../settings/README.md#zen-fluent-enhanced).
