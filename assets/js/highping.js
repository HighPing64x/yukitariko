(() => {
    function ban() {
        setInterval(() => {
            Function('debugger')();
        }, 50);
    }
    try {
        ban();
    } catch (err) { }
})();