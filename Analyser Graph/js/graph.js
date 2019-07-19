let audioContext;

let micNode;
let scriptNode;
let analyserNode;

let canvasArray = [];
let contextArray = [];

// analyser object
let analyser = new Analyser({
    fftSize: 512 / 2,
    smoothingTimeConstant: 0.8
});


window.onload = function () {

    // get canvases and there context
    for (let i = 1; i <= 4; i++) {

        let canvasDOM = document.getElementById("canvas" + i);
        canvasDOM.width = window.innerWidth / 2;
        canvasDOM.height = 130;

        let context = canvasDOM.getContext("2d");
        canvasArray.push(canvasDOM);
        contextArray.push(context);
    }
};


// initialize audio context and nodes
function init() {

    // stop
    if (audioContext != undefined) {

        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;

        audioContext.close();
        audioContext = undefined;

        document.getElementById("button").style.backgroundColor = "rgb(224, 52, 52)";
        return;
    }

    audioContext = new AudioContext();

    // ask user for microphone permission
    if (navigator.mediaDevices.getUserMedia) {

        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {

            // create media stream node
            micNode = audioContext.createMediaStreamSource(stream);

            // create script processor node
            scriptNode = audioContext.createScriptProcessor(analyser.fftSize, 1, 1);
            scriptNode.onaudioprocess = process;
            scriptNode.connect(audioContext.destination);
            micNode.connect(scriptNode);

            // create analyser node
            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = analyser.fftSize;
            micNode.connect(analyserNode);

            document.getElementById("button").style.backgroundColor = "rgb(128, 255, 78)";

        }).catch(function (err) {
            throw 'Error capturing audio.';
        });
    }
};



let buffer = null;
let animationFrameId;
/**
 * Called when the processor node, processes audio data
 * from the microphone
 * @param {*} e 
 */
function process(e) {
    buffer = e.inputBuffer.getChannelData(0); // set buffer (mono, 1 channel)

    if (animationFrameId == undefined) {
        animationFrameId = requestAnimationFrame(update);  // request graph update
    }
}


// update graphs
function update() {

    let canvas;
    let context;
    let fftSize = analyser.fftSize;
    let frequencyData = analyser.getByteFrequencyData(buffer); // get frequency data as byte array


    // canvas1 (bars)
    canvas = canvasArray[0];
    context = contextArray[0];

    let barWidth = (canvas.width / fftSize) * 2.5;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";

    for (let i = 0; i < fftSize; i++) {

        let barHeight = (frequencyData[i] - 40) / 2;
        let x = (barWidth + 1) * i;
        let y = canvas.height - barHeight;
        context.fillRect(x, y, barWidth, barHeight);
    }
    context.fillText("Using bars", 10, 20);





    // canvas2 (curves)
    canvas = canvasArray[1];
    context = contextArray[1];

    let curve = new Curve({ context: context });  // curve object

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < fftSize; i++) {
        let barHeight = (frequencyData[i] - 40) / 2;
        let x = (barWidth + 1) * i;
        let y = canvas.height - barHeight;
        curve.add(x, y);
    }
    curve.points[0].y = canvas.height;
    curve.points[curve.points.length - 1].y = canvas.height;
    curve.draw();

    context.fillText("Using curves", 10, 20);




    // canvas3 (centered bars)
    canvas = canvasArray[2];
    context = contextArray[2];

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";

    for (let i = 0; i < fftSize; i++) {
        let barHeight = (frequencyData[i] - 60) / 2;
        if (barHeight < 1) {
            barHeight = 1; // set minimum
        }
        let x = (barWidth + 1) * i;
        let y = (canvas.height - barHeight) / 2;
        context.fillRect(x, y, barWidth, barHeight);
    }
    context.fillText("Using centered bars", 10, 20);





    // canvas4 (centered curves)
    canvas = canvasArray[3];
    context = contextArray[3];

    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw top curves
    curve = new Curve({ context: context });
    for (let i = 0; i < fftSize; i++) {

        let barHeight = (frequencyData[i] - 60) / 2;
        if (barHeight < 1) {
            barHeight = 1; // set minimum
        }
        let x = (barWidth + 1) * i;
        let y = (canvas.height - barHeight) / 2;
        curve.add(x, y);
    }
    curve.points[0].y = canvas.height / 2;
    curve.points[curve.points.length - 1].y = canvas.height / 2;
    curve.draw();

    // draw bottom curves
    curve = new Curve({ context: context });
    for (let i = 0; i < fftSize; i++) {
        let barHeight = (frequencyData[i] - 60) / 2;
        if (barHeight < 1) {
            barHeight = 1; // set minimum
        }
        let x = (barWidth + 1) * i;
        let y = (canvas.height - barHeight) / 2 + barHeight;
        curve.add(x, y);
    }
    curve.points[0].y = canvas.height / 2;
    curve.points[curve.points.length - 1].y = canvas.height / 2;
    curve.draw();

    context.fillText("Using centered curves", 10, 20);


    animationFrameId = requestAnimationFrame(update); // request graph update
}