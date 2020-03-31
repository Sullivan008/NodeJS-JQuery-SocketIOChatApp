var elixir = require('laravel-elixir');
var gulp = require('gulp');

elixir.config.sourcemaps = false;

elixir(function (mix) {
    mix.sass('resources/assets/sass/site.scss', 'resources/assets/css');

    mix.styles(
        [
            'css/site.css'
        ],
        'public/assets/css/site.css',
        'resources/assets');

    var bowerPath = 'bower/vendor';

    mix.scripts(
            [
                bowerPath + '/jquery/dist/jquery.min.js',
                bowerPath + '/moment/min/moment.min.js',
                bowerPath + '/socket.io-client/dist/socket.io.js',
                bowerPath + '/bootstrap/dist/js/bootstrap.min.js',
            ], 'public/assets/js/site.js', 'resources/assets')
        .scripts(
            [
                'js/common/operation/modal/modal-operation.js'
            ], 'public/assets/js/common/operation/modal/modal-operation.js', 'resources/assets')
        .scripts(
            [
                'js/app/views/index/index.js'
            ], 'public/assets/js/app/views/index/index.js', 'resources/assets');
});