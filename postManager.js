
// Importation des modules
const fs = require('fs');
const path = require('path');

// Chemin du fichier posts.json
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Lire tous les posts
function getAllPosts(callback) {
    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
        if (err) {
            return callback(err, null);
        }

        try {
            const posts = JSON.parse(data);
            callback(null, posts);
        } catch (parseError) {
            callback(parseError, null);
        }
    });
}

// Obtenir un post par ID
function getPost(id, callback) {
    getAllPosts((err, posts) => {
        if (err) {
            return callback(err, null);
        }

        const post = posts.find(p => p.id === Number(id));

        if (!post) {
            return callback(null, null);
        }

        callback(null, post);
    });
}

// Insérer un nouveau post
function insertPost(newPost, callback) {
    getAllPosts((err, posts) => {
        if (err) {
            return callback(err, null);
        }

        // Générer un nouvel ID
        const newId = posts.length > 0
            ? Math.max(...posts.map(p => p.id)) + 1
            : 1;

        const post = {
            id: newId,
            userId: newPost.userId,
            title: newPost.title,
            body: newPost.body
        };

        posts.push(post);

        savePosts(posts, (err) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, post);
        });
    });
}

// Mettre à jour un post
function updatePost(id, updatedPost, callback) {
    getAllPosts((err, posts) => {
        if (err) {
            return callback(err, null);
        }

        const index = posts.findIndex(
            p => p.id === Number(id)
        );

        if (index === -1) {
            return callback(null, null);
        }

        posts[index] = {
            ...posts[index],
            ...updatedPost,
            id: Number(id)
        };

        savePosts(posts, (err) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, posts[index]);
        });
    });
}

// Supprimer un post
function deletePost(id, callback) {
    getAllPosts((err, posts) => {
        if (err) {
            return callback(err, null);
        }

        const index = posts.findIndex(
            p => p.id === Number(id)
        );

        if (index === -1) {
            return callback(null, false);
        }

        posts.splice(index, 1);

        savePosts(posts, (err) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, true);
        });
    });
}

// Fonction utilitaire pour sauvegarder les posts
function savePosts(posts, callback) {
    fs.writeFile(
        POSTS_FILE,
        JSON.stringify(posts, null, 2),
        'utf8',
        callback
    );
}

// Exporter les fonctions
module.exports = {
    getAllPosts,
    getPost,
    insertPost,
    updatePost,
    deletePost
};
