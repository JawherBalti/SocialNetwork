require('dotenv').config();
const Cookies = require('cookies');
const cryptojs = require('crypto-js');
const database = require('../database/DB');

//créer un commentaire
const createComment = (req, res, next) => {
    const connection = database.connect();
    //obtenir l'id de l'utilisateur à partir de son cookie
    const cryptedCookie = new Cookies(req, res).get('snToken');
    const userId = JSON.parse(cryptojs.AES.decrypt(cryptedCookie, process.env.COOKIE_KEY).toString(cryptojs.enc.Utf8)).userId;
    const postId = req.params.id;
    const content = req.body.content;

    const sqlCreateComment = "INSERT INTO comments (content, user_id, post_id)\ VALUES (?, ?, ?)";
    const params = [content, userId, postId];
    connection.query(sqlCreateComment, params, function (err, result) {
        if (err) {
            return res.status(500).json(err.message);
        }
        res.status(201).json({ message: "Commentaire crée !" });
    });
}

//obtenir tous les commentaires d'une publication
const getCommentsofPost = (req, res, next) => {
    const connection = database.connect();
    const postId = req.params.id;
    const sql = "SELECT Comments.id AS Commentid, Comments.publication_date AS publication_date, Comments.content As content, Comments.post_id As post_id, Users.id AS userId, Users.firstName AS firstName, Users.lastName AS lastName, Users.pictureurl AS pictureurl\
    FROM Comments\
    INNER JOIN Users ON Comments.user_id = Users.id\
    WHERE Comments.post_id = ?\
    ORDER BY publication_date DESC";
    const sqlParams = [postId];

    connection.query(sql, sqlParams, (error, comments, fields) => {
        if (error) {
            res.status(500).json({ "error": error.sqlMessage });
        } else {
            res.status(200).json({ comments });
        }
    });
    connection.end();
}

//supprimer uncommentaire
const deleteComment = (req, res, next) => {
    const connection = database.connect();
    const commentId = req.params.id

    const sql = "DELETE FROM Comments WHERE id = ?"
    const sqlParams = [commentId]
    connection.query(sql, sqlParams, function (err, result) {
        if (err) {
            return res.status(500).json(err.message);
        }
        res.status(200).json({ message: "Commentaire supprimé !" });
    });
}

//supprimer tous les commentaires
const deleteAllComments = (req, res, next) => {
    const connection = database.connect();
    const postId = req.params.id

    const sql = "DELETE FROM Comments WHERE post_id = ?"
    const sqlParams = [postId]
    connection.query(sql, sqlParams, function (err, result) {
        if (err) {
            return res.status(500).json(err.message);
        }
        res.status(200).json({ message: "Commentaires supprimés !" });
    });
}

module.exports = { createComment, getCommentsofPost, deleteComment, deleteAllComments }