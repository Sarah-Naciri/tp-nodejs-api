
const http = require('http');
const postManager = require('./postManager');

const PORT = 3000;

// Fonction pour lire le corps JSON d'une requête
function parseJsonBody(request, callback) {
    let body = '';

    request.on('data', chunk => {
        body += chunk.toString();
    });

    request.on('end', () => {
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    });
}

// Création du serveur
const server = http.createServer((request, response) => {

    // Récupération de l'URL et de la méthode HTTP
    const parsedUrl = new URL(request.url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const method = request.method;

    // Configuration CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    // Gestion des requêtes OPTIONS
    if (method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    // Réponse JSON
    response.setHeader('Content-Type', 'application/json; charset=utf-8');

    // ---------------------------------------
    // ROUTE D'ACCUEIL
    // GET /
    // ---------------------------------------
    if (pathname === '/' && method === 'GET') {
        response.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        response.end(`
            <h1>Bienvenue sur mon API REST Node.js</h1>
            <p>Le serveur fonctionne correctement !</p>
            <h2>Routes disponibles :</h2>
            <ul>
                <li>GET /api/posts</li>
                <li>GET /api/posts/1</li>
                <li>POST /api/posts</li>
                <li>PUT /api/posts/1</li>
                <li>DELETE /api/posts/1</li>
            </ul>
        `);

        return;
    }

    // ---------------------------------------
    // GET /api/posts
    // Récupérer tous les posts
    // ---------------------------------------
    if (pathname === '/api/posts' && method === 'GET') {

        postManager.getAllPosts((error, posts) => {

            if (error) {
                response.writeHead(500);
                response.end(JSON.stringify({
                    error: 'Erreur lors de la récupération des posts'
                }));
                return;
            }

            response.writeHead(200);
            response.end(JSON.stringify(posts));
        });

        return;
    }

    // ---------------------------------------
    // GET /api/posts/:id
    // Récupérer un post par son ID
    // ---------------------------------------
    if (pathname.startsWith('/api/posts/') && method === 'GET') {

        const id = parseInt(pathname.split('/')[3]);

        if (isNaN(id)) {
            response.writeHead(400);
            response.end(JSON.stringify({
                error: 'ID invalide'
            }));
            return;
        }

        postManager.getPost(id, (error, post) => {

            if (error) {
                response.writeHead(500);
                response.end(JSON.stringify({
                    error: 'Erreur lors de la récupération du post'
                }));
                return;
            }

            if (!post) {
                response.writeHead(404);
                response.end(JSON.stringify({
                    error: 'Post non trouvé'
                }));
                return;
            }

            response.writeHead(200);
            response.end(JSON.stringify(post));
        });

        return;
    }

    // ---------------------------------------
    // POST /api/posts
    // Ajouter un nouveau post
    // ---------------------------------------
    if (pathname === '/api/posts' && method === 'POST') {

        parseJsonBody(request, (error, data) => {

            if (error) {
                response.writeHead(400);
                response.end(JSON.stringify({
                    error: 'JSON invalide'
                }));
                return;
            }

            if (!data.title || !data.body) {
                response.writeHead(400);
                response.end(JSON.stringify({
                    error: 'Le titre et le contenu sont obligatoires'
                }));
                return;
            }

            postManager.insertPost(data, (error, newPost) => {

                if (error) {
                    response.writeHead(500);
                    response.end(JSON.stringify({
                        error: 'Erreur lors de l’ajout du post'
                    }));
                    return;
                }

                response.writeHead(201);
                response.end(JSON.stringify({
                    message: 'Post ajouté avec succès',
                    post: newPost
                }));
            });
        });

        return;
    }

    // ---------------------------------------
    // PUT /api/posts/:id
    // Modifier un post
    // ---------------------------------------
    if (pathname.startsWith('/api/posts/') && method === 'PUT') {

        const id = parseInt(pathname.split('/')[3]);

        if (isNaN(id)) {
            response.writeHead(400);
            response.end(JSON.stringify({
                error: 'ID invalide'
            }));
            return;
        }

        parseJsonBody(request, (error, data) => {

            if (error) {
                response.writeHead(400);
                response.end(JSON.stringify({
                    error: 'JSON invalide'
                }));
                return;
            }

            postManager.updatePost(id, data, (error, updatedPost) => {

                if (error) {
                    response.writeHead(500);
                    response.end(JSON.stringify({
                        error: 'Erreur lors de la modification'
                    }));
                    return;
                }

                if (!updatedPost) {
                    response.writeHead(404);
                    response.end(JSON.stringify({
                        error: 'Post non trouvé'
                    }));
                    return;
                }

                response.writeHead(200);
                response.end(JSON.stringify({
                    message: 'Post modifié avec succès',
                    post: updatedPost
                }));
            });
        });

        return;
    }

    // ---------------------------------------
    // DELETE /api/posts/:id
    // Supprimer un post
    // ---------------------------------------
    if (pathname.startsWith('/api/posts/') && method === 'DELETE') {

        const id = parseInt(pathname.split('/')[3]);

        if (isNaN(id)) {
            response.writeHead(400);
            response.end(JSON.stringify({
                error: 'ID invalide'
            }));
            return;
        }

        postManager.deletePost(id, (error, deletedPost) => {

            if (error) {
                response.writeHead(500);
                response.end(JSON.stringify({
                    error: 'Erreur lors de la suppression'
                }));
                return;
            }

            if (!deletedPost) {
                response.writeHead(404);
                response.end(JSON.stringify({
                    error: 'Post non trouvé'
                }));
                return;
            }

            response.writeHead(200);
            response.end(JSON.stringify({
                message: 'Post supprimé avec succès',
                post: deletedPost
            }));
        });

        return;
    }

    // ---------------------------------------
    // ROUTE NON TROUVÉE
    // ---------------------------------------
    response.writeHead(404);
    response.end(JSON.stringify({
        error: 'Route non trouvée'
    }));

});

// Démarrage du serveur
server.listen(PORT, () => {

    console.log(`Serveur API démarré sur http://localhost:${PORT}`);

    console.log('Routes disponibles :');
    console.log('GET    /');
    console.log('GET    /api/posts');
    console.log('GET    /api/posts/:id');
    console.log('POST   /api/posts');
    console.log('PUT    /api/posts/:id');
    console.log('DELETE /api/posts/:id');

});
