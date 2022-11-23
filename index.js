// JWT
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
var { expressjwt: expressJWT } = require("express-jwt");
const cors = require('cors');
const crypto = require('crypto');
const CHAVE = 'dfg5d4gfr56sdf4g5dfs64bsgh546sdf'; // 32
const IV = "5183666c72eec9e4"; // 16
const ALGORITMO = "aes-256-cbc";
const METODO_CRIPTOGRAFIA = 'hex';
const METODO_DESCRIPTOGRAFIA = 'hex';
const express = require('express');
const { usuario } = require('./models');

const encrypt = ((text) =>  {
  let cipher = crypto.createCipheriv(ALGORITMO, CHAVE, IV);
  let encrypted = cipher.update(text, 'utf8', METODO_CRIPTOGRAFIA);
  encrypted += cipher.final(METODO_CRIPTOGRAFIA);
  return encrypted; 
});


const app = express();

var cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(cookieParser());
app.use(
  expressJWT({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    getToken: req => req.cookies.token
  }).unless({ path: ["/","/deslogar", "/sobre", "/autenticar", "/logar"] }) //rotas que não passam pela autenticação
);
app.get('/sobre', async function(req, res){
  res.render('sobre');
})
app.get('/listar', async function(req, res){
  const usuarios = await usuario.findAll();
  //res.render("cadastrar", {usuarios}); 
  res.json(usuarios);

})
app.get('/autenticar', async function(req, res){
  res.render('autenticar');
})
app.get('/cadastrar', async function(req, res){
  res.render('cadastrar');
})
app.get('/', async function(req, res){
  res.render("home")
})

app.post('/logar', (req, res) => {
  const encrypted = encrypt(req.body.password);
  console.log(encrypted);

  if(req.body.user === 'giulai' && req.body.password === '2402'){
    const id = 1;
    const token = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 3600 // expires in 1h equivale
    });

    res.cookie('token', token, { httpOnly: true });
    return res.json({ auth: true, token: token });
  }

  res.status(500).json({message: 'Login inválido!'});
})

app.post('/deslogar', function(req, res) {
  res.cookie('token', null, { httpOnly: true });
  res.json({deslogado: true})
})
app.post('/cadastrar', async function(req, res) {
  const usuario1 = await usuario.create({
    nome:req.body.nome,
    user:req.body.usuario,
    password:encrypt(req.body.senha)
  })

  res.json(usuario1)
})

app.listen(3001, function() {
  console.log('App de Exemplo escutando na porta 3000!')
});