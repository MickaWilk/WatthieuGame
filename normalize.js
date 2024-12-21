import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Dossier d'entrée des sons (relatif à l'endroit où le script est exécuté)
const inputDir = path.join("public", "added_sounds");
// Dossier de sortie pour les sons normalisés (relatif également)
const outputDir = path.join("public", "sounds");

// Afficher les chemins pour déboguer
console.log('Répertoire d\'entrée des sons:', inputDir);
console.log('Répertoire de sortie des sons normalisés:', outputDir);

// Vérifier si le répertoire de sortie existe et le supprimer si nécessaire
if (fs.existsSync(outputDir)) {
  // Supprimer tous les fichiers et sous-dossiers dans le répertoire de sortie
  fs.readdirSync(outputDir).forEach((file) => {
    const filePath = path.join(outputDir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmdirSync(filePath, { recursive: true }); // Supprimer les sous-dossiers
    } else {
      fs.unlinkSync(filePath); // Supprimer les fichiers
    }
  });
  // Supprimer le dossier lui-même
  fs.rmdirSync(outputDir);
  console.log(`Répertoire ${outputDir} supprimé`);
}

// Créer le répertoire de sortie à nouveau
fs.mkdirSync(outputDir, { recursive: true });

// Normaliser chaque fichier audio dans le dossier d'entrée
fs.readdirSync(inputDir).forEach((file) => {
  const inputFilePath = path.join(inputDir, file);
  const outputFilePath = path.join(outputDir, file);

  // Commande FFmpeg pour normaliser le volume
  const command = `ffmpeg -i "${inputFilePath}" -filter:a loudnorm "${outputFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur lors de la normalisation de ${file}:`, error);
      return;
    }
    console.log(`Fichier normalisé : ${outputFilePath}`);
  });
});
