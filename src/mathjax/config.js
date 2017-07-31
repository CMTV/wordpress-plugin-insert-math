window.MathJax = {
    /* We translate TeX into HTML-CSS */
    jax: ["input/TeX","output/HTML-CSS"],
    extensions: ["tex2jax.js"],

    /* No image fonts. Sorry IE6 :( */
    imageFont: null,

    /* Removing all distracting MathJax messages */
    messageStyle: "none",

    /* Unbind everything from right-click button */
    showMathMenu: false,
    showMathMenuMSIE: false,

    /* Useful TeX packages */
    TeX: {
        extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
    }
};