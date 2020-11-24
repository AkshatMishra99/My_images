const video = document.getElementById("my-video");
console.log("working");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: {}, audio: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => console.log(err));
}
video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        console.log(detections);

        const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
        );
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
});
function loadLabeledImages() {
    const labels = [
        "Akki Boy",
        // "Black Widow",
        // "Captain America",
        // "Captain Marvel",
        // "Hawkeye",
        // "Jim Rhodes",
        // "Thor",
        // "Tony Stark",
    ];
    return Promise.all([
        labels.map(async (label) => {
            const descriptions = [];
            for (let i = 1; i <= 13; i++) {
                const img = await faceapi.fetchImage(
                    `/labeled_images/${label}/${i}.jpg`
                );
                const detections = await faceapi
                    .detectSingleFace(video)
                    .withFaceLandmarks()
                    .withFaceDescriptors();
                descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        }),
    ]);
}
