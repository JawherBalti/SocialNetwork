require('dotenv').config();
const Cookies = require('cookies');
const cryptojs = require('crypto-js');
const database = require('../database/DB');


//seul l'utilisateur, lui-même, peut modifier sa page profil
exports.sameUser = (req, res, next) => {
  const cryptedCookie = new Cookies(req, res).get('snToken');
  const cookie = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8));
  if (req.params.id == cookie.userId) {
    next();
  } else {
    res.status(403).json({ error: 'Accès refusé' });
  }
}

// Vérifie que l'utilisateur a les droits administrateur

exports.isAdmin = (req, res, next) => {
  const connection = database.connect();
  const cryptedCookie = new Cookies(req, res).get('snToken');
  const cookie = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8));
  const userId = cookie.userId;
  const sql = "SELECT isAdmin FROM Users WHERE id=?";
  const sqlParams = [userId]
  connection.query(sql, sqlParams, (error, results, fields) => {
    if (error) {
      res.status(500).json({ "error": error.sqlMessage });
    } else {
      if (results[0].isAdmin === 1) {
        next();
      } else {
        res.status(403).json({ error: 'Accès refusé' });
      }
    }
  });
}

// Vérifier les autorisations pour la suppression d'un post
exports.deletePost = (req, res, next) => {
  const connection = database.connect();
  const cryptedCookie = new Cookies(req, res).get('snToken');
  const cookie = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8));
  const userId = cookie.userId;
  const sql = "SELECT isAdmin FROM Users WHERE id=?";
  const sqlParams = [userId];
  connection.query(sql, sqlParams, (error, results, fields) => {
    if (error) {
      res.status(500).json({ "error": error.sqlMessage });
    } else {
      if (results[0].isAdmin === 1) {
        // si l'utilisateur est administrateur
        next();
      } else {
        // sinon, vérification si c'est l'auteur du post
        const postId = req.params.id;
        const sqlPostAuthor = "SELECT user_id FROM Posts WHERE id=?";
        const sqlParamsPostAuthor = [postId];
        connection.query(sqlPostAuthor, sqlParamsPostAuthor, (error, results, fields) => {
          if (error) {
            res.status(500).json({ "error": error.sqlMessage });
          } else if (results.length === 0) {
            res.status(422).json({ "error": "Cette publication n'existe pas" });
          } else {
            const postAuthorId = results[0].user_id;
            if (postAuthorId === parseInt(userId, 10)) {
              // l'utilisateur est bien l'auteur du post
              next();
            } else {
              // l'utilisateur est ni admin, ni l'auteur du post
              res.status(403).json({ error: 'Accès refusé' });
            }
          }
        });
        connection.end();
      }
    }
  });
}

//Vérifier les autorisations pour la suppression d'un commentaire
exports.deleteComment = (req, res, next) => {
  const connection = database.connect();
  const cryptedCookie = new Cookies(req, res).get('snToken');
  const cookie = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8));
  const userId = cookie.userId;
  const sql = "SELECT isAdmin FROM Users WHERE id=?";
  const sqlParams = [userId];
  connection.query(sql, sqlParams, (error, results, fields) => {
    if (error) {
      res.status(500).json({ "error": error.sqlMessage });
    } else {
      if (results[0].isAdmin === 1) {
        // si l'utilisateur est administrateur
        connection.end();
        next();
      } else {
        // sinon, vérification si c'est l'auteur du commentaire
        const commentId = req.params.id;
        const sqlCommentAuthor = "SELECT user_id FROM Comments WHERE id=?";
        const sqlParamsCommentAuthor = [commentId];
        connection.query(sqlCommentAuthor, sqlParamsCommentAuthor, (error, results, fields) => {
          if (error) {
            res.status(500).json({ "error": error.sqlMessage });
          } else if (results.length === 0) {
            res.status(422).json({ "error": "Ce commentaire n'existe pas" });
          } else {
            const commentAuthorId = results[0].user_id;
            if (commentAuthorId === parseInt(userId, 10)) {
              // l'utilisateur est l'auteur du commentaire
              next();
            } else {
              // l'utilisateur est ni admin, ni l'auteur du commentaire
              res.status(403).json({ error: 'Accès refusé' });
            }
          }
        });
        connection.end();
      }
    }
  });
}