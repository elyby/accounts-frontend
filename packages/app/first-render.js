/**
 * Returns the content to be displayed on first render
 */

export default `
    ${require('app/components/ui/loader/loader.html')}

    <script>
        (function(l) {
            l.offsetHeight;
            l.className += ' is-active';
        }(document.getElementById('loader')));
    </script>

    <style>
        ${require('!!css-loader!postcss-loader!sass-loader!app/index.scss')[0][1]}
        ${require('!!css-loader!postcss-loader!sass-loader!app/components/ui/loader/loader.scss')[0][1]}
    </style>
`;
