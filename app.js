const express = require('express');
const app = express();
const PORT = 3000;
const mariadb = require('mariadb');


const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'reservations'
});

async function connect() {
        try{
        let conn = await pool.getConnection();
        console.log('connected to database');
        return conn;
    } catch (arr) {
        console.log("Error connecting to the database: " + arr)
    }
}

app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    console.log("Hello, world - server!");
    res.render('home', {posts: [], errors: []});
});

// app.get('/confirm', (req, res) => {
//     res.send('You need to post to this page!');
// });
const posts = [];
app.post('/submit', async (req, res) => {
    const data = {
        author: req.body.author,
        title : req.body.title,
        content : req.body.content
    };  

    const conn = await connect();
    
    let isValid = true;
    let errors = [];

    let numb = data.title.length ;

    if(data.content.trim() === '') {
        isValid = false;
        errors.push("Content is Empty!")
    }
    if(data.title.trim() === '') {
        isValid = false;
        errors.push("Title is Empty!")
    }

    if(numb < 6) {
        isValid = false;
        errors.push("Title has less than 5 characters!")
    }
    if(data.author.trim() === '') {
        data.author = null;
    }
    if(!isValid) {
        res.render('home', { posts: data, errors: errors});
        return;
    } 
    await conn.query(`
        INSERT INTO posts (author, title, content)
        VALUES ('${data.author}', '${data.title}', '${data.content}');
    `);
    // posts.push(newPost);
     res.render('confirmation', { post : data});
});

app.get('/entries', async (req, res) => {

    const conn = await connect();
    const rows = await conn.query('SELECT * FROM posts ORDER BY id DESC;');
    res.render('entries', { posts : rows} );
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
});
