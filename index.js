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
                topImg : "./furnitures/view_table/amelie_top_rose.png",
                texture: "amelie_rose.mtl",
            },
            orange : {
                name: 'Coussins Oranges',
                topImg : "./furnitures/view_table/amelie_top_orange.png",
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
            x: 6.68,
            z: 5.12,
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
            x: 2.7,
            z: 1.44,
        }
    },
    1 : {
        name: "Table de café",
        id: 1,
        miniature:"./furnitures/view_table/cafe_table.png",
        model3D: "cafe_table.obj",
        textures_availables: {
            normal : {
                name: 'normal',
                topImg : "./furnitures/view_table/cafe_table_top.png",
                texture: "cafe_table.mtl",
            }
        },
        size: {
            x: 1.5,
            z: 1.2,
        }
    },
    2 : {
        name: "Table en marbre",
        id: 2,
        miniature:"./furnitures/view_table/marble_table.png",
        model3D: "marble_table.obj",
        textures_availables: {
            normal : {
                name: 'normal',
                topImg : "./furnitures/view_table/marble_table_top.png",
                texture: "marble_table.mtl",
            }
        },
        size: {
            x: 2.6,
            z: 2.6,
        }
    },
    3 : {
        name: "Table basse vitrée bois et acier",
        id: 3,
        miniature:"./furnitures/view_table/table_wood_and_iron.png",
        model3D: "table_wood_and_iron.obj",
        textures_availables: {
            normal : {
                name: 'normal',
                topImg : "./furnitures/view_table/table_wood_and_iron_top.png",
                texture: "table_wood_and_iron.mtl",
            }
        },
        size: {
            x: 1.96,
            z: 1.22,
        }
    },
    4 : {
        name: "Table basse carrée",
        id: 4,
        miniature:"./furnitures/view_table/tableBasseCarree.png",
        model3D: "tableBasseCarree.obj",
        textures_availables: {
            normal : {
                name: 'normal',
                topImg : "./furnitures/view_table/tableBasseCarree_top.png",
                texture: "tableBasseCarree.mtl",
            }
        },
        size: {
            x: 1.8,
            z: 1.62,
        }
    }
};

var beds = {
    0 : {
        name: "leti",
        id: 0,
        miniature:"./furnitures/view_table/mesa.png",
        model3D: "children_bed.obj",
        textures_availables: {
            normal : {
                name: 'normal',
                topImg : "./furnitures/view_table/mesa_top.png",
                texture: "children_bed.mtl",
            }
        },
        size: {
            x: 2.7,
            z: 1.44,
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
                }
                client.emit("availableSofas", available_sofas);
                break;
            case "bed":
                var available_beds = [];
                var keys = Object.keys(beds);
                for (var i = 0; i < keys.length; i++){
                    var bed = {};
                    bed.name = beds[keys[i]].name;
                    bed.id = beds[keys[i]].id;

                    var img = fs.readFileSync(beds[keys[i]].miniature);
                    // convert binary data to base64 encoded string
                    bed.miniature = new Buffer(img).toString('base64');

                    var keys_texture = Object.keys(beds[keys[i]].textures_availables);
                    bed.textures = {};
                    bed.size = beds[keys[i]].size;
                    for (var j = 0; j < keys_texture.length; j++){

                        var top = fs.readFileSync(beds[keys[i]].textures_availables[keys_texture[j]].topImg);
                        bed.textures[keys_texture[j]] = {
                            name : beds[keys[i]].textures_availables[keys_texture[j]].name,
                            id: keys_texture[j],
                            topImg : new Buffer(top).toString('base64')
                        };
                    }
                    available_beds.push(bed);
                }
                client.emit("availableBeds", available_beds);
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
                }
                client.emit("availableTables", available_table);
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
        var type = null;
        switch (data.type){
            case "sofa":
                if (sofas[data.id])
                    type = sofas;
                break;
            case "table":
                if (table[data.id]){
                   type = table;
                }
                break;
            case "bed":
                if (bed[data.id]){
                    type = bed;
                }
            default:
                break;
        }
        if (type!==null){
            var selected = {};
            selected.id = type[data.id].id;
            selected.index = data.index;

            selected.name = type[data.id].name;
            var model3D = type[data.id].model3D;
            selected.model3D = model3D;

            selected.selected_texture = data.textureId;
            selected.position = data.position;

            selected.textures_availables = {};
            selected.type = data.type;
            var keys = Object.keys(type[data.id].textures_availables);

            for (var i = 0; i < keys.length; i++){
                selected.textures_availables[keys[i]] = {
                    name: type[data.id].textures_availables[keys[i]].name,
                    texture : type[data.id].textures_availables[keys[i]].texture
                };
            }
            client.broadcast.emit("addFurniture", selected);

        }
        else{
            client.emit("err", "furniture not found");
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

    client.on("position", function(data){
        client.broadcast.emit("position", data);
    });




});

server.listen(8080);
