const express = require("express");//express
const bodyParser = require("body-parser");//body-parser
const app = express(); //gerenciador express
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
    var porta = req.body.porta;
    console.log("Nome: " + nome + " Ip: " + ip + " Porta: " + porta);
    res.redirect("/");
});

//start do server
app.listen(8080,() =>{
    console.log("Esta rodando");
});