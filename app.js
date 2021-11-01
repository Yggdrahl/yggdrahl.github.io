let headSection;
let headerContainer;
let logoWrapper;
let topnavWrapper;
let subheaderWrapper;
let navbarButtons;
let navbarChanged = false;
let mainScene;
let initialised = false;

let footerWrapper;

document.addEventListener('DOMContentLoaded', function() {

    headSection = document.querySelector('.headSection');
    headerContainer = document.querySelector('.header');
    logoWrapper = headerContainer.querySelector('.logoWrapper');
    topnavWrapper = headerContainer.querySelector('.topnav');
    subheaderWrapper = document.querySelector('.subheader');
    navbarButtons = topnavWrapper.children[0];
    mainScene = document.querySelector('.mainScene');
    footerWrapper = document.querySelector('.footer');

    //window.getComputedStyle(logoWrapper).getPropertyValue("width");


    resize();
    document.querySelector('.header').querySelector('img').style.visibility = "visible";

    

    window.onresize = resize;

    
});


function resize() {
    
    if (window.innerWidth < 360) {
        document.querySelector('.header').querySelector('img').setAttribute('src', "./assets/yggHeaderSmall.svg");
        logoWrapper.style.width = "70px";
        
        subheaderWrapper.appendChild(navbarButtons);
        for(let i = 0; i < navbarButtons.children.length; i++) {
            if(navbarButtons.children[i].className.indexOf('active') >= 0) {
                //topnavWrapper.innerHTML = navbarButtons.children[i].innerHTML;
                topnavWrapper.innerHTML = "<h1></h1>";
                topnavWrapper.children[0].innerHTML = navbarButtons.children[i].innerHTML;
            }
        }
        //topnavWrapper.innerHTML = "";

        subheaderWrapper.style.display = "block";

    } else if(window.innerWidth <= 690) {
        document.querySelector('.header').querySelector('img').setAttribute('src', "./assets/yggHeaderSmall.svg");
        logoWrapper.style.width = "70px";
        
        topnavWrapper.innerHTML = "";
        topnavWrapper.appendChild(navbarButtons);
        subheaderWrapper.innerHTML = "";

        subheaderWrapper.style.display = "none";
    } else {
        document.querySelector('.header').querySelector('img').setAttribute('src', "./assets/yggHeader.svg");
        logoWrapper.style.width = null;
        
        topnavWrapper.innerHTML = "";
        topnavWrapper.appendChild(navbarButtons);
        subheaderWrapper.innerHTML = "";

        subheaderWrapper.style.display = "none";
    }

    mainScene.style.minHeight = ("calc(100% - " + (parseInt(window.getComputedStyle(headSection).getPropertyValue("height")) + parseInt(window.getComputedStyle(footerWrapper).getPropertyValue("height"))) + "px)");
    

    if(!initialised) {
        initialised = true;
        resize();
    }
}



//https://drive.google.com/uc?export=view&id=1sQG3mLYuCuH-6GJWFyt9bLSwpDDc1g0S