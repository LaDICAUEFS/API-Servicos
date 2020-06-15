const express = require("express");//express
const bodyParser = require("body-parser");//body-parser
const app = express(); //gerenciador express
//Controller Services TCP e Arquivo
const controllerTCP = require('./controller/controllerServiceTCP');
const controllerArquivo = require('./controller/controllerServiceArquivo');
const axios = require('axios');
//configuração do body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//configuração do ejs
app.set('view engine','ejs');
app.use(express.static('public'));

//pegando as rotas dos controllers
app.use('/', controllerTCP);
app.use('/', controllerArquivo);

//rota principal
app.get("/",function(req,res){
    res.render("index");
});

//rota para listagem dos serviços
app.get("/servicos", (req,res) => {
    axios.get('http://localhost:8080/service').then( response => {
        //console.log(response.data.services)
        let data = response.data.services
        res.render("servicos",{servicos: data});
    })
});


//rota para deletar um serviço
app.post("/servicos/deletar",(req,res) => {
    var id = req.body.id;
    //remoção do firebase
    axios.delete('http://localhost:8080/service/'+id).then( response => {
        res.redirect("/servicos");
    });
});

//rota para edição de serviços
app.get("/servicos/editar/:id",(req,res) => {
    var editar;
    var id = req.params.id;
    //achar o serviço pedido
    axios.get('http://localhost:8080/service/'+id).then( response => {
        let data = response.data.editar;
        //descobrir qual é o tipo do serviço para redirecionar para a página de edição correta
        if(data.diretorio == ''){
            res.render("editarTCP",{servico: data});
        }else{
            res.render("editarArquivo",{servico: data});
        }
    });
});

//start do server
app.listen(8050,() =>{
    console.log("Esta rodando 8050 ");
});
