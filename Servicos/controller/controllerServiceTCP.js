const express = require('express');
const router = express.Router(); //gerenciador das rotas
const bodyParser = require("body-parser");//body-parser
const axios = require('axios');

//rota para o formularioTCP
router.get("/cadastrarTCP", (req,res) => {
    res.render("formularioTCP");
});

//rota para o salvamento dos servicos TCP passadas pelo formularioTCP
router.post("/salvarTCP", (req,res) => {
    var nome = req.body.name;
    var ip = req.body.ip;
    var porta = parseInt(req.body.porta);
    var data = {nome,ip,porta};
    axios.post('http://localhost:8080/service/TCP', data).then( response => {
        if(response.data == "OK"){
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/CadastrarTCP"); //caso tenha alguma informação errada retorna para a rota de cadastro
    });
});


//rota para edição, salvar as informações novas
router.post("/editarTCP",(req,res)=>{
    var nome = req.body.nome;
    var ip = req.body.ip;
    var porta = req.body.porta;
    var id = req.body.id;
    var data = {nome,ip,porta};
    axios.put('http://localhost:8080/service/TCP/' + id, data).then( response => {
        if(response.data == 'OK'){
            res.redirect("/servicos");
        }
    }).catch(error => {
        res.redirect("/"); //caso tenha alguma informação errada retorna para a rota de cadastro
    });
});

module.exports = router;