const express = require('express');
const router = express.Router(); //gerenciador das rotas
const bodyParser = require("body-parser");//body-parser
const axios = require('axios');

//rota para a criação de serviços Arquivo
router.get("/cadastrarArquivo",function(req,res){
    res.render("formularioArquivo");
});

//rota para salvar serviços Arquivo
router.post("/salvarArquivo", (req,res) => {
    var nome = req.body.nome;
    var dir = req.body.dir;
    var data = {nome,dir}
    axios.post('http://localhost:8080/service/Arquivo', data).then( response => {
        if(response.data == 'OK'){
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect('/cadastrarArquivo');
    })
});

//rota para edição, salvar as informações novas
router.post("/editarArquivo",(req,res)=>{
    var nome = req.body.nome;
    var dir = req.body.dir;
    var id = req.body.id;
    var data = {nome,dir,id}
    axios.put('http://localhost:8080/service/Arquivo/' + id, data).then(response => {
        if(response.data == 'OK'){
            res.redirect("/servicos");
        }
    }).catch(error => {
        res.redirect('/');
    });
});

module.exports = router;