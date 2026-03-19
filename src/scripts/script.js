const planetImg = document.getElementById('planet-img');

    planetImg.addEventListener('animationend', () => {
        planetImg.style.animation = 'movingAnimation 4s ease-in-out infinite' 
    })    