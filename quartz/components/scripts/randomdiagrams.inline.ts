

document.addEventListener("nav", () => {
    const diagram = document.getElementById('random_diagram') as HTMLImageElement;
    const isDarkTheme = (localStorage.getItem('theme') == 'dark');

    const figures = ['cube', 'animal', 'pyramid', 'cup', 'hexagon']
    const choice = figures[Math.floor(Math.random() * figures.length)]
    const src = 'https://johnon.land/randomdiagrams/' + choice + ".svg"

    diagram.src = src;

    console.log("CHANGED SRC TO ", src)

    if (isDarkTheme) {
        diagram.style.filter = 'invert(100%)';
    }
    
    document.addEventListener('themechange', (event) => {
        if (event.detail.theme == 'light') console.log("THEME NOW LIGHT");
        diagram.style.filter = (event.detail.theme == 'dark')  ? 'invert(100%)' : 'none';
    });
})

