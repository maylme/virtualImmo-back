/**
 * Created by anthony on 16/12/16.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');


app.get('/:img', function (req, res) {

    var url = "./furnitures/"+req.params.img;
    var img = fs.readFileSync(url);
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*'
    });
    res.end(img);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});



var sofas = {
    0 : {
        name: "Amelie",
        id: 0,
        miniature:"./furnitures/view_table/amelie.png",
        model3D: "amelie.obj",
        textures_availables: {
            rose : {
                name: 'Coussins Roses',
                topImg : "./furnitures/view_table/amelie_top_taupe.png",
                texture: "amelie_rose.mtl",
            },
            orange : {
                name: 'Coussins Oranges',
                topImg : "./furnitures/view_table/amelie_top_taupe.png",
                texture: "amelie_orange.mtl",
            }
        },
        size: {
            x: 5,
            z: 1.68,
        }
    },
    1 : {
        name: "Sophie",
        id: 1,
        miniature:"./furnitures/view_table/sophie.png",
        model3D: "sophie.obj",
        textures_availables: {
            cuir : {
                name: 'cuir',
                topImg : "./furnitures/view_table/sophie_top.png",
                texture: "sophie_cuir.mtl",
            }
        },
        size: {
            x: 2.5,
            z: 2,
        }
    },
    2 : {
        name: "Bobo",
        id: 2,
        miniature:"./furnitures/view_table/bobo.png",
        model3D: "bobo.obj",
        textures_availables: {
            tissus : {
                name: 'tissus',
                topImg : "./furnitures/view_table/bobo_top.png",
                texture: "bobo.mtl",
            },
            rose : {
                name: 'rose',
                topImg : "./furnitures/view_table/bobo_rose_top.png",
                texture: "bobo_rose.mtl",
            },
            bleu : {
                name: 'bleu',
                topImg : "./furnitures/view_table/bobo_bleu_top.png",
                texture: "bobo_bleu.mtl",
            }
        },

        size: {
            x: 4.04,
            z: 2.12,
        }
    }
};

var table = {
    0 : {
        name: "Mesa",
        id: 0,
        miniature:"./furnitures/view_table/mesa.png",
        model3D: "mesa.obj",
        textures_availables: {
            normal : {
                name: 'normal',
                topImg : "./furnitures/view_table/mesa_top.png",
                texture: "mesa.mtl",
            }
        },
        size: {
            x: 1,
            z: 1,
        }
    }
};


io.on('connection', function (client) {
    console.log("client connected");

    client.on("outputChange", function (data) {
        console.log(data);
        client.broadcast.emit("inputChange", data);
    });
    client.on("wallTable", function (data) {
        console.log("wall:", data);
        client.broadcast.emit("wallVR", data);
    });
    client.on("tableWantFurniture", function(furniture_type){
        console.log("furniture_type");
        switch(furniture_type){
            case "sofa":
                var available_sofas = [];
                var keys = Object.keys(sofas);
                for (var i = 0; i < keys.length; i++){
                    var sofa = {};
                    sofa.name = sofas[keys[i]].name;
                    sofa.id = sofas[keys[i]].id;

                    var img = fs.readFileSync(sofas[keys[i]].miniature);
                    // convert binary data to base64 encoded string
                    sofa.miniature = new Buffer(img).toString('base64');

                    var keys_texture = Object.keys(sofas[keys[i]].textures_availables);
                    sofa.textures = {};
                    sofa.size = sofas[keys[i]].size;
                    for (var j = 0; j < keys_texture.length; j++){

                        var top = fs.readFileSync(sofas[keys[i]].textures_availables[keys_texture[j]].topImg);
                        sofa.textures[keys_texture[j]] = {
                            name : sofas[keys[i]].textures_availables[keys_texture[j]].name,
                            id: keys_texture[j],
                            topImg : new Buffer(top).toString('base64')
                        };
                    }
                    available_sofas.push(sofa);
                    client.emit("availableSofas", available_sofas);
                }
                break;
            case "table":
                var available_table = [];
                var keys = Object.keys(table);
                for (var i = 0; i < keys.length; i++){
                    var the_table = {};
                    the_table.name = table[keys[i]].name;
                    the_table.id = table[keys[i]].id;

                    var img = fs.readFileSync(table[keys[i]].miniature);
                    // convert binary data to base64 encoded string
                    the_table.miniature = new Buffer(img).toString('base64');
                    var keys_texture = Object.keys(table[keys[i]].textures_availables);
                    the_table.textures = {};
                    the_table.size = table[keys[i]].size;
                    for (var j = 0; j < keys_texture.length; j++){

                        var top = fs.readFileSync(table[keys[i]].textures_availables[keys_texture[j]].topImg);
                        the_table.textures[keys_texture[j]] = {
                            name : table[keys[i]].textures_availables[keys_texture[j]].name,
                            id: keys_texture[j],
                            topImg : new Buffer(top).toString('base64')
                        };
                    }
                    available_table.push(the_table);
                    client.emit("availableTables", available_table);
                }
                break;
            default:
                client.emit("err", "furniture not found");
        }
    });


    /**
     * data = {
     *     type : "furniture_type",
     *     id: 'furniture_id',
     *     textureId: 'textureId',
     *     position: {
     *         x: number
     *         y: number
     *         z: number
     *         angle: number
     *     },
     *     index: "furniture_id_in_display"
     * }
     */
    client.on("tableAddFurniture", function(data){
        console.log(data);
        switch (data.type){
            case "sofa":
                if (sofas[data.id]){
                    var selected_sofa = {};
                    selected_sofa.id = sofas[data.id].id;
                    selected_sofa.index = data.index;

                    selected_sofa.name = sofas[data.id].name;
                    var model3D = sofas[data.id].model3D;
                    selected_sofa.model3D = model3D;

                    selected_sofa.selected_texture = data.textureId;
                    selected_sofa.position = data.position;

                    selected_sofa.textures_availables = {};
                    selected_sofa.type = "sofa";
                    var keys = Object.keys(sofas[data.id].textures_availables);

                    for (var i = 0; i < keys.length; i++){
                        selected_sofa.textures_availables[keys[i]] = {
                            name: sofas[data.id].textures_availables[keys[i]].name,
                            texture : sofas[data.id].textures_availables[keys[i]].texture
                        };
                    }
                    //client.emit("addFurniture", selected_sofa);
                    client.broadcast.emit("addFurniture", selected_sofa);

                }else{
                    client.emit("err", "sofa id doesnt exist");
                }
                break;
            case "table":
                if (table[data.id]){
                    var selected_table = {};
                    selected_table.id = table[data.id].id;
                    selected_table.index = data.index;

                    selected_table.name = table[data.id].name;
                    var model3D = table[data.id].model3D;
                    selected_table.model3D = model3D;

                    selected_table.selected_texture = data.textureId;
                    selected_table.position = data.position;

                    selected_table.textures_availables = {};
                    selected_table.type = "table";
                    var keys = Object.keys(table[data.id].textures_availables);

                    for (var i = 0; i < keys.length; i++){
                        var texture = table[data.id].textures_availables[keys[i]].texture;
                        selected_table.textures_availables[keys[i]] = {
                            name: table[data.id].textures_availables[keys[i]].name,
                            texture : texture
                        };
                    }
                    //client.emit("addFurniture", selected_sofa);
                    client.broadcast.emit("addFurniture", selected_table);

                }else{
                    client.emit("err", "table id doesnt exist");
                }
                break;
            default:
                client.emit("err", "table id doesnt exist");
                break;
        }

    });
    /*
        data = {
            id : "furniture id",
            type: "furniture type",
            position: {
                x: ...
                y: ...
                z: ...
                angle: ...
            },
            index: "furniture_id_in_display"
        }
     */
    client.on("moveFurniture", function(data){
        client.broadcast.emit("movedFurniture", data);
    });

    /*
        data = {
            id : "furniture id",
            type: "furniture type",
            texture_id: "texture_id",
            index: "furniture_id_in_display"
        }
     */
    client.on("changeFurnitureTexture", function(data){
        client.broadcast.emit("changedFurnitureTexture", data);
    });

    /*
        data = {
     *     index: "furniture_id_in_display"
        }
     */
    client.on("removeFurniture", function(data){
        client.broadcast.emit("removeFurniture", data);
    });




});

server.listen(8080);
