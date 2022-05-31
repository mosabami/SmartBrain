const express = require('express');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile')
// const image = require('./controllers/image')

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors())

const pgHost = process.env.PGHOST ? process.env.PGHOST : '127.0.0.1'
const pgPort = process.env.PGPORT ? process.env.PGPORT : '5432'
// const pgPort = process.env.PGPORT ? process.env.PGPORT : '54333'
const pgDatabase = process.env.PGDATABASE ? process.env.PGDATABASE : 'smartbrain'
const pgPassword = process.env.PGPASSWORD ? process.env.PGPASSWORD : 'guest'
const pgUser = process.env.PGUSER ? process.env.PGUSER : 'guest'
const sslFlag = process.env.SSLFLAG ? process.env.SSLFLAG : 'false'

if (sslFlag === 'false') {
  var resolvedSSL = false
} else {
  var resolvedSSL = true
}
console.log("is ssl enabled?", resolvedSSL)

const tableName = 'users'
connection = {
  host: pgHost,
  user: pgUser,
  password: pgPassword,
  database: pgDatabase,
  port: pgPort,
  ssl: resolvedSSL
}
const pg = knex({
  client: 'pg',
  connection: connection,
  searchPath: ['knex', 'public'],
});

pg.schema.hasTable(tableName).then(function (exists) {
  if (!exists) {
    return pg.schema.createTable(tableName, function (t) {
      t.increments('id').primary();
      t.string('name', 100);
      t.text('email').unique().notNullable();
      t.integer('entries').defaultTo(0);
      t.timestamp('joined', { precision: 6 }).defaultTo(pg.fn.now(6));
    });
  }
});

pg.schema.hasTable('login').then(function (exists) {
  if (!exists) {
    return pg.schema.createTable('login', function (t) {
      t.increments('id').primary();
      t.string('hash', 1000);
      t.text('email').unique().notNullable();
    });
  }
});

app.post('/api/signin', (req, res) => signin.handleSignin(req, res, pg))

app.post('/api/register', (req, res) => register.handleRegister(req, res,  pg))

app.get('/api/profile/:id', (req, res, pg) => { profile.handleProfile(req, res, pg) })

app.put('/api/imagecount', (req, res) => {
  const { id } = req.body
  pg(tableName).where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entry => res.json(entry[0]))
    .catch(err => res.status(400).json('could not get entries'))
})

app.put('/api/imagerank', (req, res) => {
  const { id } = req.body
  pg(tableName).where('id', '=', id).then(data => console.log(data))
  pg.schema.raw(`select rank,id from (SELECT id, entries, RANK () OVER (ORDER BY entries DESC) rank FROM ${tableName}) a where id = ${id}`)
    .then(data => res.json(data.rows[0].rank))
    .catch(err => res.status(400).json('could not get rank'))
})

app.put('/api/getbbox', (req, res) => { calculateFaceLocation2(req, res) })
app.get('/', (req, res) => { res.send('ok') })
app.get('/api', (req, res) => { res.send("okay \r\n") })
app.listen(5000, () => console.log('listening on port 5000'));