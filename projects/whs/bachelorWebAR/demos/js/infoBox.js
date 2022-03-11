"use strict";

let infoBG = document.querySelector('.infoBG');
let infoButton = document.querySelector('.infoButton');
let infoBox = document.querySelector('.infoBox');

let infoClose = document.querySelector('.infoClose');

infoButton.onclick = openInfo;

let infoBGAnimation = infoBG.animate([
    {
        opacity: "0",
        offset: 0.0
    },
    {
        opacity: "1",
        offset: 1.0
    }
  ], {
    duration: 500,
    iterations: 1,
    fill: 'forwards',
    easing: 'linear'
  });
  infoBGAnimation.cancel();

  let infoButtonAnimation = infoButton.animate([
    {
        left: "12px",
        width: "40px",
        backgroundColor: "rgb(250,250,250)",
        offset: 0.0
    },
    {
      left: "calc(50% - 42px)",
      width: "100px",
      backgroundColor: "rgb(210,210,210)",
      offset: 1.0
    }
  ], {
    duration: 500,
    iterations: 1,
    fill: 'forwards',
    easing: 'ease-out'
  });
  infoButtonAnimation.cancel();

  let infoBoxAnimation = infoBox.animate([
    {
        height: "0px",
        offset: 0.0
    },
    {
        height: "calc(80% - 32px)",
      offset: 1.0
    }
  ], {
    duration: 500,
    iterations: 1,
    fill: 'forwards',
    easing: 'ease-out'
  });
  infoBoxAnimation.cancel();



  

function openInfo() {

    infoButton.onclick = null;
    //infoBG.onclick = null;

    infoBG.style.display = "block";
    infoBGAnimation.playbackRate = 1;
    infoBGAnimation.play();

    infoButtonAnimation.playbackRate = 1;
    infoButtonAnimation.play();
    infoButtonAnimation.onfinish = function() {
        infoButtonAnimation.onfinish = null;
        infoBoxAnimation.playbackRate = 1;
        infoBoxAnimation.play();
        infoBoxAnimation.onfinish = function() {
            infoBoxAnimation.onfinish = null;
            infoBG.onclick = closeInfo;
            infoClose.onclick = closeInfo;
        }
    }
}

function closeInfo() {

    //infoButton.onclick = null;
    infoBG.onclick = null;
    infoClose.onclick = null;
    
    infoBoxAnimation.playbackRate = -1;
    infoBoxAnimation.play();

    infoBoxAnimation.onfinish = function() {
        infoBoxAnimation.onfinish = null;
        infoBGAnimation.playbackRate = -1;
        infoBGAnimation.play();
        infoButtonAnimation.playbackRate = -1;
        infoButtonAnimation.play();
        infoBGAnimation.onfinish = function() {
            infoBGAnimation.onfinish = null;
            infoBG.style.display = "none";
            infoButton.onclick = openInfo;   
        }
    }

    

}