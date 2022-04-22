let imageStartButton = document.getElementById('imageTracking').querySelector('button');
let mindarUI = document.querySelector('.mindarUI');
let imageSpinnerWrapper = document.querySelector('.imageSpinnerWrapper');
let mindCloseBTN = document.getElementById('btn_mindClose');
let container = document.querySelector(".canvasContainer");
let alreadyFullscreen = false;

let mindarUiOverlay;
let scanner;

imageStartButton.onclick = activateImageTracking;
mindCloseBTN.onclick = endImageTracking;

const THREE = window.MINDAR.IMAGE.THREE;
const mindarThree = new window.MINDAR.IMAGE.MindARThree({
	container: container,
	imageTargetSrc: "./assets/imageTracking/targets.mind"
});
const {renderer, scene, camera} = mindarThree;
      const anchor = mindarThree.addAnchor(0);
      const geometry = new THREE.PlaneGeometry(1, 0.55);
      const material = new THREE.MeshBasicMaterial( {color: 0x00ffff, transparent: true, opacity: 0.5} );
      const plane = new THREE.Mesh( geometry, material );
      anchor.group.add(plane);

async function activateImageTracking() {

    alreadyFullscreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

        if(!alreadyFullscreen) {
        setTimeout(function() {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        },250);
        }

    if(!mindarUiOverlay) {
        mindarUiOverlay = document.querySelectorAll('.mindar-ui-overlay');
        for(let i = 0; i < mindarUiOverlay.length; i++) {
            if(mindarUiOverlay[i].className.indexOf("scanning") >= 0) {
                scanner = mindarUiOverlay[i];
            }
        }
    }
    

    window.document.body.style.backgroundColor = "rgb(55,55,55)";

    mindarUI.style.display = "block";
    closeMenu();
    await mindarThree.start();
	renderer.setAnimationLoop(() => {
	  renderer.render(scene, camera);
	});

}

function endImageTracking() {

    if (!alreadyFullscreen) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    scanner.className += " hidden";

    window.document.body.style.backgroundColor = "rgb(235, 235, 235)";

    mindarThree.stop();
	mindarThree.renderer.setAnimationLoop(null);

    //imageSpinnerWrapper.style.display = "block";
    mindarUI.style.display = "";
    openMenu();
}
