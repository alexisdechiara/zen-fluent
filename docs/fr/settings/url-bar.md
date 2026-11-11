# URL bar (barre d'adresse)

Traduction de [docs/settings/url-bar.md](../../settings/url-bar.md).

Forme, ligne d'accent, position de l'adresse, icônes.

En-tête du groupe : `zen-fluent.ui.open-urlbar` (ouvert par défaut :
`false`).

| Réglage                                                          | Préférence                        | Valeurs                                                                                                                                                                                                           | Défaut  |
| ---------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| URL bar shape                                                    | `zen-fluent.url-style`            | `auto` Automatic (celle du style)<br>`textbox` Text box (WinUI)<br>`pill` Pill (Edge)<br>`transparent` Transparent                                                                                                | `auto`  |
| Accent line under the URL bar                                    | `zen-fluent.url-underline`        | `focus` On focus (WinUI)<br>`animated` On focus, animated (Fluent 2)<br>`always` Always<br>`none` Never                                                                                                           | `focus` |
| Floating URL bar color                                           | `zen-fluent.url-floating-color`   | `solid` Solid (blanc ou noir, opaque)<br>`standard` Standard (le matériau de la fenêtre)<br>`tint` Tint (la couleur de l'espace, sinon l'accent)<br>`translucent` Translucent (verre translucide, comme dans Arc) | `solid` |
| Centered URL                                                     | `zen-fluent.url-centered`         | `true` / `false`                                                                                                                                                                                                  | `false` |
| Hide the zoom level                                              | `zen-fluent.url-hide-zoom`        | `true` / `false`                                                                                                                                                                                                  | `false` |
| Hide permission icons (seule la demande ouverte garde son icône) | `zen-fluent.url-hide-permissions` | `true` / `false`                                                                                                                                                                                                  | `false` |

## Notes

- **URL bar shape** : suivre le style (champ de texte WinUI, pilule Edge),
  champ de texte, pilule ou transparent. La pilule est une vraie pilule
  (rayon = la moitié de la hauteur), avec le bouton du site au début et des
  boutons ronds de 28 px centrés sur les extrémités. Ouverte, la surface
  grandit de 4 px tout autour (rayon 20) ; flottante, c'est une carte au
  rayon de 24 px, une pilule complète quand il n'y a pas de résultats.
- **Accent line** : au focus (WinUI, par défaut), au focus et animée depuis
  le centre (Fluent 2), toujours (1 px au repos, 2 px au focus) ou jamais.
  Sur la pilule, la ligne s'arrête aux extrémités arrondies.
- **Floating URL bar color**, avec les noms des variantes : **Solid**, blanc
  en mode clair et presque noir en mode sombre (par défaut) ; **Standard**,
  le matériau de la fenêtre (la couleur Mica Alt opaque sous Mica Alt) ;
  **Tint**, la carte pleine teintée de la couleur de l'espace, ou de l'accent
  tant que l'espace n'en a pas ; **Translucent**, un verre translucide comme
  la barre de commandes d'Arc (le flou atteint la barre latérale, pas la
  page : Firefox ne floute jamais le contenu web, la page est seulement
  assombrie). « Material » et « Space color », enregistrés par la 0.4.2, se
  lisent comme Standard et Tint. Tant que la barre flotte, sa place dans la
  barre latérale garde l'apparence du champ au repos (fond, trait et coins)
  au lieu de celle de Zen.
- **Hide permission icons** : seule la demande à l'écran garde son icône ;
  une demande refusée pour l'instant n'a plus d'icône pour y revenir.
