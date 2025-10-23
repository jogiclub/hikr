SVGInject.setOptions({
    onFail: function (img, svg) {
        img.classList.remove("injectable");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    function injectIcon(selector) {
        const targets = document.querySelectorAll(selector);
        targets.forEach(img => img.classList.add("injectable"));
        SVGInject(targets);
    }

    injectIcon(".icon_svg_inject");

    const observer = new MutationObserver((mutationsList, observer) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                injectIcon(".icon_svg_inject");
            }
        });
    });

    observer.observe(document.body, {
        childList: true, subtree: true
    });
});