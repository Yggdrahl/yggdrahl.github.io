let fpsSelectInput;
let customFPSInput;
let fpsHintElement;
let timeHourInput;
let timeMinuteInput;
let timeSecondInput;
let timeFrameInput;
let frameCalcInput;
let calcFramesButton;
let calcTimeButton;
let resultFrameLabel;
let resultTimeLabel;

let fps = 30; //default
let frameDigits = 2;
let lastEnteredCustomFPS = 30;
//let time = "00:00:00";

document.addEventListener("DOMContentLoaded", function() {
    fpsSelectInput = document.querySelector("#fpsSelect");
    customFPSInput = document.querySelector("#customFPS");
    fpsHintElement = document.querySelector("#fpsHint");
    timeHourInput = document.querySelector("#hour");
    timeMinuteInput = document.querySelector("#minute");
    timeSecondInput = document.querySelector("#second");
    timeFrameInput = document.querySelector("#frame");

    frameCalcInput = document.querySelector("#frameCalc");

    calcFramesButton = document.querySelector("#calculateFrames");
    calcTimeButton = document.querySelector("#calculateTime");
    resultFrameLabel = document.querySelector("#resultFrames");
    resultTimeLabel = document.querySelector("#resultTime");

    //Tets, if the "time"  input is supported
    const test = document.createElement("input");

    try {
        test.type = "time";
    } catch (e) {
        console.log(e.description);
    }

    if (test.type === "text") {
        console.warn("Time input is not supported");
    }

    calcTimeButton.onclick = calcTime;
    calcFramesButton.onclick = calcFrames;
    
    //FPS Input-----------    

    fpsSelectInput.onchange = function(e) {

        if(e.target.value == "custom") {
            customFPSInput.style.display = "inline-block";
            customFPSInput.disabled = false;
            customFPSInput.value = lastEnteredCustomFPS;
            fps = Number(lastEnteredCustomFPS);
        } else {
            customFPSInput.style.display = "none";
            customFPSInput.disabled = true;
            customFPSInput.blur();

            fps = Number(fpsSelectInput.value);
        }
        frameDigits = String(fps-1).length;
        validateTime();
        resultTimeLabel.innerHTML = resultFrameLabel.innerHTML = "=";
    };
    
    customFPSInput.onchange = function(e) {
        if(Number(customFPSInput.value) > 999) {
            customFPSInput.value = 999;
        } else if(Number(customFPSInput.value) <= 0) {
            customFPSInput.value = 1;
        } 

        customFPSInput.value = Math.round(Number(customFPSInput.value));
        lastEnteredCustomFPS = fps = Number(customFPSInput.value);

        frameDigits = String(fps-1).length;
        /*
        let zeroes = "";
        for(let i = 0; i < frameDigits; i++) {
            zeroes += "0";
        }
        timeFrameInput.value = zeroes;
        */
        validateTime();
        resultTimeLabel.innerHTML = resultFrameLabel.innerHTML = "=";
    }

    timeHourInput.onchange = timeHourInput.oninput =
    timeMinuteInput.onchange = timeMinuteInput.oninput =
    timeSecondInput.onchange = timeSecondInput.oninput =
    timeFrameInput.onchange = timeFrameInput.oninput = validateTime;

    function validateTime(e) {
        
        let hour = Number(timeHourInput.value);
        let minute = Number(timeMinuteInput.value);
        let second = Number(timeSecondInput.value);
        let frame = Number(timeFrameInput.value);
        let frameValueDigits = String(frame).length;
        let frameMissingDigits = 0;

        if(hour % 1 != 0) {
            hour = Math.round(hour);
        }
        if(minute % 1 != 0) {
            minute = Math.round(minute);
        }
        if(second % 1 != 0) {
            second = Math.round(second);
        }
        if(frame % 1 != 0) {
            frame = Math.round(frame);
        }

        //
        
        if(frame < 0) {
            frame = 0;
        } else if(frame >= fps) {
            frame = fps-1;
            //second += 1;
        }

        if(second < 0) {
            second = 0;
        } else if(second > 59) {
            second = 59;
            //minute += 1;
        }

        if(minute < 0) {
            minute = 0;
        } else if(minute > 59) {
            minute = 59;
            //hour += 1;
        }

        if(hour < 0) {
            hour = 0;
        } else if(hour > 23) {
            hour = 23;
        }


        if(hour < 10) {
            hour = "0" + hour;
        }
        if(minute < 10) {
            minute = "0" + minute;
        }
        if(second < 10) {
            second = "0" + second;
        }

        frameMissingDigits = frameDigits - frameValueDigits;
        if(frameMissingDigits > 0) {
            let missingDigits = "";
            for(let i = 0; i < frameMissingDigits; i++) {
                missingDigits += "0";
            }
            frame = missingDigits + frame;
        }


        timeHourInput.value = hour;
        timeSecondInput.value = second;
        timeMinuteInput.value = minute;
        timeFrameInput.value = frame;
    }
    
});

//---

function calcTime() {

    frames = Number(frameCalcInput.value);
      
    let sec = min = hrs = 0;
    let framesRest = frames % fps;
    frames = Math.round(frames);
    sec = Math.floor(frames / fps);
    min = Math.floor(sec / 60);
    sec = sec - (min * 60);
    hrs = Math.floor(min / 60);
    min = min - (hrs * 60);

    if(sec < 10) {
        sec = "0" + sec;
    }
    if(min < 10) {
        min = "0" + min;
    }
    if(hrs < 10) {
        hrs = "0" + hrs;
    }

    let finalMissingDigits = frameDigits - String(framesRest).length;
    if(finalMissingDigits > 0) {
        let str = "";
        for(let i = 0; i < finalMissingDigits; i++) {
            str += "0";
        }
        framesRest = str + "" + framesRest;
    }
    
    resultTimeLabel.innerHTML = "= " + hrs + ":" + min + ":" + sec + ":" + framesRest;
}

function calcFrames() {
    resultFrameLabel.innerHTML = "= " + String(((Number(timeHourInput.value) * 60 + Number(timeMinuteInput.value)) * 60 + Number(timeSecondInput.value)) * fps + Number(timeFrameInput.value));
}