# WarLike Modeliser

Application web **autonome** de création graphique 2D et 3D. Elle ne contient **aucun éditeur de scripts** et ne modifie pas WarLike Engine.

## Ouvrir

Le site est statique et prêt à être hébergé sur GitHub Pages ou Cloudflare Pages. Pour un test local :

```bash
python -m http.server 8080
```

Puis ouvrir http://localhost:8080/ depuis le dossier du dépôt. Une connexion Internet est nécessaire pour charger Three.js depuis jsDelivr.

## Interface et personnalisation

- Six thèmes enregistrés localement : Graphite, Obsidian, Midnight Blue, Cyber Violet, Light Studio et Military Tactical.
- Icônes vectorielles SVG intégrées aux commandes, sans téléchargement de police d'icônes.
- Raccourcis 2D : Ctrl+Z (annuler), Ctrl+Y ou Ctrl+Maj+Z (rétablir).

## Outils

- **2D** : importer PNG/JPEG/WebP, dessiner, gommer, restaurer l'image d'origine, pipette, lignes, rectangles, ellipses, annuler/rétablir, rogner les marges transparentes, miroirs horizontal/vertical, rotation 90°, vider le canvas, supprimer le fond par propagation depuis les coins, déplacer et zoomer, exporter PNG transparent.
- **3D** : créer une géométrie approximative à partir de la silhouette ou de la luminance, régler profondeur/résolution, orienter la vue avec la souris, changer la taille et l'orientation du modèle, basculer l'affichage filaire, choisir la vue face/profil, recentrer la caméra et exporter GLB.
- **Projet** : enregistrer un fichier `.modeliser.json` et le rouvrir pour poursuivre l'édition.
- **Métadonnées** : exporter un manifeste `.warlike.json` documentant les noms des fichiers et les réglages.
- Images traitées localement dans le navigateur, sans téléversement à un service externe.

## Utilisation dans WarLike Engine

Exporter le sprite PNG ou le modèle GLB, puis importer ce fichier **manuellement** dans la bibliothèque d'assets de WarLike Engine. Le manifeste est informatif, pas un mécanisme d'importation automatisé.

## Limitations

La reconstruction 3D ne déduit pas les surfaces invisibles d'une image. Elle produit un volume pixelisé approximatif ; ce n'est ni de la photogrammétrie ni de la génération 3D assistée par IA. La précision dépend du détourage et de la résolution choisie.

La syntaxe JavaScript peut être vérifiée sans navigateur ; le fonctionnement WebGL, l'export GLB et les interactions nécessitent une QA dans un navigateur compatible WebGL2.
