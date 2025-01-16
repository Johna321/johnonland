

document.addEventListener("nav", () => {
    const diagram = document.getElementById('random_diagram');
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkTheme) {
        diagram.style.filter = 'invert(100%)';
    }
    
    document.addEventListener('themechange', (event) => {
        if (event.detail.theme == 'light') console.log("THEME NOW LIGHT");
        diagram.style.filter = (event.detail.theme == 'dark')  ? 'invert(100%)' : 'none';
    });
})

