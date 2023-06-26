let gl;
let vBuffer,vNormalBuffer,vPosition,vNormalPosition;
let pointsArray = [], normalsArray = [], faceLengths = [], matDiffuses = [], matSpeculars = [];
let numFacesB4NextObj = [];
let numDrawn=0;
let numObjloaded=0;

var lightPosition = vec4(0.0, 3.0, 0.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

let ctMatrixLoc;
let eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;
var near = .1;
var far = 100;
let program;

let cameraX = 13;
let cameraY = 10;
let theta = 0;
let animateCamera = false;
let onlyAmbient = 0.0;
let lightChange=false;

// Get the stop sign
let stopSign = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.mtl");

// Get the lamp
let lamp = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.mtl");

// Get the car
let car = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.mtl");

// Get the street
let street = new Model(
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.mtl");

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



    eye = vec3(cameraX,cameraY,0);
    modelViewMatrix = lookAt(eye, at , up);
    var fovy = 30;
    projectionMatrix = perspective(fovy,1,near,far);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    ctMatrixLoc = gl.getUniformLocation(program, "translate");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    //setting up light uniforms
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "lightDiffuse"), flatten(lightDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "lightSpecular"), flatten(lightSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, "lightAmbient"), flatten(lightAmbient));
    gl.uniform1f(gl.getUniformLocation(program, "onlyAmbient"), onlyAmbient);

    //Getting the location of attributes in the index.html for all objects
    vPosition = gl.getAttribLocation( program, "vPosition");
    vNormalPosition = gl.getAttribLocation( program, "vNormal");

   render();
}


var id;
function render(){
    numDrawn=0;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(translate(3,1,1)));

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

    //Load and draw stop Sign
    checkObjandLoad(stopSign);
    checkObjandLoad(street);
    checkObjandLoad(car);
    checkObjandLoad(lamp);
    checkObjandLoad(bunnicula);



    drawObj(4);
    id = requestAnimationFrame(render);
}

function checkObjandLoad(curObj){
    if(curObj.objParsed && curObj.mtlParsed && !curObj.loaded){
        for(let i=0; i<curObj.faces.length; i++){
            let curFace = curObj.faces[i];
            for(let j=0; j<curFace.faceVertices.length; j++) {
                pointsArray.push(curFace.faceVertices[j]);
                normalsArray.push(curFace.faceNormals[j]);

            }
            let currentDiffuse = curObj.diffuseMap.get(curFace.material);
            let currentSpecular = curObj.specularMap.get(curFace.material);
            faceLengths.push (curFace.faceVertices.length);
            matDiffuses.push (vec4(currentDiffuse[0],currentDiffuse[1],currentDiffuse[2],currentDiffuse[3]));
            matSpeculars.push (vec4(currentSpecular[0],currentSpecular[1],currentSpecular[2],currentSpecular[3]));
        }
        curObj.loaded=true;
        numObjloaded+=1;
        if(numFacesB4NextObj.length===0)
            numFacesB4NextObj[0]=curObj.faces.length;
        else
            numFacesB4NextObj.push(curObj.faces.length+numFacesB4NextObj[numFacesB4NextObj.length-1]);
        if(numObjloaded===5){
            loadBuffer();
        }
    }
}

function drawObj(objNum){
    let drawFlagVal=5.0;
    let numLoaded = 0;
    for(let j=0; j<=objNum; j++) {
        gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),drawFlagVal);
        for (let i = numLoaded; i < numFacesB4NextObj[j]; i++) {
            gl.uniform4fv(gl.getUniformLocation(program, "matDiffuse"), flatten(matDiffuses[i]));
            gl.uniform4fv(gl.getUniformLocation(program, "matSpecular"), flatten(matSpeculars[i]));
            gl.drawArrays(gl.TRIANGLES, numDrawn, faceLengths[i]);
            numDrawn += faceLengths[i];
        }
        numLoaded = numFacesB4NextObj[j];
        drawFlagVal-=1.0;
    }
}

function loadBuffer(){
    vBuffer = gl.createBuffer();
    vNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);
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

    }
    else if(event.key === 'd' || event.key === 'D'){

    }
    else if(event.key === 'r' || event.key === 'R'){

    }
    else if(event.key === 's' || event.key === 'S'){

    }
    else if(event.key === 'f' || event.key === 'F'){

    }
}



