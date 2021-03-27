require('dotenv').config();
const Cookies = require('cookies');
const cryptojs = require('crypto-js');
const database = require('../database/DB');
const fs = require("fs");

//créer un post
const newPost = (req, res, next) => {
  const connection = database.connect();
  //obtenir le cookie de l'utilisateur
  const cryptedCookie = new Cookies(req, res).get('snToken');
  //extraire l'id de l'utilisateur
  const userId = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8)).userId
  const imageurl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
  const content = req.body.content ? req.body.content : null;

  const sql = "INSERT INTO Posts (user_id, imageurl, content)\
  VALUES (?, ?, ?);";
  const sqlParams = [userId, imageurl, content];

  connection.query(sql, sqlParams, (error, results, fields) => {
    if (error) {
      res.status(500).json({ "error": error.sqlMessage });
    } else {
      res.status(201).json({ message: 'Publication ajoutée' });
    }
  });
  connection.end();
}

//obtenir toutes les publications
const getAllPosts = (req, res, next) => {
  const connection = database.connect();
  //obtenir la publication et l'utilisateur qui l'a crée
  const sql = "SELECT Posts.id AS id, Posts.publication_date AS publication_date, Posts.imageurl AS imageurl, Posts.content as content, Users.id AS user_id, Users.firstName AS firstName, Users.lastName AS lastName, Users.pictureurl AS pictureurl\
    FROM Posts\
    INNER JOIN Users ON Posts.user_id = Users.id\
    ORDER BY publication_date DESC";
  connection.query(sql, (error, rawPosts, fields) => {
    if (error) {
      connection.end();
      res.status(500).json({ "error": error.sqlMessage });
    } else {
      // Pour chaque post, on rajoute les likes/dislikes
      const cryptedCookie = new Cookies(req, res).get('snToken');
      const userId = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8)).userId;
      this.getLikesOfEachPost(rawPosts, userId, connection)
        .then(posts => {
          res.status(200).json({ posts });
        })
        .catch(err => {
          res.status(500).json({ "error": "Un problème est survenu" });
        })
    }
  });
}

//supprimer une publication
const deletePost = (req, res, next) => {
  const connection = database.connect()
  const postID = req.params.id
  const cryptedCookie = new Cookies(req, res).get('snToken')
  const userId = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8)).userId

  const sqlSelectPost = "SELECT imageurl FROM Posts WHERE id = ?"
  connection.query(sqlSelectPost, [postID], function (err, result) {
    if (result[0].imageurl !== null) { // si la publication contient une image
      const filename = result[0].imageurl.split("/images/")[1]
      fs.unlink(`images/${filename}`, () => { // On supprime l'image
        const sqlDeletePost = "DELETE FROM Posts WHERE user_id = ? AND id = ?"
        connection.query(sqlDeletePost, [userId, postID], function (err, result) {
          if (err) {
            return res.status(500).json(err.message)
          }
          res.status(200).json({ message: "Post supprimé !" })
        })
      })
    } else { //s'il n'y a pas une image dans la publication
      sqlDeletePost = "DELETE FROM Posts WHERE user_id = ? AND id = ?"
      connection.query(sqlDeletePost, [userId, postID], function (err, result) {
        if (err) {
          return res.status(500).json(err.message)
        }
        res.status(200).json({ message: "Post supprimé !" })
      });
    }
    if (err) {
      return res.status(500).json(err.message)
    }
  })
}

//liker la publication
const likePost = (req, res, next) => {
  const connection = database.connect()
  const cryptedCookie = new Cookies(req, res).get('snToken');

  const userId = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8)).userId;
  const postId = req.params.id
  const rate = req.body.rate //réaction de l'utilisateur (rate = 1 pour un like, rate = -1 pour un dislike)

  // obtenir la réaction d'un utilisateur sur une publication
  const sql = "SELECT * FROM Likes WHERE (post_id = ? AND user_id = ?)"
  const sqlParams = [postId, userId]
  connection.query(sql, sqlParams, function (err, result) {
    if (err) {
      return res.status(500).json(err.message);
    }
    if (result.length == 0) {
      // si la publication n'a pas de réaction par un utilisateur
      const sqlLike = "INSERT INTO Likes (rate, user_id, post_id)\
      VALUES (?, ?, ?);";
      const sqlLikeParams = [rate, userId, postId];
      connection.query(sqlLike, sqlLikeParams, (error, results, fields) => {
        if (error) {
          res.status(500).json({ "error": error.sqlMessage });
        } else {
          res.status(201).json({ message: 'Vous avez réagi à cette publication' });
        }
      });
    }
    else if (result[0].rate === -1) { //si l'utilisateur a réagit déjà par un dislike, on annule le dislike
      const sqlRemoveLike = "UPDATE Likes SET rate=? WHERE post_id = ? AND user_id = ?"
      const sqlRemoveParams = [rate, postId, userId]
      connection.query(sqlRemoveLike, sqlRemoveParams, function (err, result) {
        if (err) {
          return res.status(500).json(err.message);
        }
        res.status(200).json({ message: "Vous avez annulé la reaction!" });
      });
    }
    else if (result[0].rate === 1) { //si l'utilisateur a réagit déjà par un like, on annule le like
      const sqlRemoveLike = "DELETE FROM Likes WHERE post_id = ? AND user_id = ?"
      const sqlRemoveParams = [postId, userId]
      connection.query(sqlRemoveLike, sqlRemoveParams, function (err, result) {
        if (err) {
          return res.status(500).json(err.message);
        }
        res.status(200).json({ message: "Vous avez annulé la reaction!" });
      });
    }
  })
}

//disliker la publication (même raisonnement que likePost)
const dislikePost = (req, res, next) => {
  const connection = database.connect()
  const cryptedCookie = new Cookies(req, res).get('snToken');

  const userId = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8)).userId;
  const postId = req.params.id
  const rate = req.body.rate

  const sql = "SELECT * FROM Likes WHERE (post_id = ? AND user_id = ?)"
  const sqlParams = [postId, userId]
  connection.query(sql, sqlParams, function (err, result) {
    if (err) {
      return res.status(500).json(err.message);
    }
    if (result.length == 0) {
      const sqlLike = "INSERT INTO Likes (rate, user_id, post_id)\
      VALUES (?, ?, ?);";
      const sqlLikeParams = [rate, userId, postId];
      connection.query(sqlLike, sqlLikeParams, (error, results, fields) => {
        if (error) {
          res.status(500).json({ "error": error.sqlMessage });
        } else {
          res.status(201).json({ message: 'Vous avez réagi à cette publication' });
        }
      });
    }
    else if (result[0].rate === 1) {
      const sqlRemoveLike = "UPDATE Likes SET rate=? WHERE post_id = ? AND user_id = ?"
      const sqlRemoveParams = [rate, postId, userId]
      connection.query(sqlRemoveLike, sqlRemoveParams, function (err, result) {
        if (err) {
          return res.status(500).json(err.message);
        }
        res.status(200).json({ message: "Vous avez annulé la reaction!" });
      });
    }
    else if (result[0].rate === -1) {
      const sqlRemoveLike = "DELETE FROM Likes WHERE post_id = ? AND user_id = ?"
      const sqlRemoveParams = [postId, userId]
      connection.query(sqlRemoveLike, sqlRemoveParams, function (err, result) {
        if (err) {
          return res.status(500).json(err.message);
        }
        res.status(200).json({ message: "Vous avez annulé la reaction!" });
      });
    }
  })
}

exports.getLikesOfEachPost = (posts, userId, connection) => {
  return Promise.all(posts.map(post => {
    const postId = post.id;
    const sql = "SELECT\
                  (SELECT COUNT(*) FROM Likes WHERE (post_id=? AND rate=1)) AS LikesNumber,\
                  (SELECT COUNT(*) FROM Likes WHERE (post_id=? AND rate=-1)) AS DislikesNumber,\
                  (SELECT rate FROM Likes WHERE (post_id=? AND user_id=?)) AS currentUserReaction";
    const sqlParams = [postId, postId, postId, userId];
    return new Promise((resolve, reject) => {
      connection.query(sql, sqlParams, (error, result, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve({ ...post, likes: result[0] });
        }
      });
    })
  }));
}

module.exports = { getAllPosts, newPost, deletePost, likePost, dislikePost }