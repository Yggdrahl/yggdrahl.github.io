let assets = null;
let initialized = false;
let currentTab = 0;


//---Support
let mobileDevice = false;
let xrSupport = false;

//---Menu
let mainScene;
let menuWrapper;
let tabsButtonsContainer;
let menuButtons;
let tabsContainer;
let tabs;
let fullscreenButton;
let webxrMenu;
let arButton;
let selectionText;
let thumbnailWrapper;
let supportDialog;
let webxrUI;
let loadingscreen;
let ladebalken;
let xrMenu;
let stabilizationPrompt;
let interactionPrompt;
//--Menu xrScene
let xrCloseBTN;
let xrResetBTN;
let xrFrameBTN;
let xrSaddleBTN;
let xrWheelsBTN;
//-Anmationen
let animationDuration = 250;
let menuAnimation;
let tabsContainerAnimation;
let menuOpen = true;
let webxrUiAnimation;
let loadingScreenAnimation;


let bikeId = -1; //Welches Fahrrad ist aktuell ausgefwählt?

let aboutTabId = -1;


const xhr = new XMLHttpRequest();
xhr.onreadystatechange = async function () {
    if (xhr.readyState === 4) {
        if (xhr.status == 200) {
            if (xhr.response) {
                assets = JSON.parse(xhr.response);
                await checkXrSupport().then(generateBicycleButtons);
                //changeTab(null, 0);
                
            }
        }
    }
}


document.addEventListener("DOMContentLoaded", initializeDOMElements);

function initializeDOMElements() {

  mainScene = document.querySelector('.mainScene');
  menuWrapper = document.querySelector('.menuWrapper');
  tabsButtonsContainer = document.querySelector('.tabButtons');
  menuButtons = tabsButtonsContainer.querySelectorAll('Button');
  tabsContainer = document.querySelector('.tabs');
  tabs = tabsContainer.querySelectorAll('.tab');
  fullscreenButton = document.querySelector('.toolbar').querySelector('button');
  webxrMenu = document.querySelector('.webxrMenu');
  selectionText = webxrMenu.querySelector('p');
  arButton = webxrMenu.querySelector('button');
  thumbnailWrapper = document.querySelector('.thumbnailWrapper');
  supportDialog = document.querySelector('.supportDialog');
  webxrUI = document.querySelector('.webxrUI');
  loadingscreen = document.querySelector('.loadingScreen');
  ladebalken = document.querySelector('.ladebalken');
  xrMenu = webxrUI.querySelector('.xrMenu');
  stabilizationPrompt = document.getElementById('stabilization');
  interactionPrompt = document.getElementById('interactionPrompt');
  xrCloseBTN = document.getElementById('btn_xrClose');
  xrResetBTN = document.getElementById('btn_xrReset');
  xrFrameBTN = document.getElementById('btn_frame');
  xrSaddleBTN = document.getElementById('btn_saddle');
  xrWheelsBTN = document.getElementById('btn_wheels');

  initAnimationObjects();

  //Hier werden Support-Angelegenheiten überprüft
  checkMobileSupport();
  changeTab(); //Zeigt die "Support-Tabs" an

  xhr.open('get', './assets/bicycles.json');
  xhr.send();

  //Div. EventHandler-------------------

  xrMenu.ontouchstart = xrTouchHandler;
  //xrMenu.ontouchstart = placeFahrrad; // [Platzhalter] ##################################
}

//---globale Listener

document.onfullscreenchange = function() {
  if(document.fullscreenElement) { //wir sind im Vollbild
    //Vollbild
    fullscreenButton.style.display = "none";
    fullscreenButton.disabled = true;
    if(currentTab == tabs.length-1) {
      changeTab();
    }
    
  } else {
    //kein Vollbild
    fullscreenButton.style.display = "inline-block";
    fullscreenButton.disabled = false;
  }
}

function enterFullscreen() {
  document.documentElement.requestFullscreen();
  screen.orientation.lock('landscape-primary').catch(function() {console.warn("Screen.orientation.lock is not supported");});
}

function exitFullscreen() {
  document.exitFullscreen();
}

//---Hilfsfunktionen

async function checkMobileSupport() {

  if(!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    
  mobileDevice = false;

  qrOnce = true;
  let qrCode = QRCode.generateSVG(document.URL, {
    ecclevel: "M",
    fillcolor: "#FFFFFF",
    textcolor: "#000000",
    margin: 2,
    modulesize: 8
  });
  
  document.querySelector('.qrCode').appendChild(qrCode);  
  
  } else {
    mobileDevice = true;
  }
}

async function checkXrSupport() {
  if(navigator.xr) {
    xrSupport = await navigator.xr.isSessionSupported("immersive-ar");
    return xrSupport;
  }
  return false;
}

function initAnimationObjects() {
  menuAnimation = menuWrapper.animate([
    {
        left: "0px",
        offset: 0.0
    },
    {
      left: "-180px",
      offset: 1.0
    }
  ], {
    duration: animationDuration,
    iterations: 1,
    fill: 'forwards',
    easing: 'linear'
  });

  tabsContainerAnimation = tabsContainer.animate([
    {
      opacity: "1",
      offset: 0.0
    },
    {
      opacity: "0",
      offset: 1.0
    }
  ], {
    duration: animationDuration,
    iterations: 1,
    fill: 'forwards',
    easing: 'linear'
  });

  loadingScreenAnimation = loadingscreen.animate([
    {
        bottom: "0px",
        offset: 0.0
    },
    {
      bottom: "-70px",
      offset: 1.0
    }
  ], {
    duration: (animationDuration * 2),
    iterations: 1,
    fill: 'forwards',
    easing: 'linear'
  });
  
  webxrUiAnimation = webxrUI.animate([
    {
      backgroundColor: "rgba(235,235,235,1)",
      offset: 0.0
    },
    {
      backgroundColor: "rgba(235,235,235,0)",
      offset: 1.0
    }
  ], {
    duration: (animationDuration * 2),
    iterations: 1,
    fill: 'forwards',
    easing: 'linear'
  });
  

  menuAnimation.cancel();
  tabsContainerAnimation.cancel();
  webxrUiAnimation.cancel();
  loadingScreenAnimation.cancel();

  webxrUiAnimation.onfinish = function() {
    xrMenu.style.display="block";
  }

}

function generateBicycleButtons() {

  let fahrradWrapperElement;
  let thumbnailElement;
  let thumbnailImageElement;
  let fahrradTextElement;

  for(let i = 0; i < assets.length; i++) {
    fahrradWrapperElement = document.createElement('div');
    thumbnailElement = document.createElement('div');
    thumbnailImageElement = document.createElement('img');
    fahrradTextElement = document.createElement('div'); //Das P Element einfach per innerHTML hinzufügen

    if(xrSupport) {
      fahrradWrapperElement.setAttribute('onclick', 'selectBike(' + i + ')');
      
    } else {
      fahrradWrapperElement.style.opacity=".5";
      fahrradWrapperElement.style.cursor="default";
      supportDialog.style.display = "block";
    }
    

    thumbnailImageElement.setAttribute('src', assets[i].thumbnail);
    thumbnailElement.appendChild(thumbnailImageElement);
    fahrradWrapperElement.appendChild(thumbnailElement);
    fahrradWrapperElement.appendChild(fahrradTextElement);
    fahrradTextElement.innerHTML = "<p>" + assets[i].name + "</p>";

    fahrradWrapperElement.classList.add("fahrradWrapper");
    fahrradTextElement.classList.add("fahrradText");
    thumbnailElement.classList.add("thumbnail");
    thumbnailImageElement.classList.add("thumbnailImage");

    thumbnailWrapper.appendChild(fahrradWrapperElement);
  }

}



//---allg. UI Handler

function changeTab(tab) {
  //console.log(evt.target);

  for (let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].className = menuButtons[i].className.replace('active', '');
    menuButtons[i].className = menuButtons[i].className.replace(' ', '');
  }

  //evt.target.className += "active";

  //Leert alle Tabs
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].className = tabs[i].className.replace('active', '');
    tabs[i].className = tabs[i].className.replace(' ', '');
  }

  if(!mobileDevice) {
    tabs[3].className += " active";
    currentTab = 3;

    //Ausnahme für den AGB Tab-----
    if(tab) {
      if(aboutTabId <= -1) {
        for(let i = 0; i < tabs.length; i++) {
          if(tabs[i].id=="about") {
            aboutTabId = i;
          }
        }
      }

      if(aboutTabId >= 0 && aboutTabId < tabs.length) {
        if(tab == aboutTabId) {

          tabs[3].className = "tab";
    
          menuButtons[tab].className += "active";
          tabs[tab].className += " active";
          currentTab = tab;
          webxrMenu.style.display = "none";
          selectionText.innerHTML = "";
          bikeId = -1;
        }
      }      
    }
    //-------------------------------
  } else if(!initialized) { //Bei ersten Aufruf den Tab mit dem Orientierungshinweis anzeigen

    initialized = true;
    tabs[tabs.length-1].className += " active";
    currentTab = tabs.length-1;

  } else if(tab >= 0) {
    if(tab < menuButtons.length) {
      menuButtons[tab].className += "active";
    }
    
    tabs[tab].className += " active";

    currentTab = tab;

    webxrMenu.style.display = "none";
    selectionText.innerHTML = "";
    bikeId = -1;
  } else { //Kein Tab
    currentTab = -1;
  }

}

function selectBike(id) {
  webxrMenu.style.display = "inline-block";
  bikeId = id;
  selectionText.innerHTML = assets[bikeId].name;
  
  assetCount = assets[bikeId].components.frames.length + assets[bikeId].components.wheels.length + assets[bikeId].components.saddles.length + 1;
  /*
  assetCount = new Array();
  assetCount.push(assets[bikeId].initialGltf);
  for(let i = 0; i < assets[bikeId].components.frames.length; i++) {
    if(!elementExits(assetCount, assets[bikeId].components.frames[i]) && assets[bikeId].components.frames[i]) {
      assetCount.push(assets[bikeId].components.frames[i]);
    }
  }
  for(let i = 0; i < assets[bikeId].components.wheels.length; i++) {
    if(!elementExits(assetCount, assets[bikeId].components.wheels[i]) && assets[bikeId].components.wheels[i]) {
      assetCount.push(assets[bikeId].components.wheels[i]);
    }
  }
  for(let i = 0; i < assets[bikeId].components.saddles.length; i++) {
    if(!elementExits(assetCount, assets[bikeId].components.saddles[i]) && assets[bikeId].components.saddles[i]) {
      assetCount.push(assets[bikeId].components.saddles[i]);
    }
  }
  */

  
  
  
}

function closeSupportDialog() {
  supportDialog.style.display = "none";
}


function closeMenu() {

  if(!menuOpen) {
    return;
  }

  menuOpen = false;

  webxrMenu.style.display = "none";
  //arButton.disabled = true;
  selectionText.innerHTML = "";

  for(let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].disabled = true;
  }
  
  menuAnimation.playbackRate = 1;
  tabsContainerAnimation.playbackRate = 1;
  menuAnimation.play();
  tabsContainerAnimation.play();
  

  menuAnimation.onfinish =  function() {
    menuWrapper.style.display="none";
  };
  tabsContainerAnimation.onfinish =  function() {
    tabsContainer.style.display="none";
  };
}

function openMenu() {

  if(menuOpen) {
    return;
  }

  menuOpen = true;

  menuWrapper.style.display="block";
  tabsContainer.style.display="inline-block";

  //arButton.disabled = false;
  for(let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].disabled = false;
  }

  menuAnimation.playbackRate = -1;
  tabsContainerAnimation.playbackRate = -1;
  menuAnimation.play();
  tabsContainerAnimation.play();
  
  
  menuAnimation.onfinish =  null;
  tabsContainerAnimation.onfinish =  null;
}