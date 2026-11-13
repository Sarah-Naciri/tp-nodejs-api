const https = require('https');
const fs = require('fs');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Récupérer les posts depuis l'API
function fetchPosts() {
    https.get(API_URL, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const posts = JSON.parse(data);
                savePosts(posts);
            } catch (error) {
                console.log('Erreur de conversion JSON :', error.message);
            }
        });

    }).on('error', (error) => {
        console.log('Erreur de connexion :', error.message);
    });
}

// Sauvegarder les posts dans posts.json
function savePosts(posts) {
    fs.writeFile('posts.json', JSON.stringify(posts, null, 2), (err) => {
        if (err) {
            console.log('Erreur de sauvegarde :', err.message);
        } else {
            console.log('Les posts ont été sauvegardés avec succès !');
        }
    });
}

// Exécuter le script
fetchPosts();