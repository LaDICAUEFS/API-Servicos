const express = require('express');
const router = express.Router(); //gerenciador das rotas
const bodyParser = require("body-parser");//body-parser
const manager = require('../database/manager'); // manager of firebase
const upload = require('../middleware/middlewareFile'); //middleware para aceitar arquivos

//validação do cadastro
function validacaoTCP(nome, ip , porta){
    let split = ip.split('.');
    let isRight = true;
    if(jaExiste(nome)){//verificação se já existe um serviço com o mesmo nome cadastrado
        return false;
    }
    if(isNaN(parseInt(porta))){ //verificação se a porta é um inteiro
        return false;
    }
    split.forEach(ip4 => {
        if(isNaN(parseInt(ip4))){ // verificação se os quartetos do ip são inteiro
            isRight = false;
        }
    });
    return isRight;
}

//metodo para verificação de existência de serviços
function jaExiste(nome){
    var cadastrado = false;
    manager.getServices().forEach(servico => {
        if(servico.val().nome == nome){
            cadastrado = true;
        }
    });
    return cadastrado;
}

//rota para o formularioTCP
router.get("/cadastrarTCP",function(req,res){
    res.render("formularioTCP");
});

//rota para o salvamento dos servicos TCP passadas pelo formularioTCP
router.post("/salvarTCP", upload.single("file"),function(req,res){
    var nome = req.body.name;
    var ip = req.body.ipServico;
    var porta = parseInt(req.body.portaServico);
    if(!validacaoTCP(nome,ip,porta)){//validação 
        res.redirect("/CadastrarTCP"); //caso tenha alguma informação errada retorna para a rota de cadastro
    }else{ // caso todas as codições estejam ok
        manager.salvarTCP(nome,ip,porta);
        res.redirect("/");
    }
});


//rota para edição, salvar as informações novas
router.post("/editarTCP",(req,res)=>{
    var nome = req.body.nome;
    var ip = req.body.ipServico;
    var porta = req.body.portaServico;
    var id = req.body.id;
    //salva no firebase
    manager.editarTCP(nome,ip,porta,id);
    res.redirect("/servicos");
});

module.exports = router;