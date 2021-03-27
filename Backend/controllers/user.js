require('dotenv').config()
const bcrypt = require('bcrypt')
const cryptojs = require('crypto-js')
const jwt = require('jsonwebtoken')
const Cookies = require('cookies')
const fs = require("fs") // Permet de gérer les fichiers stockés
const database = require('../database/DB')

//créer un compte
const registerUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const connection = database.connect()

      // Cryptage et échappement des données utilisateurs
      const firstName = req.body.firstName
      const lastName = req.body.lastName
      const email = cryptojs.HmacSHA256(req.body.email, process.env.EMAIL_KEY).toString()
      const password = cryptojs.AES.encrypt(hash, process.env.SECRET).toString()
      const pictureurl = `${req.protocol}://${req.get("host")}/images/default.png`
      let isAdmin

      // S'il n'y a aucun utilisateur, le premier utilisateur sera admin
      const sqlNumberOfUsers = "SELECT COUNT(*) AS numberOfUsers FROM Users;"

      connection.query(sqlNumberOfUsers, (error, result, fields) => {
        if (error) {
          connection.end()
          res.status(500).json({ "error": error.sqlMessage })
        } else {
          if (result[0].numberOfUsers === 0) {
            isAdmin = 1
          } else {
            isAdmin = 0
          }

          // Ajout de l'utilisateur à la table Users
          const sqlInsertUser = "\
            INSERT INTO Users (firstName, lastName, email, password, pictureurl, isadmin)\
            VALUES (?, ?, ?, ?, ?, ?);"
          const sqlParams = [firstName, lastName, email, password, pictureurl, isAdmin]
          connection.query(sqlInsertUser, sqlParams, (error, results, fields) => {
            if (error) {
              if (error.errno === 1062) { // ERREUR : email déjà utilisé dans la base
                res.status(403).json({ "error": "L'email est déjà utilisé !" })
              } else { // Autre erreur SQL
                res.status(500).json({ "error": error.sqlMessage })
              }
            } else { // Pas d'erreur : utilisateur ajouté
              res.status(201).json({ message: 'Utilisateur créé' })
            }
          })
          connection.end()
        }
      })
    })
    .catch(error => res.status(500).json({ error }))
}

//se connecter
const login = (req, res, next) => {
  const connection = database.connect()
  // Cryptage de l'email
  const researchedEmail = cryptojs.HmacSHA256(req.body.email, process.env.EMAIL_KEY).toString()
  // Chercher un utilisateur avec son email (crypté)
  const sql = "SELECT id, firstName, lastName, email, password, pictureurl, isadmin FROM Users WHERE email= ?"
  const sqlParams = [researchedEmail]
  connection.query(sql, sqlParams, (error, results, fields) => {
    if (error) {
      res.status(500).json({ "error": error.sqlMessage })

    } else if (results.length == 0) {
      res.status(401).json({ error: 'Ce compte n\'existe pas' })

      //Si on trouve un utilisateur
    } else {
      //Décryptage du mot de passe stocké dans la base de données
      const matchingHash = cryptojs.AES.decrypt(results[0].password, process.env.SECRET).toString(cryptojs.enc.Utf8)
      //comparer le mot de passe dans la base et le mot de passe entré par l'utilisateur
      bcrypt.compare(req.body.password, matchingHash)
        .then(valid => {
          //si les mot de passe sont differents
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect!' });
          }
          //sinon on crée un token
          const newToken = jwt.sign(
            { userId: results[0].id },
            process.env.JWT_TOKEN,
            { expiresIn: '24h' }
          )

          // Envoi du token & userId dans un cookie
          const cookieContent = {
            token: newToken,
            userId: results[0].id
          }
          //cryptage du cookie
          const cryptedCookie = cryptojs.AES.encrypt(JSON.stringify(cookieContent), process.env.COOKIE_KEY).toString();
          new Cookies(req, res).set('snToken', cryptedCookie, {
            httpOnly: true,
            maxAge: 3600000  // cookie pendant 1 heure (en millisecondes)
          })

          res.status(200).json({
            message: 'Utilisateur connecté',
            userId: results[0].id,
            firstName: results[0].firstName,
            lastName: results[0].lastName,
            pictureurl: results[0].pictureurl,
            isAdmin: results[0].isadmin,
            cryptedCookie
          })
        })
        .catch(error => res.status(500).json({ error }))
    }
  })
  connection.end()
}

//se deconnecter
const logout = (req, res, next) => {
  // on remplace le cookie par un vide
  new Cookies(req, res).set('snToken', "", {
    httpOnly: true,
    maxAge: 1  // suppression instantannée (1 milliseconde)
  })
  res.status(200).json({ message: "utilisateur déconnecté" })
}

//obtenir tous les utilisateurs
const getAllUsers = (req, res, next) => {
  const connection = database.connect()
  const sql = "SELECT id, firstName, lastName, pictureurl, isAdmin FROM Users;"
  connection.query(sql, (error, users, fields) => {
    if (error) {
      res.status(500).json({ "error": error.sqlMessage })
    } else {
      res.status(200).json({ users })
    }
  });
  connection.end()
}

//obtenir un seul utilisateur
const getOneUser = (req, res, next) => {
  const connection = database.connect()
  const searchId = req.params.id
  //Chercher un utilisateur par son id
  const sql = "SELECT id, firstName, lastName, email, pictureurl, isadmin FROM Users WHERE id=?"
  const sqlParams = [searchId]
  connection.query(sql, sqlParams, (error, results, fields) => {
    
    if (error) {
      res.status(500).json({ "error": error.sqlMessage })

    } else if (results.length === 0) {
      res.status(401).json({ error: 'utilisateur n\'existe pas' })

    } else {
      res.status(200).json({
        id: results[0].id,
        firstName: results[0].firstName,
        lastName: results[0].lastName,
        email: results[0].email,
        pictureurl: results[0].pictureurl,
        isadmin: results[0].isadmin
      })
    }
  })
  connection.end()
}

//obtenir l'utilisateur actuel
const getCurrentUser = (req, res, next) => {
  const connection = database.connect()
  // obtenir le cookie de l'utilisateur
  const cryptedCookie = new Cookies(req, res).get('snToken')
  // décryptage du cookie
  let cookie = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8))
  // obtenir l'id de l'utilisateur
  const searchId = cookie.userId
  //chercher l'utlisateur par son id
  const sql = "SELECT id, firstName, lastName, pictureurl, isadmin FROM Users WHERE id=?"
  const sqlParams = [searchId]
  connection.query(sql, sqlParams, (error, results, fields) => {

    if (error) {
      res.status(500).json({ "error": error.sqlMessage })

    } else if (results.length === 0) {
      res.status(401).json({ error: 'Cet utilisateur n\'existe pas' })

    } else {
      res.status(200).json({
        userId: results[0].id,
        firstName: results[0].firstName,
        lastName: results[0].lastName,
        pictureurl: results[0].pictureurl,
        isAdmin: results[0].isadmin
      })
    }
  })
  connection.end()
}

//changer le role de l'utilisateur
const changeAdmin = (req, res, next) => {
  const connection = database.connect()
  const userId = req.params.id
  const isAdmin = req.body.isAdmin

  // choisir le role de l'utilisateur qu'on veut changer
  let sqlSelectUser = "SELECT isAdmin FROM Users WHERE id = ?"
  // compter le nombre d'admins
  let sqlNumberOfAdmins = "SELECT COUNT(*) AS numberOfAdmins FROM Users WHERE isAdmin = 1;"
  //mettre à jour le role de l'utilisateur
  let sql = "UPDATE Users SET isAdmin=? WHERE id=?"
  const sqlParams = [isAdmin, userId]

  connection.query(sqlSelectUser, [userId], function (err, result) {
    //l'utilisateur choisi est admin
    if (result[0].isAdmin == 1) {
      connection.query(sqlNumberOfAdmins, function (err, result) {
        //s'il y a un seul admin (il faut avoir au moins un admin)
        if (result[0].numberOfAdmins == 1) {
          return res.status(400).json("Suppression échouée")
        }
        else {
          connection.query(sql, sqlParams, (error, results, fields) => {
            if (error) {
              res.status(500).json({ "error": error.sqlMessage })
            } else {
              res.status(201).json({ message: 'Droits d\'administrateur modifiée' })
            }
          })
        }
      })
    }
    else { //l'utilisateur choisi est un simple utilisateur
      connection.query(sql, sqlParams, (error, results, fields) => {
        if (error) {
          res.status(500).json({ "error": error.sqlMessage })
        } else {
          res.status(201).json({ message: 'Droits d\'administrateur modifiée' })
        }
      })
      connection.end()
    }
  })
}

//supprimer un compte par un admin
const adminDeleteAccount = (req, res, next) => {
  const connection = database.connect()
  const userId = req.params.id

  //choisir un utilisateur par son id
  let sqlSelectUser = "SELECT isAdmin FROM Users WHERE id = ?"
  //obtenir le nombre d'admins
  let sqlNumberOfAdmins = "SELECT COUNT(*) AS numberOfAdmins FROM Users WHERE isAdmin = 1;"
  //supprimer un utilisateur
  let sqlDeleteUser = `DELETE FROM Users WHERE id = ?`
  //supprimer les posts de l'utilisateur
  let sqlDeletePost = "DELETE FROM Posts WHERE user_id = ?"
  //supprimer les commentaires de l'utilisateur
  let sqlDeleteComment = "DELETE FROM Comments WHERE user_id = ?"

  connection.query(sqlSelectUser, [userId], function (err, result) {
    //si l'utilisateur est admin
    if (result[0].isAdmin == 1) {
      connection.query(sqlNumberOfAdmins, function (err, result) {
        //s'il y a un seul admin
        if (result[0].numberOfAdmins == 1) {
          return res.status(400).json("Suppression échouée")
        }
        else {
          //sinon on supprime l'utilisateur, ces posts et ces commentaires
          connection.query(sqlDeleteUser, [userId], function (err, result) {
            if (err) {
              return res.status(500).json(err.message);
            }
            if (result.affectedRows == 0) {
              return res.status(400).json({ message: "Suppression échouée" });
            }
            connection.query(sqlDeletePost, [userId], function (err, results) {
              if (err) {
                return res.status(500).json(err.message)
              }
              connection.query(sqlDeleteComment, [userId], function (err, result) {
                if (err) {
                  return res.status(500).json(err.message)
                }
                res.status(200).json({ message: "Utilisateur supprimé !" })
              })
            })
          })
        }
      })
    }
    else { //si l'utilisateur est un simple utilisateur
      connection.query(sqlDeleteUser, [userId], function (err, result) {
        if (err) {
          return res.status(500).json(err.message);
        }
        if (result.affectedRows == 0) {
          return res.status(400).json({ message: "Suppression échouée" });
        }
        connection.query(sqlDeletePost, [userId], function (err, results) {
          if (err) {
            return res.status(500).json(err.message)
          }
          connection.query(sqlDeleteComment, [userId], function (err, result) {
            if (err) {
              return res.status(500).json(err.message)
            }
            res.status(200).json({ message: "Utilisateur supprimé !" })
          })
        })
      })
    }
  })
}

//supprimer son propre compte
const deleteAccount = (req, res, next) => {
  const connection = database.connect()
  const password = req.body.password
  const userId = req.params.id

  //obtenir le mot de passe et la photo de profil de l'utilisateur
  let sqlFindUser = "SELECT password, pictureurl FROM Users WHERE id = ?"
  connection.query(sqlFindUser, [userId], function (err, result) {
    if (err) {
      return res.status(500).json(err.message)
    }
    if (result.length == 0) {
      return res.status(401).json({ error: "Utilisateur non trouvé !" })
    }
    const filename = result[0].pictureurl.split("/images/")[1]

    //decryptage du mot de passe dans la base de données
    const plainPassword = cryptojs.AES.decrypt(result[0].password, process.env.SECRET).toString(cryptojs.enc.Utf8)

    //comparer le mot de passe dans la base et le mot de passe entrée par l'utilisateur
    bcrypt.compare(password, plainPassword)
      .then(valid => {
        if (!valid) {
          return res.status(401).json({ error: "Mot de passe incorrect !" });
        }
        if (filename !== "default.png") {
          fs.unlink(`images/${filename}`, (e) => { // On supprime l'image
            if (e) {
              console.log(e)
            }
          })
        }
        //supprimer l'utilisateur
        let sqlDeleteUser = "DELETE FROM Users WHERE id = ?"
        connection.query(sqlDeleteUser, [userId], function (err, result) {
          if (err) {
            return res.status(500).json(err.message);
          }
          if (result.affectedRows == 0) {
            return res.status(400).json({ message: "Suppression échouée" })
          }
          res.status(200).json({ message: "Utilisateur supprimé !" })
        })
      })
      .catch(e => res.status(500).json(e))
  })
}

//mettre à jour les informations de l'utilisateur
const updateUser = (req, res, next) => {
  const connection = database.connect();
  const userId = req.params.id;
  const firstName = req.body.firstName
  const lastName = req.body.lastName

  let sqlFindUser
  let sqlModifyUser
  let values

  if (req.file) { // Si le changement concerne la photo du profil
    const pictureurl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`

    sqlFindUser = "SELECT pictureurl FROM Users WHERE id = ?";
    connection.query(sqlFindUser, [userId], function (err, result) {
      if (err) {
        return res.status(500).json(err.message)
      }

      const filename = result[0].pictureurl.split("/images/")[1];
      sqlModifyUser = "UPDATE Users SET pictureurl = ? WHERE id = ?"
      if (filename !== "default.png") {
        fs.unlink(`images/${filename}`, () => { // On supprime le fichier image en amont
          connection.query(sqlModifyUser, [pictureurl, userId], function (err, result) {
            if (err) {
              return res.status(500).json(err.message)
            }
            return res.status(200).json({ message: "Utilisateur modifé !" })
          });
        });
      } else {
        connection.query(sqlModifyUser, [pictureurl, userId], function (err, result) {
          if (err) {
            return res.status(500).json(err.message);
          }
          return res.status(200).json({ message: "Utilisateur modifé !" });
        });
      }
    });
  }
  else { //Si le changement concerne le prénom et le nom
    sqlModifyUser = "UPDATE Users SET firstName=?, lastName=? WHERE id = ?";
    values = [firstName, lastName, userId];
    connection.query(sqlModifyUser, values, function (err, result) {
      if (err) {
        return res.status(500).json(err.message);
      }
      if (result.affectedRows == 0) {
        return res.status(400).json({ message: "Changement échoué !" });
      }
      res.status(200).json({ message: "Changement réussi !" });
    });
  }
};

//changer le mot de passe
const changePassword = (req, res, next) => {
  const connection = database.connect();
  const searchId = req.params.id;
  const sql = "SELECT password FROM Users WHERE id=?";
  const sqlParams = [searchId];
  connection.query(sql, sqlParams, (error, results, fields) => {
    if (error) {
      res.status(500).json({ "error": error.sqlMessage });
      connection.end();
    } else {
      // Vérification que l'ancien mot de passe soit correct
      const DBPasswordHash = cryptojs.AES.decrypt(results[0].password, process.env.SECRET).toString(cryptojs.enc.Utf8);
      bcrypt.compare(req.body.oldPassword, DBPasswordHash)
        .then(valid => {
          if (!valid) {
            connection.end();
            return res.status(401).json({ error: 'Ancien mot de passe incorrect!' });
          }
          // L'ancien mot de passe est correct, donc mise à jour du mot de passe :
          bcrypt.hash(req.body.newPassword, 10)
            .then(hash => {
              const newPassword = cryptojs.AES.encrypt(hash, process.env.SECRET).toString();
              const sql2 = "UPDATE Users SET password=? WHERE id=?";
              const sqlParams2 = [newPassword, searchId];
              connection.query(sql2, sqlParams2, (error, results, fields) => {
                if (error) {
                  connection.end();
                  res.status(500).json({ "error": error.sqlMessage });
                } else {
                  connection.end();
                  res.status(201).json({ message: 'Mot de passe modifié' });
                }
              })
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    }
  });
}

module.exports = { registerUser, login, logout, getAllUsers, getOneUser, getCurrentUser, changePassword, changeAdmin, adminDeleteAccount, deleteAccount, updateUser }