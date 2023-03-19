let model
let knn = new kNear(10);
let videoWidth, videoHeight
let ctx, canvas


let  thumbsUpButton = document.querySelector('#thumbsUp')
thumbsUpButton.addEventListener("click", ()=> trainKnn('thumbsUp'))

let  thumbsDownButton = document.querySelector('#thumbsDown')
thumbsDownButton.addEventListener("click", ()=> trainKnn('thumbsDown'))

let  heartButton = document.querySelector('#heart')
heartButton.addEventListener("click", ()=> trainKnn('heart'))

let  batmanButton = document.querySelector('#batman')
batmanButton.addEventListener("click", ()=> trainKnn('batman'))

let  predictButton = document.querySelector('#predict')
predictButton.addEventListener("click", ()=> knnPredict('predict'))

const log = document.querySelector("#array")
const prediction = document.querySelector('#prediction')
const VIDEO_WIDTH= 800
const VIDEO_HEIGHT= 400

async function trainKnn(pose) {
const predictions = await model.estimateHands(video)
    if(predictions.length>0){
        let handPose =[];
        for(let i =0 ; i <10; i++)
        {
            handPose.push(predictions[0].landmarks[i][0])
            handPose.push(predictions[0].landmarks[i][1])

        }
        knn.learn(handPose, pose)
    }

}
async function knnPredict (){

    const predictions = await model.estimateHands(video)
    if(predictions.length > 0){
        let handPose =[];
        for(let i =0 ; i <10; i++)
        {
            handPose.push(predictions[0].landmarks[i][0])
            handPose.push(predictions[0].landmarks[i][1])

        }
        prediction.innerHTML = knn.classify(handPose);
    }else {
        prediction.innerText ="Doe een andere Pose"
    }

}

async function main(){
    model= await handpose.load()
    const video = await setupCamera()
    video.play()
    startLandmarkDetection(video)
}

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            "Webcam not available"
        )
    }

    const video = document.getElementById("video")
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
        }
    })
    video.srcObject = stream

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}
async function startLandmarkDetection(video) {

    videoWidth = video.videoWidth
    videoHeight = video.videoHeight

    canvas = document.getElementById("output")

    canvas.width = videoWidth
    canvas.height = videoHeight

    ctx = canvas.getContext("2d")

    video.width = videoWidth
    video.height = videoHeight

    ctx.clearRect(0, 0, videoWidth, videoHeight)
    ctx.strokeStyle = "pink"
    ctx.fillStyle = "pink"

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1) //omkeren van je webcam

    predictLandmarks()
}
async function predictLandmarks() {
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height)

    const predictions = await model.estimateHands(video) // ,true voor flip
    if (predictions.length > 0) {
        drawHand(ctx, predictions[0].landmarks, predictions[0].annotations)
    }
    requestAnimationFrame(predictLandmarks)
}

function drawHand ( ctx, keypoints, annotations){

    for (let i = 0; i<keypoints.length; i++){
        const x= keypoints[i][1]
        const y = keypoints[i][0]
        drawPoint(ctx,x-2, y -2, 3)
    }

    let palmBase = annotations.palmBase[0]
    for(let key in annotations){
        const finger = annotations[key]
        finger.unshift(palmBase)
        drawPath(ctx, finger, false)
    }
}

function drawPoint(){
    ctx.beginPath()
    ctx.arc(x ,y ,r,0,3 * Math.PI)
ctx.fill()
}

function drawPath (ctx, points, closePath){
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])
    for (let i= 1; i<points.length; i++){
        const point = points[i]
        region.lineTo(point[0], point[1])
    }
    if (closePath){
        region.closePath()
    }
    ctx.stroke(region)
}
main()
