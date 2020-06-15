const express = require('express');
const router = express.Router(); //gerenciador das rotas
const bodyParser = require("body-parser");//body-parser
const manager = require('../database/manager'); // manager of firebase
const upload = require('../middleware/middlewareFile'); //middleware para aceitar arquivos
const fs = require('fs');//biblioteca de arquivos

//metodo para verificação de existência de serviços
function jaExiste(nome){
    var cadastrado = false;
    manager.getServices().forEach(servico => {
        if(servico.val().nome == nome){
            cadastrado = true;
            //req.flash('name_msg', 'Nome já cadastrado');
        }
    });
    return cadastrado;
}

//metodo para verificação de existência de serviços
function jaExisteDir(dir){
    var cadastrado = false;
    manager.getServices().forEach(servico => {
        if(servico.val().diretorio == dir){
            cadastrado = true;
            //req.flash('name_msg', 'Nome já cadastrado');
        }
    });
    return cadastrado;
}

//metodo para validação de serviços Arquivos
function validacaoArquivo(nome, dir){
    let arquivoExiste = 'nao';
    if(jaExiste(nome)){//verificação se já existe um serviço com o mesmo nome cadastrado
        return false;
    }
    if(jaExisteDir(dir)){
        return false;
    }
    return true;
}

//rota para salvar serviços Arquivo
router.post("/service/Arquivo", (req,res) => {
    var nome = req.body.nome;
    var dir = req.body.dir;
    if(!validacaoArquivo(nome,dir)){
        res.sendStatus(400);
    }else{
        fs.access(dir, fs.constants.F_OK, (err) => {
            if(err){
                res.sendStatus(400);
            }else{
                manager.salvarArquivo(nome,dir);
                res.sendStatus(200);
            }
        });
    }
});

//rota para edição, salvar as informações novas
router.put("/service/Arquivo/:id",(req,res)=>{
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
        var dir = req.body.dir;
        fs.access(dir, fs.constants.F_OK, (err) => {
            if(err){
                console.log(err)
                res.sendStatus(400);
            }else{
                //salva no firebase
                manager.editarArquivo(nome,dir,id);
                res.sendStatus(200);
            }
        });
    }
});

module.exports = router;