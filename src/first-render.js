/**
 * Returns the content to be displayed on first render
 */

export default `
    ${require('components/ui/loader/loader.html')}

    <script>
        (function(l) {
            l.offsetHeight;
            l.className += ' is-active';
        }(document.getElementById('loader')));
    </script>

    <style>
        ${require('!!css!postcss!sass!index.scss')[0][1]}
        ${require('!!css!postcss!sass!components/ui/loader/loader.scss')[0][1]}
    </style>
`;
