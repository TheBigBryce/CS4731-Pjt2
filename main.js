let gl;
let vBuffer,vNormalBuffer,vPosition,vNormalPosition, vTextureBuffer, vTexture;
let pointsArray = [], normalsArray = [], faceLengths = [], matDiffuses = [], matSpeculars = [], texCoords=[];
let numFacesB4NextObj = [];
let numDrawn=0;
let numObjLoaded=0;
let texNum=0;
let objects = [];


let stack = [];

let lightPosition = vec4(0.0, 7.0, 0.0, 1.0 );
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
let lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
let lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
let carRotateAngle = 0;

let numLoaded = 0;

let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;
let near = .1;
let far = 100;
let program;

let cameraX = 13;
let cameraY = 13;
let theta = 0;
let animateCamera = false;
let cameraOnCar = false;
let animateCar = false;
let onlyAmbient = 0.0;
let lightChange=false;

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

    gl.enable(gl.DEPTH_TEST);
    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);



    eye = vec3(cameraX,cameraY+2);
    modelViewMatrix = lookAt(eye, at , up);
    let fovY = 30;
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
    gl.clear(gl.COLOR_BUFFER_BIT);
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
        carRotateAngle-=.3;
    }

    //Load and draw all objects, only after all are loaded, so we have a consistent order
    if(bunnicula.objParsed && bunnicula.mtlParsed && stopSign.objParsed && stopSign.mtlParsed && car.objParsed && car.mtlParsed && lamp.objParsed && lamp.mtlParsed && street.objParsed && street.mtlParsed) {
        checkObjAndLoad(stopSign, "texSign", gl.TEXTURE0);
        checkObjAndLoad(street, "texStreet", gl.TEXTURE1);
        checkObjAndLoad(car, "texCar", gl.TEXTURE2);
        checkObjAndLoad(bunnicula, "texBunnicula", gl.TEXTURE3);
        checkObjAndLoad(lamp, "texLamp", gl.TEXTURE4);
    }

    if(bunnicula.loaded && stopSign.loaded && car.loaded && lamp.loaded && street.loaded) {
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


        modelViewMatrix = mult(modelViewMatrix, rotateY(carRotateAngle));
        stack.push(modelViewMatrix);
        modelViewMatrix =  mult(modelViewMatrix,translate(2.9,0,0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawCar();

        modelViewMatrix = stack.pop();
        modelViewMatrix = mult(modelViewMatrix, translate(2.9,.8,1.8));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawBunnicula();

        modelViewMatrix = stack.pop();
        modelViewMatrix = stack.pop();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        drawLamp();
    }
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
                console.log(texCoords);
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

function drawObj(objNum){
        if(objects[objNum].textured)
            gl.uniform1f(gl.getUniformLocation(program,"textured"),1.0);
        else
            gl.uniform1f(gl.getUniformLocation(program,"textured"),0.0);

        for (let i = numLoaded; i < numFacesB4NextObj[objNum]; i++) {
            gl.uniform4fv(gl.getUniformLocation(program, "matDiffuse"), flatten(matDiffuses[i]));
            gl.uniform4fv(gl.getUniformLocation(program, "matSpecular"), flatten(matSpeculars[i]));
            gl.drawArrays(gl.TRIANGLES, numDrawn, faceLengths[i]);
            numDrawn += faceLengths[i];
        }
        numLoaded = numFacesB4NextObj[objNum];
}

function drawCar(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),3.0);
    drawObj(2);
}
function drawBunnicula(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),1.0);
    drawObj(3);
}
function drawSign(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),5.0);
    drawObj(0);
}

function drawStreet(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),4.0);
    drawObj(1);
}

function drawLamp(){
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),2.0);
    drawObj(4);
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

    }
    else if(event.key === 's' || event.key === 'S'){

    }
    else if(event.key === 'f' || event.key === 'F'){

    }
}

function configTexture(imageURL,name, textureNum){
    let image = new Image();
    image.crossOrigin="";
    image.src=imageURL;
    image.onload = function() {
        let tex = gl.createTexture();
        gl.activeTexture(textureNum);
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

