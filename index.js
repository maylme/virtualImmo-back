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
            taupe : {
                name: 'Taupe',
                topImg : "./furnitures/view_table/amelie_top_taupe.png",
                texture: "amelie_taupe.mtl",
            }
        },
        size: {
            x: 2.3,
            z: 1,
        }
    },
    1 : {
        name: "Sophie",
        id: 1,
        miniature:"./furnitures/view_table/sophie.png",
        model3D: "sophie.obj",
        textures_availables: {
            taupe : {
                name: 'Taupe',
                topImg : "./furnitures/view_table/sophie_top.png",
                texture: "sophie_taupe.mtl",
            }
        },
        size: {
            x: 2.3,
            z: 1,
        }
    }
};
var tv = {
    0 : {
        name: "Samsung TV",
        id: 0,
        miniature:"./furnitures/tv/samsung/samsung_lcd.png",
        model3D: "./furnitures/tv/samsung/samsung_lcd.json",
        textures_availables: {
            noir : {
                name: 'noir',
                topImg : "./furnitures/tv/samsung/top_tv_noir.png",
                texture: "./furnitures/tv/samsung/plastic_noir.jpg",
            },
            blanc : {
                name: 'blanc',
                topImg : "./furnitures/tv/samsung/top_tv_blanc.png",
                texture: "./furnitures/tv/samsung/plastic_blanc.jpg",
            }
        },
        size: {
            x: 1,
            z: 0.2,
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
            case "tv":
                var available_tv = [];
                var keys = Object.keys(tv);
                for (var i = 0; i < keys.length; i++){
                    var the_tv = {};
                    the_tv.name = tv[keys[i]].name;
                    the_tv.id = tv[keys[i]].id;

                    var img = fs.readFileSync(tv[keys[i]].miniature);
                    // convert binary data to base64 encoded string
                    the_tv.miniature = new Buffer(img).toString('base64');
                    var keys_texture = Object.keys(tv[keys[i]].textures_availables);
                    the_tv.textures = {};
                    the_tv.size = tv[keys[i]].size;
                    for (var j = 0; j < keys_texture.length; j++){

                        var top = fs.readFileSync(tv[keys[i]].textures_availables[keys_texture[j]].topImg);
                        the_tv.textures[keys_texture[j]] = {
                            name : tv[keys[i]].textures_availables[keys_texture[j]].name,
                            id: keys_texture[j],
                            topImg : new Buffer(top).toString('base64')
                        };
                    }
                    available_tv.push(the_tv);
                    client.emit("availableTv", available_tv);
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
            case "tv":
                if (tv[data.id]){
                    var selected_tv = {};
                    selected_tv.id = tv[data.id].id;
                    selected_tv.index = data.index;

                    selected_tv.name = tv[data.id].name;
                    var model3D = fs.readFileSync(tv[data.id].model3D);
                    selected_tv.model3D = JSON.parse(new Buffer(model3D).toString());

                    selected_tv.selected_texture = data.textureId;
                    selected_tv.position = data.position;

                    selected_tv.textures_availables = {};
                    selected_tv.type = "tv";
                    var keys = Object.keys(tv[data.id].textures_availables);

                    for (var i = 0; i < keys.length; i++){
                        var texture = fs.readFileSync(tv[data.id].textures_availables[keys[i]].texture);
                        selected_tv.textures_availables[keys[i]] = {
                            name: tv[data.id].textures_availables[keys[i]].name,
                            texture : new Buffer(texture).toString('base64')
                        };
                    }
                    //client.emit("addFurniture", selected_sofa);
                    client.broadcast.emit("addFurniture", selected_tv);

                }else{
                    client.emit("err", "tv id doesnt exist");
                }
                break;
            default:
                client.emit("err", "tv id doesnt exist");
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
