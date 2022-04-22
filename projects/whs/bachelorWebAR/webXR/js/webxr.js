class ladeObjekt {
  responseURL;
  progress;

  constructor(responseURL) {
    
    this.responseURL = responseURL;
    this.progress = 0;
  }

}


THREE.Cache.enabled = true; //Jedes geladene Modell wird im Heap behalten (keine Mome-Funktion nötig)
let xrScene;
let xrCanvas;
let gl;
let loader = new THREE.GLTFLoader();

//let assetCount; //Wie viele Assets liegen für das aktuelle Fahrrad vor
let assetCount; //Welche Assets liegen wirklich für das aktuelle Fahrrad vor
let openURL_Requests;

let axisFrontPos;
let axisBackPos;
let saddlePos;
let framePos;

let currentSaddle;
let currentFrame;
let currentWheelFront;
let currentWheelBack;

let frameIndex = 0;
let saddleIndex = 0;
let wheelIndex = 0;

let xrSceneCache;
//let initOutlineQueue;

let fahrradPlaced = false;

let session;
let sessionActive = false;

let ladeArray = new Array();
let loadedModels = 0;

let touchedOnce = false; //Für die 'interactionPrompt'
let interactionPromptTimeout;

// QubeMap/EnvMap---
let envMap = null;
/*
const path = './assets/cubeMaps/rectaungular/';
const format = '.jpg';
envMap = new THREE.CubeTextureLoader().load( [
  path + 'posx' + format, path + 'negx' + format,
  path + 'posy' + format, path + 'negy' + format,
  path + 'posz' + format, path + 'negz' + format
] );
*/
envMap = new THREE.TextureLoader().load( './assets/cubeMaps/equirec/envMap01.jpg' );
envMap.mapping = THREE.EquirectangularReflectionMapping;
envMap.magFilter = THREE.LinearFilter;
envMap.minFilter = THREE.LinearMipMapLinearFilter;

//Variablen aus index.js-------------------
//assetCount


function findArrayPosition(responseURL) {

  if(ladeArray.length == 0) {
    return -1;
  }

  for(let i = 0; i < ladeArray.length; i++) {
    if(ladeArray[i].responseURL == responseURL) {
      return i;
    }
  }

  return -1;
}

function calcLoadingProgress(lengthComputable) {

  let result = 0;

  if(ladeArray.length == 0) {
    return -1;
  }

  if(lengthComputable) {
    for(let i = 0; i < ladeArray.length; i++) {
      result += ladeArray[i].progress;    
    }
  
    ladebalken.style.width = ((result / assetCount) * 100) + "%";
    return ((result / assetCount) * 100);
  } else {
    result = (loadedModels / assetCount) * 100;
    ladebalken.style.width = result + "%";
    console.log("Loading: " + result + "%");
    return result;
  }

  

}


function elementExits(gltfArray, gltfURL) {

  for(let i = 0; i < gltfArray.length; i++) {
    if(gltfArray[i] == gltfURL) {
      return true;
    }
  }
  return false;
}


async function activateXR() {

    sessionActive = true;

    webxrUI.style.display = "block";
    //mainScene.style.pointerEvents = "none";
    closeMenu();

    xrCloseBTN.onclick = function() {session.end();}
    xrResetBTN.onclick = resetFahrrad;
    xrFrameBTN.onclick = changeFrame;
    xrSaddleBTN.onclick = changeSaddle;
    xrWheelsBTN.onclick = changeWheels;

    if(assets[bikeId].components.frames.length <= 1) {
      xrFrameBTN.disabled = true;
      xrFrameBTN.style.opacity = .5;
    } else {
      xrFrameBTN.disabled = false;
      xrFrameBTN.style.opacity = 1;
    }
    if(assets[bikeId].components.saddles.length <= 1) {
      xrSaddleBTN.style.disabled = true;
      xrSaddleBTN.style.opacity = .5;
    } else {
      xrSaddleBTN.style.disabled = false;
      xrSaddleBTN.style.opacity = 1;
    }
    if(assets[bikeId].components.wheels.length <= 1) {
      xrWheelsBTN.style.disabled = true;
      xrWheelsBTN.style.opacity = .5;
    } else {
      xrWheelsBTN.style.disabled = false;
      xrWheelsBTN.style.opacity = 1;
    }
    

    loader.load(assets[bikeId].initialGltf,initalLoading_onLoad,loader_onProgress,loader_onError);
    
  if(assetCount > 1) {
    for(let i = 0; i < assets[bikeId].components.frames.length; i++) {
      if(assets[bikeId].components.frames[i]) {
        loader.load(assets[bikeId].components.frames[i], component_onLoad, loader_onProgress, loader_onError);
      }
    }
    for(let i = 0; i < assets[bikeId].components.wheels.length; i++) {
      if(assets[bikeId].components.wheels[i]) {
        loader.load(assets[bikeId].components.wheels[i], component_onLoad, loader_onProgress, loader_onError);
      }
    }
    for(let i = 0; i < assets[bikeId].components.saddles.length; i++) {
      if(assets[bikeId].components.saddles[i]) {
        loader.load(assets[bikeId].components.saddles[i], component_onLoad, loader_onProgress, loader_onError);
      }
    }
  }

    

    function initalLoading_onLoad(gltf) {//OnLoad wird auch bei THREE.cache gecalled (onProgress nicht)
      ++loadedModels;
      if(!sessionActive) {
        THREE.Cache.clear();
        return ;
      }
      addEnvMap(gltf, true);
      xrScene.add(gltf.scene);
      initiateBike();
    }

    function component_onLoad(gltf) {
      ++loadedModels;
      if(!sessionActive) {
        THREE.Cache.clear();
        return ;
      }
      initiateBike();
    }

    async function initiateBike() {
      if(loadedModels >= assetCount) { //Die Szene wurde fertig geladen. Nun kann die Outline generiert werden (muss von progress >= 100 getrennt werden)
        
        await loader.load(assets[bikeId].components.frames[0], function(gltf) {currentFrame = gltf.scene; addEnvMap(gltf); checkLoading();}, null, loader_onError);
        await loader.load(assets[bikeId].components.saddles[0], function(gltf) {currentSaddle = gltf.scene; addEnvMap(gltf);  checkLoading();}, null, loader_onError);
        await loader.load(assets[bikeId].components.wheels[0], function(gltf) {currentWheelBack = gltf.scene; addEnvMap(gltf); currentWheelFront = currentWheelBack.clone();  checkLoading();}, null, loader_onError);
        //currentWheelFront = currentWheelBack.clone();

        checkLoading();        
      }
    }

    function checkLoading() {
      if(loadedModels >= assetCount) {
        if(currentFrame && currentSaddle && currentWheelBack && currentWheelFront) {
          currentFrame.position.set(framePos.x, framePos.y, framePos.z);
          currentSaddle.position.set(saddlePos.x, saddlePos.y, saddlePos.z);
          currentWheelBack.position.set(axisBackPos.x, axisBackPos.y, axisBackPos.z);
          currentWheelFront.position.set(axisFrontPos.x, axisFrontPos.y, axisFrontPos.z);
        
          xrScene.add(currentFrame);
          xrScene.add(currentSaddle);
          xrScene.add(currentWheelBack);
          xrScene.add(currentWheelFront);

          generateOutline(xrScene);

          lockMenuRight(true);

          //interactionPromptTimeout = setTimeout(function() {
          //  interactionPrompt.style.display = "block";
          //},4000);
        
        }
      }
    }

    function loader_onProgress(xhr) {
      if(!sessionActive) {
        return ;
      }

      let ladeObjektIndex = findArrayPosition(xhr.currentTarget.responseURL);

      if(ladeObjektIndex >= 0) {
        
        ladeArray[ladeObjektIndex].progress = (xhr.loaded / xhr.total);        

      } else {
        let tmpLadeObjekt = new ladeObjekt(xhr.currentTarget.responseURL);
        tmpLadeObjekt.progress = (xhr.loaded / xhr.total);
        ladeArray.push(tmpLadeObjekt);
      }
      let progress = calcLoadingProgress(xhr.lengthComputable);
      //console.log(progress);
      if(progress >= 100) {
        webxrUiAnimation.play();
        loadingScreenAnimation.play();
        //setTimeout(function() { //Gibt dem Hinzufuegen der KindElemente zur Szene etwas Spielraum (manchmal ist das Child-Array unvollstaending)
        //  generateOutline(xrScene);
        //},250);
          
      }
    }

    function loader_onError(err) {
      console.log("Es ist ein Fehler aufgetretten" + err);
        
        if(sessionActive) {          
          session.end();
        }
    }

    function addEnvMap(gltf, initialGLTF) {

      gltf.scene.traverse(function(child) {
        if(child.isMesh) {
          child.material.envMap = envMap;
          if(initialGLTF) {
            if(child.name.indexOf("#saddle") >= 0) {
              saddlePos = child.position;
            } else if(child.name.indexOf("#frame") >= 0) {
              framePos = child.position;
            } else if(child.name.indexOf("#axisFront") >= 0) {
              axisFrontPos = child.position;
            } else if(child.name.indexOf("#axisBack") >= 0) {
              axisBackPos = child.position;
            }            
          }
        }
      });
    }

    
    //============================================================================
    // THREEjs Initialisierung
    //============================================================================

    xrScene = new THREE.Scene();
    xrScene.visible = false; //Es soll erst sichtbar werden, wenn wir ein ersten HitTestResult haben

    if(!xrCanvas) {
      xrCanvas = document.createElement('canvas');
      xrCanvas.setAttribute('id', "drawCanvas");
      gl = xrCanvas.getContext("webgl", { xrCompatible: true });

      //xrCanvas.ontouchstart = xrTouchHandler;
    }    
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, .9);
    directionalLight.position.set(10, 15, 10);
    xrScene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, .5);
    xrScene.add(ambientLight);
        
    //----------------------------------------------------------
    //Renderer
    //----------------------------------------------------------

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: xrCanvas,
    context: gl
  });
  renderer.autoClear = false;
  //helleres Licht und realistischere Farben
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  
  // The API directly updates the camera matrices.
  // Disable matrix auto updates so three.js doesn't attempt
  // to handle the matrices independently.
  const camera = new THREE.PerspectiveCamera();
  camera.matrixAutoUpdate = false;


  //============================================================================
  // WebXR Session Initialisierung
  //============================================================================

  // Initialize a WebXR session using "immersive-ar".
  session = await navigator.xr.requestSession("immersive-ar", {
    requiredFeatures: ['hit-test', 'dom-overlay'],
    optionalFeatures: ['dom-overlay'], //###
    domOverlay: {
      root: document.querySelector(".mainScene")//mainScene
    }
  });
  session.updateRenderState({
    baseLayer: new XRWebGLLayer(session, gl)
  });

  
  //----------------------------------------------------------
  //Mapping (Basic)
  //----------------------------------------------------------

  // A 'local' reference space has a native origin that is located
  // near the viewer's position at the time the session was created.
  const referenceSpace = await session.requestReferenceSpace('local');

  //---HitTest----------------
  // Create another XRReferenceSpace that has the viewer as the origin.
  const viewerSpace = await session.requestReferenceSpace('viewer');

  offsetViewerSpace = viewerSpace.getOffsetReferenceSpace(
        new XRRigidTransform({x:0, y:-0.35, z: 0}, {x:0, y:0, z:0, w: 1.0}));
  
  
  // Perform hit testing using the viewer as origin.
  const hitTestSource = await session.requestHitTestSource({ space: offsetViewerSpace, offsetRay : new XRRay({x: 0, y: 0}) });


  //----------------------------------------------------------
  //rekursiver RenderLoop (Deltafunktion)
  //----------------------------------------------------------

  session.requestAnimationFrame(onXRFrame);

  // Create a render loop that allows us to draw on the AR view.
  function onXRFrame(time, frame) {
    // Queue up the next draw request.
    session.requestAnimationFrame(onXRFrame);
  
    // Bind the graphics framebuffer to the baseLayer's framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);
    
  
    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(referenceSpace);
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0];
  
      const viewport = session.renderState.baseLayer.getViewport(view);
      renderer.setSize(viewport.width, viewport.height)
  
      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      camera.matrix.fromArray(view.transform.matrix)
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);



      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if(hitTestResults.length > 0 && window.getComputedStyle(stabilizationPrompt).getPropertyValue("display") != "none") {
        stabilizationPrompt.style.display = "none";
        xrScene.visible = true;
        interactionPromptTimeout = setTimeout(function() {
          interactionPrompt.style.display = "block";
        },4000);
        
      }
      /*
      if(hitTestResults.length > 0 && !fahrradPlaced) {
        const hitPose = hitTestResults[0].getPose(referenceSpace);
        
        xrScene.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
        xrScene.updateMatrixWorld(true);
        
        
      } else {
        xrScene.updateMatrixWorld(true);
      }
      */
      if(hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(referenceSpace);
        

        if(!fahrradPlaced) {
          xrScene.position.set(
            hitPose.transform.position.x,
            hitPose.transform.position.y,
            hitPose.transform.position.z
          );
          xrScene.updateMatrixWorld(true);
        }
        
        
        
      }
  
      // Render the scene with THREE.WebGLRenderer.
      renderer.render(xrScene, camera);
    }
  } 

    session.addEventListener('end', onSessionEnd);//WICHTIG (am Ende der activateXR Funktion)
}


function onSessionEnd() { //.then()-Promise der WebXR API

    
    loadedModels = 0;

    sessionActive = false;
    //mainScene.style.pointerEvents = "";

    webxrUI.style.display = "";
    xrMenu.style.display = "";

    ladeArray = new Array();
    THREE.Cache.clear();
    ladebalken.style.width = "0%";
    webxrUiAnimation.cancel();
    loadingScreenAnimation.cancel();
    openMenu();
    xrScene = undefined;
    stabilizationPrompt.style.display = "block";
    fahrradPlaced = false;

    axisFrontPos = undefined;
    axisBackPos = undefined;
    saddlePos = undefined;
    framePos = undefined;
    currentSaddle = undefined;
    currentFrame = undefined;
    currentWheelFront = undefined;
    currentWheelBack = undefined;

    frameIndex = 0;
    saddleIndex = 0;
    wheelIndex = 0;

    touchedOnce = false;
    interactionPrompt.style.display = "none";
    if(interactionPromptTimeout) {
      clearTimeout(interactionPromptTimeout);
      interactionPromptTimeout = null;
    }
    
    
}

function removeXrObject(scene, object3d) {//Da das Cachen der Szene die UUID's verändert, muss linear gesucht werden
  if(scene) {
    scene.remove(scene.getObjectByName(object3d.children[0].name).parent);
  }
  
}

function changeFrame() {
  if(assets[bikeId].components.frames.length <= 1) {
    return ;
  }
  if(!fahrradPlaced) {
    return ;
  }
  if(frameIndex + 1 >= assets[bikeId].components.frames.length) {
    frameIndex = 0;
  } else {
    frameIndex+=1;
  }
  lockButtons(true); 
  loader.load(assets[bikeId].components.frames[frameIndex], function(gltf) {
    if(!sessionActive || !fahrradPlaced) {
      return ;
    }
    removeXrObject(xrScene,currentFrame);
    currentFrame = gltf.scene;
    gltf.scene.traverse(function(child) {
      if(child.isMesh) {
        child.material.envMap = envMap;
      }
    });
    currentFrame.position.set(framePos.x, framePos.y, framePos.z);
    xrScene.add(currentFrame);
    lockButtons(false);
  });
}

function changeSaddle() {
  if(assets[bikeId].components.saddles.length <= 1) {
    return ;
  }
  if(!fahrradPlaced) {
    return ;
  }
  if(saddleIndex + 1 >= assets[bikeId].components.saddles.length) {
    saddleIndex = 0;
  } else {
    saddleIndex+=1;
  }
  lockButtons(true); 
  loader.load(assets[bikeId].components.saddles[saddleIndex], function(gltf) {
    if(!sessionActive || !fahrradPlaced) {
      return ;
    }
    removeXrObject(xrScene,currentSaddle);
    currentSaddle = gltf.scene;
    gltf.scene.traverse(function(child) {
      if(child.isMesh) {
        child.material.envMap = envMap;
      }
    });
    currentSaddle.position.set(saddlePos.x, saddlePos.y, saddlePos.z);
    xrScene.add(currentSaddle);
    lockButtons(false);
  });
}

function changeWheels() {
  if(assets[bikeId].components.wheels.length <= 1) {
    return ;
  }
  if(!fahrradPlaced) {
    return ;
  }
  if(wheelIndex + 1 >= assets[bikeId].components.wheels.length) {
    wheelIndex = 0;
  } else {
    wheelIndex+=1;
  }
  lockButtons(true);
  loader.load(assets[bikeId].components.wheels[wheelIndex], function(gltf) {
    if(!sessionActive || !fahrradPlaced) {
      return ;
    }
    removeXrObject(xrScene,currentWheelBack);
    removeXrObject(xrScene,currentWheelFront);
    currentWheelBack = gltf.scene;
    gltf.scene.traverse(function(child) {
      if(child.isMesh) {
        child.material.envMap = envMap;
      }
    });
    currentWheelFront = currentWheelBack.clone();
    currentWheelBack.position.set(axisBackPos.x, axisBackPos.y, axisBackPos.z);
    currentWheelFront.position.set(axisFrontPos.x, axisFrontPos.y, axisFrontPos.z);
    xrScene.add(currentWheelBack);
    xrScene.add(currentWheelFront);
    lockButtons(false);
  });
}

function lockButtons(lock) {
  //xrCloseBTN.disabled = lock;
  xrResetBTN.disabled = lock;
  if(fahrradPlaced) {
    xrFrameBTN.disabled = lock;
    xrSaddleBTN.disabled = lock;
    xrWheelsBTN.disabled = lock;
  }
  
}

function lockMenuRight(lock) {
  let opacity;
  if(lock) {
    opacity = .5;
  } else {
    opacity = 1;
  }
  if(assets[bikeId].components.frames.length > 1) {
    xrFrameBTN.disabled = lock;
    xrFrameBTN.style.opacity = opacity;
  }
  if(assets[bikeId].components.saddles.length > 1) {
    xrSaddleBTN.style.disabled = lock;
    xrSaddleBTN.style.opacity = opacity;
  }
  if(assets[bikeId].components.wheels.length > 1) {
    xrWheelsBTN.style.disabled = lock;
    xrWheelsBTN.style.opacity = opacity;
  }
  
}

//======================================================================
//    TouchHandler
//======================================================================

function resetFahrrad() {
  if(!fahrradPlaced) {
    return ;
  }
  fahrradPlaced = false;
  generateOutline(xrScene);
  lockMenuRight(true);
}

function placeFahrrad(evt) {
  if(fahrradPlaced) {
    return ;
  }
  fahrradPlaced = true;
  removeOutline();
  lockMenuRight(false);
}

function xrTouchHandler(ev) {

  if(ev.target == xrCloseBTN || ev.target == xrResetBTN || ev.target == xrFrameBTN || ev.target == xrSaddleBTN || ev.target == xrWheelsBTN) {//Hier müssen später auch die anderen Konfigurator-Buttons rein
    return ;
  }

  if(window.getComputedStyle(stabilizationPrompt).getPropertyValue("display") != "none") {
    return ; //Fahrrad kann noch nicht platziert werden (Map fehlt)
  }

  if(ev.touches.length > 1) {

    xrMenu.ontouchmove = null;
    xrMenu.ontouchend = null;
   return ;
  }


  let moved = false;
  let startX = ev.touches[0].pageX;
  let dX = 0;
  let tempRotation = 0;
  let startRotation = xrScene.rotation.y;
  let screenWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

  xrMenu.ontouchmove = function(ev) {
    if(!moved) {
      moved = true;
    }

    if(!fahrradPlaced) {
      dX = (ev.touches[0].pageX - startX) / screenWidth;
      tempRotation = startRotation + ((180 * dX) / 50);
      if(tempRotation > 6.283185) {
        tempRotation-= 6.283185;
      } else if(tempRotation < 0) {
        tempRotation += 6.283185;
      }
      xrScene.rotation.y = tempRotation;
    }

    

  }

  //if(ev.changedTouches.length == 1) {
    
    xrMenu.ontouchend = function(ev) {

      xrMenu.ontouchmove = null;
      //xrMenu.ontouchend = null;
      
      if(!moved) {
        //fahrradPlaced = true;
        placeFahrrad();

        if(!touchedOnce) { //Entfernen vom Hinweis
          touchedOnce = true;
          if(interactionPromptTimeout) {
            clearTimeout(interactionPromptTimeout);
            interactionPromptTimeout = null;
            interactionPrompt.style.display = "none";
          }
        }
      }
        
      
    }
  //} else {
  //  xrMenu.ontouchend = null;
  //}

  

  
  
}



























function generateOutline(threeScene) {  

  if(threeScene.children.length <= 0) {
    return ;
  }

  xrSceneCache = threeScene.clone();//Speichert die Materialien und Farbe der Origin-Meshes (+Position und Rotation)

  let cachedLength = threeScene.children.length;

  for(let i = 0; i < cachedLength; i++) {
    if(threeScene.children[i].type=="Scene") {

      const innerMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
      innerMaterial.transparent = true;
      innerMaterial.opacity = .2;

      const nonTransparentMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});//Falls ein Objekt leicht transparent ist (z.B. Glas). Transparenzen blockieren den Occluder
      nonTransparentMaterial.transparent = false;
      nonTransparentMaterial.opacity = 1;

      const outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );

      const innerClone = threeScene.children[i].clone();//Innere Farbe (ersetzt den Occluder-Inhalt)
      const outlineClone = threeScene.children[i].clone();//Cellshader, der durch den Ocluder ausgeschnitten wird

      threeScene.children[i].traverse( function (child) {
      if(child.isMesh) {
        child.material = nonTransparentMaterial;
        child.material.colorWrite = false;
      }
    });

    outlineClone.traverse( function (child) {
      if(child.isMesh) {
        //Nur fuer Kindobjekte (unmoeglich beim Traversieren zu erkennen)
        //child.position.x += child.parent.getWorldPosition().x - child.getWorldPosition().x;
        //child.position.y += child.parent.getWorldPosition().y - child.getWorldPosition().y;
        //child.position.z += child.parent.getWorldPosition().z - child.getWorldPosition().z;
        child.scale.multiplyScalar(1.025);
        child.material = outlineMaterial;
      }
    });

    innerClone.traverse( function (child) {
      if(child.isMesh) {
        child.material = innerMaterial;          
      }
    });  
  
    innerClone.name = "[OutlineInner]" + innerClone.name;
    outlineClone.name = "[Outline]" + outlineClone.name;
    threeScene.add(innerClone);
    threeScene.add(outlineClone);
    //threeScene.rotation.y = xrSceneCache.rotation.y;
    }
  }
  
}

function removeOutline() {

  if(xrSceneCache) {
    //Die aktuelle Position + Rotation der OutlineScene ist anders, als die der gespeicherten
    xrSceneCache.position.set(xrScene.position.x, xrScene.position.y, xrScene.position.z);

    xrSceneCache.rotation.set(xrScene.rotation.x, xrScene.rotation.y, xrScene.rotation.z);
    //xrSceneCache.rotation.y = xrScene.rotation.y;

    xrSceneCache.visible = true; //Falls dieser Wert initial im Cache gespeichert wird

    xrScene = xrSceneCache;
    xrSceneCache = null;
  }  
}