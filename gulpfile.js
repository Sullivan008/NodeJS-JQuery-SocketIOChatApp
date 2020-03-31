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
});