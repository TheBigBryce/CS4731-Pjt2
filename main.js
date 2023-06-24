let gl;
let vBufferSign,vNormalSign,vPositionSign,vNormalPositionSign, pointsArraySign = [], normalsArraySign = [];
let vBufferCar,vNormalCar,vPositionCar,vNormalPositionCar, pointsArrayCar = [], normalsArrayCar = [];

let eye;
var at = vec3(3.0, -2.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;
var near = .1;
var far = 100;
let program;

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



    eye = vec3(10,10,10);
    modelViewMatrix = lookAt(eye, at , up);
    var fovy = 30;
    projectionMatrix = perspective(fovy,1,near,far);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    vPositionSign = gl.getAttribLocation( program, "vPositionSign");
    vNormalPositionSign = gl.getAttribLocation( program, "vNormalSign");
    vPositionCar = gl.getAttribLocation( program, "vPositionCar");
    vNormalPositionCar = gl.getAttribLocation( program, "vNormalCar");


   render();
}


function loadStopSign(curObj){
    for(let i=0; i<curObj.faces.length; i++){
        let curFace = curObj.faces[i];
        for(let j=0; j<curFace.faceVertices.length; j++) {
            pointsArraySign.push(curFace.faceVertices[j]);
            normalsArraySign.push(curFace.faceNormals[j]);
        }
    }
    vBufferSign = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferSign);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArraySign), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPositionSign, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionSign);

    vNormalSign = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormalSign);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArraySign), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vNormalPositionSign, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPositionSign);
}

var id;
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),5.0);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag2"),5.0);
    if(stopSign.objParsed && stopSign.mtlParsed && !stopSign.loaded){
        loadStopSign(stopSign);
        stopSign.loaded=true;
    }
    gl.drawArrays(gl.TRIANGLES, 0, pointsArraySign.length);

    gl.uniform1f(gl.getUniformLocation(program,"drawFlag"),4.0);
    gl.uniform1f(gl.getUniformLocation(program,"drawFlag2"),4.0);
    if(car.objParsed && car.mtlParsed && !car.loaded){
        loadCar(car);
        car.loaded=true;
    }
    gl.drawArrays(gl.TRIANGLES, 0, pointsArrayCar.length);
    id = requestAnimationFrame(render);
}


function loadCar(curObj){
    for(let i=0; i<curObj.faces.length; i++){
        let curFace = curObj.faces[i];
        for(let j=0; j<curFace.faceVertices.length; j++) {
            pointsArrayCar.push(curFace.faceVertices[j]);
            normalsArrayCar.push(curFace.faceNormals[j]);
        }
    }

    console.log(pointsArrayCar[2])
    console.log(pointsArrayCar.length);
    vBufferCar = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCar);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArrayCar), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPositionCar, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionCar);

    vNormalCar = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormalCar);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArrayCar), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vNormalPositionCar, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPositionCar);
}