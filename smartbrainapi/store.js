const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile')
const image = require('./controllers/image')


const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors())

pgHost = process.env.PGHOST ? process.env.PGHOST : '127.0.0.1'
pgPort = process.env.PGPORT ? process.env.PGPORT : '54333'
pgDatabase = process.env.PGDATABASE ? process.env.PGDATABASE : 'smartbrain'
pgPassword = process.env.PGPASSWORD ? process.env.PGPASSWORD : 'guest'
pgUser = process.env.PGUSER ? process.env.PGUSER : 'guest'

connection = {
    host: pgHost,
    user: pgUser,
    password: pgPassword,
    database: pgDatabase,
    port: pgPort
}
const pg = knex({
    client: 'pg',
    connection: connection,
    searchPath: ['knex', 'public'],
  });

// pg.select('*').from('users').then(data => console.log(data)).catch(err => console.log(err));

// const database = {
//     users: [
//         {
//             id:'123',
//             name:'John',
//             email:'j@gmail.com',
//             password: 'c',
//             entries: 0,
//             joined: new Date()
//         },
//         {
//             id:'124',
//             name:'Sally',
//             email:'sally@gmail.com',
//             password: 'bananas',
//             entries: 0,
//             joined: new Date()
//         },
//     ]
// }

// app.get('/',(req,res) => {
//     res.status(200).send('success')
// })

app.post('/signin',(req,res) => signin.handleSignin(req,res,pg,bcrypt))


app.post('/hii',(req,res) => {
    pg.schema.raw("select rank,id from (SELECT id, entries, RANK () OVER (ORDER BY entries DESC) rank FROM users) a where id = 1")
    .then(data=> res.json(data.rows[0].rank))
})


app.post('/register',(req,res) => register.handleRegister(req,res,pg,bcrypt))

app.get('/profile/:id',(req,res,pg) => {profile.handleProfile(req,res,pg)})

app.put('/imagecount',(req,res,pg) => image.imageCount(req,res,pg))
app.put('/imagerank',(req,res,pg) => image.imageCount(req,res,pg))


// app.put('/imagerank',(req,res,pg) => image.imageRank(req,res,pg))

app.listen(5000,() => console.log('listening on port 5000'));


/* 
/ --> res = this is working
/signin --> POST = success/failure
/register --> POST = user
/profile/:userid -->  GET = user
/image --> PUT --> user
*/