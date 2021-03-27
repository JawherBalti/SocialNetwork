const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/gif': 'gif',
  'video/mp4': 'mp4'
};

const storage = multer.diskStorage({ // Configure multer
  destination: (req, file, callback) => { // préciser le dossier où enregistrer les fichiers
    callback(null, 'images');
  },
  filename: (req, file, callback) => { //obtenir le nom du fichier
    let name = file.originalname.split(' ').join('_'); // Pour éliminer les éventuelles espaces du nom d'origine
    let extension = MIME_TYPES[file.mimetype]; // Définir l'extension du fichier
    name = name.replace("." + extension, "_"); // création du nom final
    callback(null, name + Date.now() + '.' + extension); // Genère le nom complet du fichier- Nom d'origine + numero unique + . + extension
  }
});

module.exports = multer({
  storage: storage
}).single('image');
