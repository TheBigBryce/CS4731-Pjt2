let gl;
let vBuffer,vNormalBuffer,vPosition,vNormalPosition, vTextureBuffer, vTexture;
let pointsArray = [], normalsArray = [], faceLengths = [], matDiffuses = [], matSpeculars = [], texCoords=[];
let numFacesB4NextObj = [];
let numDrawn=0;
let numObjLoaded=0;
let texNum=0;
let cubeNum = 0;
let objects = [];

let reflections = false;
let refractions = false;
let shadowMatrix;

let cubeMapLoaded = false;

let stack = [];

let skybox = false;

let skyboxPoints = [
    //face 1
    vec4(20,20,20,1),
    vec4(20,20,-20,1),
    vec4(20,-20,20,1),
    vec4(20,-20,-20,1),
    //face2
    vec4(-20,20,20,1),
    vec4(-20,20,-20,1),
    vec4(-20,-20,20,1),
    vec4(-20,-20,-20,1),
    //face3
    vec4(20,20,20,1),
    vec4(20,20,-20,1),
    vec4(-20,20,20,1),
    vec4(-20,20,-20,1),
    //face4
    vec4(20,-20,20,1),
    vec4(20,-20,-20,1),
    vec4(-20,-20,20,1),
    vec4(-20,-20,-20,1),
    //face5
    vec4(20,20,-20,1),
    vec4(20,-20,-20,1),
    vec4(-20,20,-20,1),
    vec4(-20,-20,-20,1),
    //face6
    vec4(20,20,20,1),
    vec4(20,-20,20,1),
    vec4(-20,20,20,1),
    vec4(-20,-20,20,1)
];
let texPoints = [
    vec2(0,0),
    vec2(0,1),
    vec2(1,0),
    vec2(1,1)
];


let vBufferBox,vPositionBox, vTextureBufferBox, vTextureBox;



let lightPosition = vec4(1.0, 10.0, 1.0, 1.0 );
let lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
let lightDiffuse = vec4( 0.7, 0.7, 0.7, 1.0 );
let lightSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
let carAngle = 0;
let eyeAngle = 7.5;
let atAngle = 9.5;

let numLoaded = 0;

let carTrans = vec3(2.9, 0.0, 0.0);
let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;
let near = .1;
let far = 100;
let program;
let cubeMapURLs= ["https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_posx.png","https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_negx.png","https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_posy.png","https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_negy.png","https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_posz.png","https://web.cs.wpi.edu/~jmcuneo/cs4731/project2/skybox_negz.png"];

let cameraX = 13;
let cameraY = 13;
let theta = 0;
let animateCamera = false;
let cameraOnCar = false;
let animateCar = false;
let onlyAmbient = 0.0;
let lightChange=false;
let shadowOn = false;
// Get the stop sign
let stopSign = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.mtl");


// Get the street
let street = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.mtl");

// Get the car
let car = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.mtl");


// Get the lamp
let lamp = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.mtl");

// Get the bunny (you will not need this one until Part II)
let bunnicula = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.mtl");

function main() {
    // Retrieve <canvas> element


    let canvas = document.getElementById('webgl');

    window.addEventListener('keypress',onKeyPress,false);
    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, undefined);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders
    shadowMatrix= mat4();
    shadowMatrix[3][1] = 0;
    shadowMatrix[3][2] = -1/lightPosition[2];

    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);



    eye = vec3(cameraX,cameraY+2, 0);
    modelViewMatrix = lookAt(eye, at , up);
    let fovY = 50;
    projectionMatrix = perspective(fovY,1,near,far);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    //setting up light uniforms
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "lightDiffuse"), flatten(lightDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "lightSpecular"), flatten(lightSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, "lightAmbient"), flatten(lightAmbient));
    gl.uniform1f(gl.getUniformLocation(program, "onlyAmbient"), onlyAmbient);

    //Getting the location of attributes in the index.html for all objects
    vPosition = gl.getAttribLocation( program, "vPosition");
    vNormalPosition = gl.getAttribLocation( program, "vNormal");
    vTexture = gl.getAttribLocation( program, "vTexture");

   render();
}


let id;
function render(){

    numDrawn=0;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(lightChange){
        gl.uniform1f(gl.getUniformLocation(program, "onlyAmbient"), onlyAmbient);
        lightChange=false;
    }
    //rotate camera
    if(animateCamera){
        theta+=0.0075;
        eye = vec3(cameraX* Math.cos(theta), cameraY + 2 *Math.cos(theta), cameraX * Math.sin(theta));
        modelViewMatrix = lookAt(eye, at , up);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    }


    if(animateCar){
        eyeAngle+=.3;
        atAngle+=.3;
        carAngle-=.3;
    }

    //Load and draw all objects, only after all are loaded, so we have a consistent order
    if(bunnicula.objParsed && bunnicula.mtlParsed && stopSign.objParsed && stopSign.mtlParsed && car.objParsed && car.mtlParsed && lamp.objParsed && lamp.mtlParsed && street.objParsed && street.mtlParsed) {
        checkObjAndLoad(stopSign, "texSign", gl.TEXTURE0);
        checkObjAndLoad(street, "texStreet", gl.TEXTURE1);
        checkObjAndLoad(car, "texCar", gl.TEXTURE2);
        checkObjAndLoad(bunnicula, "texBunnicula", gl.TEXTURE3);
        checkObjAndLoad(lamp, "texLamp", gl.TEXTURE4);
        if(cubeMapLoaded === false) {
            configCubeMap(cubeMapURLs);
            loadSkybox();
            configSkyboxTextures();
            cubeMapLoaded=true;
        }
    }

    if(bunnicula.loaded && stopSign.loaded && car.loaded && lamp.loaded && street.loaded) {

        stack.push(modelViewMatrix);
        if(cameraOnCar){
            modelViewMatrix = lookAt(vec3(angleCalc(eyeAngle,"cos"),1,angleCalc(eyeAngle,"sin")),vec3(angleCalc(atAngle,"cos"),1,angleCalc(atAngle,"sin")),up);
        }
        else{
            modelViewMatrix = stack.pop();
        }

        numLoaded = 0;
        stack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(-.5,0,4.1));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawSign();

        modelViewMatrix=stack.pop();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawStreet();
        stack.push(modelViewMatrix);

        modelViewMatrix = mult(modelViewMatrix, rotateY(-90));
        stack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, rotateY(carAngle));
        modelViewMatrix =  mult(modelViewMatrix,translate(carTrans[0],0.0,0.0));

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawCar();


        modelViewMatrix = mult(modelViewMatrix, translate(0,.65,1.8));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawBunnicula();

        modelViewMatrix = stack.pop();
        modelViewMatrix = stack.pop();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawLamp();

        if(skybox){
            drawSkybox();
        }
    }
    if(cameraOnCar)
        modelViewMatrix = stack.pop();
    id = requestAnimationFrame(render);
}

function checkObjAndLoad(curObj, textureName, textureNum){
    if(!curObj.loaded) {
        objects.push(curObj);
        if (curObj.textured) {
            for (let i = 0; i < curObj.faces.length; i++) {
                let curFace = curObj.faces[i];
                for (let j = 0; j < curFace.faceVertices.length; j++) {
                    pointsArray.push(curFace.faceVertices[j]);
                    normalsArray.push(curFace.faceNormals[j]);
                    texCoords.push(curFace.faceTexCoords[j]);
                }
                let currentDiffuse = curObj.diffuseMap.get(curFace.material);
                let currentSpecular = curObj.specularMap.get(curFace.material);
                faceLengths.push(curFace.faceVertices.length);
                matDiffuses.push(vec4(currentDiffuse[0], currentDiffuse[1], currentDiffuse[2], currentDiffuse[3]));
                matSpeculars.push(vec4(currentSpecular[0], currentSpecular[1], currentSpecular[2], currentSpecular[3]));
            }
            if(curObj.textured){
                configTexture(curObj.imagePath, textureName, textureNum);
            }
            curObj.loaded = true;
            numObjLoaded += 1;
            if (numFacesB4NextObj.length === 0)
                numFacesB4NextObj[0] = curObj.faces.length;
            else
                numFacesB4NextObj.push(curObj.faces.length + numFacesB4NextObj[numFacesB4NextObj.length - 1]);
            if (numObjLoaded === 5) {
                loadBuffer();
            }
        }
        else{
            for (let i = 0; i < curObj.faces.length; i++) {
                let curFace = curObj.faces[i];
                for (let j = 0; j < curFace.faceVertices.length; j++) {
                    pointsArray.push(curFace.faceVertices[j]);
                    normalsArray.push(curFace.faceNormals[j]);
                }
                let currentDiffuse = curObj.diffuseMap.get(curFace.material);
                let currentSpecular = curObj.specularMap.get(curFace.material);
                faceLengths.push(curFace.faceVertices.length);
                matDiffuses.push(vec4(currentDiffuse[0], currentDiffuse[1], currentDiffuse[2], currentDiffuse[3]));
                matSpeculars.push(vec4(currentSpecular[0], currentSpecular[1], currentSpecular[2], currentSpecular[3]));
            }
            curObj.loaded = true;
            numObjLoaded += 1;
            if (numFacesB4NextObj.length === 0)
                numFacesB4NextObj[0] = curObj.faces.length;
            else
                numFacesB4NextObj.push(curObj.faces.length + numFacesB4NextObj[numFacesB4NextObj.length - 1]);
            if (numObjLoaded === 5) {
                loadBuffer();
            }
        }
    }
}

function drawObj(objNum, drawFlag, reflect, refract){
        if(objects[objNum].textured)
            gl.uniform1f(gl.getUniformLocation(program,"textured"),1.0);
        else
            gl.uniform1f(gl.getUniformLocation(program,"textured"),0.0);

        for (let i = numLoaded; i < numFacesB4NextObj[objNum]; i++) {
            gl.uniform4fv(gl.getUniformLocation(program, "matDiffuse"), flatten(matDiffuses[i]));
            gl.uniform4fv(gl.getUniformLocation(program, "matSpecular"), flatten(matSpeculars[i]));
            //shadow stuff
            if((objNum===0 || objNum === 2) && shadowOn){
                stack.push(modelViewMatrix);
                gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),6.0);

                let modelMatrix = translate(lightPosition[0],lightPosition[1],lightPosition[2]);
                modelMatrix = mult(modelMatrix, shadowMatrix);
                modelMatrix = mult(modelMatrix, translate(-lightPosition[0],-lightPosition[1],-lightPosition[2]));

                modelViewMatrix = mult(modelViewMatrix,modelMatrix);
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
                gl.drawArrays(gl.TRIANGLES, numDrawn, faceLengths[i]);

                gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),drawFlag);
                modelViewMatrix = stack.pop();
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
            }
            if(reflect){
                gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),7.0);
            }
            if(refract){
                gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),8.0);
            }
            gl.drawArrays(gl.TRIANGLES, numDrawn, faceLengths[i]);
            numDrawn += faceLengths[i];
        }
        numLoaded = numFacesB4NextObj[objNum];
}

function drawCar(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),3.0);
    drawObj(2,3.0, reflections,false);
}
function drawBunnicula(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),1.0);
    drawObj(3,1.0, false, refractions);
}
function drawSign(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),5.0);
    drawObj(0,5.0, false, false);
}

function drawStreet(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),4.0);
    drawObj(1,4.0, false, false);
}

function drawLamp(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),2.0);
    drawObj(4,2.0, false, false);
}

function loadBuffer(){
    vBuffer = gl.createBuffer();
    vNormalBuffer = gl.createBuffer();
    vTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, vTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vTexture, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexture);
}

function onKeyPress(event){
    if(event.key === 'c' || event.key === 'C'){
        animateCamera = !animateCamera;
    }
    else if(event.key === 'l' || event.key === 'L'){
        if(onlyAmbient===0.0)
            onlyAmbient = 1.0;
        else
            onlyAmbient = 0.0;
        lightChange=true;
    }
    else if(event.key === 'm' || event.key === 'M'){
        animateCar = !animateCar;
    }
    else if(event.key === 'd' || event.key === 'D'){
        cameraOnCar = !cameraOnCar;
    }
    else if(event.key === 'r' || event.key === 'R'){
        reflections = !reflections;
    }
    else if(event.key === 's' || event.key === 'S'){
        shadowOn = !shadowOn;
    }
    else if(event.key === 'f' || event.key === 'F'){
        refractions = !refractions;
    }
    else if(event.key === 'e' || event.key === 'E'){
        skybox = !skybox;
    }
}

function configTexture(imageURL,name, textureNum){
    let image = new Image();
    image.crossOrigin="";
    image.src=imageURL;
    image.onload = function() {
        let tex = gl.createTexture();
        gl.activeTexture(textureNum|1);
        gl.bindTexture(gl.TEXTURE_2D,tex);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);

        gl.uniform1i(gl.getUniformLocation(program,name), texNum);
    }
    texNum++;
}

function configCubeMap(urls){
    let images = [];

    for(let i=0; i<urls.length; i++){
        imageStuff(urls[i]);
    }
    function checkandLoadCubeMap(){
        if(images.length===urls.length){

            let cubeMap = gl.createTexture();
            gl.activeTexture(gl.TEXTURE10);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[0]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[1]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[2]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[3]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[4]);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[5]);

            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            gl.uniform1i(gl.getUniformLocation(program, "cubeMap"), 10);
        }
    }
    function imageStuff(imageURL){
        let image = new Image();
        image.crossOrigin="";
        image.src=imageURL;

        image.onload = function() {
            images.push(image);
            checkandLoadCubeMap();
        }
    }
}


function angleCalc(degrees, sinOrCosine){
    let radians = (degrees*Math.PI)/180;
    radians+= Math.PI/2;
    let carPos = carTrans[0] + .4;
    if(sinOrCosine === "sin"){
        return carPos*Math.sin(radians);
    }
    if(sinOrCosine === "cos"){
        return carPos*Math.cos(radians);
    }
}


function drawSkybox(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),10.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),11.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),12.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),13.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 12, 4);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),14.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 16, 4);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),15.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 20, 4);
}

function loadSkybox(){
    vPositionBox = gl.getAttribLocation( program, "vPositionBox");
    vTextureBox = gl.getAttribLocation( program, "vTextureBox");
    vBufferBox = gl.createBuffer();
    vTextureBufferBox = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBox);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(skyboxPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPositionBox, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionBox);

    gl.bindBuffer(gl.ARRAY_BUFFER, vTextureBufferBox);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vTextureBox, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTextureBox);
}
function configSkyboxTextures(){
    //configTexture(cubeMapURLs[0],"posX",gl.TEXTURE30);
    // configTexture(cubeMapURLs[1],"negX",gl.TEXTURE31);
    // configTexture(cubeMapURLs[2],"posY",gl.TEXTURE29);
    // configTexture(cubeMapURLs[3],"negY",gl.TEXTURE15);
    // configTexture(cubeMapURLs[4],"posZ",gl.TEXTURE16);
    // configTexture(cubeMapURLs[5],"negZ",gl.TEXTURE17);
}