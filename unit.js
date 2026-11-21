/* One scaling unit for the whole page: 1 on a 1280×800 laptop, bigger on bigger screens.
   Based on the screen's area, so shapes, name and menu all zoom together. */
function setUnit() { document.documentElement.style.setProperty('--u', Math.sqrt(innerWidth * innerHeight) / 1012); }
setUnit();
addEventListener('resize', setUnit);
