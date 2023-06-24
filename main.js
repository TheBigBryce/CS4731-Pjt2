let vBuffer;
let vNormal;
let gl;
let vPosition;
let eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;
var near = .1;
var far = 100;
let program;
let pointsArray, normalsArray;
let vNormalPosition;

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
let bunny = new Model(
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



    eye = vec3(10,10,40);
    modelViewMatrix = lookAt(eye, at , up);
    var fovy = 30;
    projectionMatrix = perspective(fovy,1,near,far);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    vPosition = gl.getAttribLocation( program, "vPosition");
    vNormalPosition = gl.getAttribLocation( program, "vNormal");

    pointsArray = [];
    normalsArray = [];


   render(stopSign);
}


function loadObj(curObj){
    pointsArray = [];
    normalsArray = [];
    for(let i=0; i<curObj.faces.length; i++){
        let curFace = curObj.faces[i];
        for(let j=0; j<curFace.faceVertices.length; j++) {
            pointsArray.push(curFace.faceVertices[j]);
            normalsArray.push(curFace.faceNormals[j]);
        }
    }
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);
}

var id;
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    if(stopSign.objParsed && stopSign.mtlParsed && !stopSign.loaded){
        loadObj(stopSign);
        stopSign.loaded=true;
    }

    gl.drawArrays(gl.POINTS, 0, pointsArray.length);
        id = requestAnimationFrame(render);
}