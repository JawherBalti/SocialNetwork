const Joi = require('joi');

//validation des données


// création d'un nouvel utilisateur
const newUserSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(8).required()
});
exports.newUser = (req, res, next) => {
  const { error, value } = newUserSchema.validate(req.body);
  if (error) {
    res.status(422).json({ error: "Données saisies invalides" });
  } else {
    next();
  }
};

// login
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(8).required()
});
exports.login = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    res.status(422).json({ error: "email ou mot de passe invalide" });
  } else {
    next();
  }
};

// recherche d'utilisateur
const searchUserSchema = Joi.string().trim();
exports.searchUser = (req, res, next) => {
  const { error, value } = searchUserSchema.validate(req.body.firstName + " " + req.body.lastName);
  if (error) {
    res.status(422).json({ error: "Données saisies invalides" });
  } else {
    next();
  }
}

// changer le mot de passe
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().trim().min(8).required(),
  newPassword: Joi.string().trim().min(8).required()
});
exports.changePassword = (req, res, next) => {
  console.log(req.body);
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    res.status(422).json({ error: "Données saisies invalides" });
  } else {
    next();
  }
};

// changer les droits utilisateur
const adminCredentialSchema = Joi.string().valid("0", "1").required();
exports.adminCredential = (req, res, next) => {
  const { error, value } = adminCredentialSchema.validate(req.body.isAdmin);
  if (error) {
    res.status(422).json({ error: "Données saisies invalides" });
  } else {
    next();
  }
}

//  publication d'un post
const postContentSchema = Joi.string().trim();
exports.postContent = (req, res, next) => {
  // SI le content est défini : validation du content
  if (req.body.content) {
    const { error, value } = postContentSchema.validate(req.body.content);
    if (error) {
      res.status(422).json({ error: "Données saisies invalides" });
    } else {
      next();
    }
  } else if (!req.body.content && !req.file) {
    res.status(422).json({ error: "Envoyer au moins une image ou un texte !" });
  } else {
    next();
  }
};

// Lors de la publication d'un commentaire
const postId = Joi.number().integer().positive().required()
const content = Joi.string().trim().required()

exports.comment = (req, res, next) => {
  const { error, value } = content.validate(req.body.content, req.params.id);
  if (error) {
    res.status(422).json({ error: "Commentaire invalide" });
  } else {
    const { error, value } = postId.validate(req.params.id);
    if (error) {
      res.status(422).json({ error: "Commentaire invalide" });
    }
    else { next(); }
  }
};

// like/dislike
  const id = Joi.number().integer().positive().required()
  const rate = Joi.valid(-1, 1).required()

exports.like = (req, res, next) => {
  const { error, value } = rate.validate(req.body.rate);
  if (error) {
    res.status(422).json({ error: "Données d'entrée invalides" });
  } else {
    const { error, value } = id.validate(req.params.id);
    if (error) {
      res.status(422).json({ error: "Données d'entrée invalides" });
    } else {
      next();
    }
  }
};

// Vérification d'un id
const idSchema = Joi.number().integer().positive().required();
exports.id = (req, res, next) => {
  const { error, value } = idSchema.validate(req.params.id);
  if (error) {
    res.status(422).json({ error: "id invalide" });
  } else {
    next();
  }
}