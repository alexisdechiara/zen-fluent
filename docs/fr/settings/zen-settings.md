# Zen settings (réglages de Zen)

Traduction de [docs/settings/zen-settings.md](../../settings/zen-settings.md).

Des préférences de Zen et de Firefox, avec les mêmes valeurs par défaut.

En-tête du groupe : `zen-fluent.ui.open-zen` (ouvert par défaut : `false`).

| Réglage                                                               | Préférence                                                                  | Valeurs                                                                              | Défaut             |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| Floating URL bar                                                      | `zen.urlbar.behavior`                                                       | `floating-on-type` When typing<br>`float` Always<br>`normal` Never                   | `floating-on-type` |
| New tab in the floating URL bar                                       | `zen.urlbar.replace-newtab`                                                 | `true` / `false`                                                                     | `true`             |
| Copy link button (barre d'outils unique)                              | `zen.urlbar.single-toolbar-show-copy-url`                                   | `true` / `false`                                                                     | `true`             |
| Domain only in the URL bar (barre d'outils unique)                    | `zen.urlbar.show-domain-only-in-sidebar`                                    | `true` / `false`                                                                     | `true`             |
| Tracking protection icon                                              | `zen.urlbar.show-protections-icon`                                          | `true` / `false`                                                                     | `false`            |
| Picture-in-Picture button in the URL bar                              | `zen.urlbar.show-pip-button`                                                | `true` / `false`                                                                     | `false`            |
| Tab preview on hover                                                  | `browser.tabs.hoverPreview.enabled`                                         | `true` / `false`                                                                     | `false`            |
| Page thumbnail in the preview                                         | `browser.tabs.hoverPreview.showThumbnails`                                  | `true` / `false`                                                                     | `true`             |
| Page loading indicator                                                | `zen.view.enable-loading-indicator`                                         | `true` / `false`                                                                     | `true`             |
| Grey out inactive windows                                             | `zen.view.grey-out-inactive-windows`                                        | `true` / `false`                                                                     | `true`             |
| Drop a tab on the page to split the view                              | `zen.splitView.enable-tab-drop`                                             | `true` / `false`                                                                     | `true`             |
| Glance                                                                | `zen.glance.enabled`                                                        | `true` / `false`                                                                     | `true`             |
| Open a link in Glance with                                            | `zen.glance.activation-method`                                              | `alt` Alt+clic<br>`ctrl` Ctrl+clic<br>`shift` Maj+clic<br>`meta` touche Windows+clic | `alt`              |
| Picture-in-Picture when leaving a video's tab                         | `media.videocontrols.picture-in-picture.enable-when-switching-tabs.enabled` | `true` / `false`                                                                     | `false`            |
| Full Picture-in-Picture controls (avance, saut, barre de progression) | `media.videocontrols.picture-in-picture.improved-video-controls.enabled`    | `true` / `false`                                                                     | `true`             |

## Notes

Ce groupe expose des préférences de Zen et de Firefox avec les valeurs par
défaut de Zen. Sine n'écrit une `defaultValue` que si la préférence n'existe
pas encore : les valeurs que vous avez déjà sont conservées.

- **Glance** et **Open a link in Glance with** : le Glance de Zen (un lien
  ouvert dans un aperçu flottant) et son clic (Alt par défaut). **Glance link
  preview** de Zen Fluent Enhanced montre le lien tant que cette touche est
  enfoncée.
- **Page thumbnail in the preview** est masqué sans **Tab preview on
  hover** ; sans l'aperçu, c'est l'infobulle WinUI qui s'affiche.
- Tant qu'une vidéo est en Picture-in-Picture, Zen masque la carte
  multimédia dans la barre latérale ; elle revient à la fermeture du
  Picture-in-Picture.
