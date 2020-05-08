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

//rota para a criação de serviços Arquivo
router.get("/cadastrarArquivo",function(req,res){
    res.render("formularioArquivo");
});

//rota para salvar serviços Arquivo
router.post("/salvarArquivo", upload.single("file"),function(req,res){
    var nome = req.body.name;
    var dir = req.body.dirServico;
    if(!validacaoArquivo(nome,dir)){
        res.redirect("/CadastrarArquivo");
    }else{
        fs.access(dir, fs.constants.F_OK, (err) => {
            if(err){
                res.redirect("/CadastrarArquivo");
            }else{
                manager.salvarArquivo(nome,dir);
                res.redirect("/");
            }
        });
    }
});

//rota para edição, salvar as informações novas
router.post("/editarArquivo",(req,res)=>{
    var nome = req.body.nome;
    var dirServico = req.body.dirServico;
    var id = req.body.id;
    //salva no firebase
    manager.editarArquivo(nome,dir)
    res.redirect("/servicos");
});

module.exports = router;