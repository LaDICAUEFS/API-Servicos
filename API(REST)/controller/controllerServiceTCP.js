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

//rota para o salvamento dos servicos TCP passadas pelo formularioTCP
router.post("/service/TCP", (req,res) => {
    var nome = req.body.nome;
    var ip = req.body.ip;
    var porta = parseInt(req.body.porta);
    if(!validacaoTCP(nome,ip,porta)){//validação 
        console.log('teste')
        res.sendStatus(400);
    }else{ // caso todas as codições estejam ok
        manager.salvarTCP(nome,ip,porta);
        res.sendStatus(200);
    }
});


//rota para edição, salvar as informações novas
router.put("/service/TCP/:id",(req,res)=>{
    let editar = undefined;
    var id = req.params.id;
    //achar o serviço pedido
    manager.getServices().forEach(servico => {
        if(servico.val().id == id){
            editar = servico;
        }
    });
    if(editar != undefined){
        var nome = req.body.nome;
        var ip = req.body.ip;
        var porta = req.body.porta;
        //salva no firebase
        manager.editarTCP(nome,ip,porta,id);
        res.sendStatus(200);
    }else res.sendStatus(400);
});

module.exports = router;