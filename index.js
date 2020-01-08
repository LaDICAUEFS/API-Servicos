const express = require("express");//express
const bodyParser = require("body-parser");//body-parser
const app = express(); //gerenciador express
const firebase = require("firebase");
const configFirebase = require("./database/firebase");

//configuracao do firebase
//as informações do banco do firebase devem ser adicionadas no arquivo firebase.js no diretorio firebase/database
var config = {
    apiKey: configFirebase.apiKey,
    authDomain: configFirebase.authDomain,
    databaseURL:  configFirebase.databaseURL,
    storageBucket: configFirebase.storageBucket
};

var servicosSalvos = [];

firebase.initializeApp(config);
// Get a reference to the database service
var servicos = firebase.database().ref("servicos");
servicos.once('value',function(data){
    servicosSalvos = data;
});

//configuração do body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//configuração do ejs
app.set('view engine','ejs');
app.use(express.static('public'));

//rota principal
app.get("/",function(req,res){
    res.render("index");
});

//rota para o formulario
app.get("/cadastrarServico",function(req,res){
    res.render("formularioServico");
});

//rota para o salvamento das informações passadas pelo formulario
app.post("/salvarServico",function(req,res){
    var nome = req.body.nome;
    var ip = req.body.ipServico;
    var porta = parseInt(req.body.portaServico);
    //salva a informação no banco de dados no firebase
    servicos.push().set({
        nome: nome,
        ip: ip,
        porta: porta
    });
    res.redirect("/");
});

app.get("/servicos",function(req,res){
    res.render("servicos",{servicos: servicosSalvos});
});

//start do server
app.listen(8080,() =>{
    console.log("Esta rodando");
});
