<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://use.fontawesome.com/9bb173b834.js"></script>

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Styles -->
    <link href="{{ mix('css/app.css') }}" rel="stylesheet">
    @stack('styles')
</head>
<body>
<div class="container-fluid">
    <div class="row">
        <div class="col-12 col-xl-12 mx-auto">
            <nav class="navbar navbar-expand-md navbar-light">
                <a class="navbar-brand" href="/"><img src="{{ URL::to('/assets/images/auditive-logo.png') }}"></a>
                <button class="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                    </ul>
                    <ul class="navbar-nav  mt-2 mt-lg-0">
                        <li class="nav-item dropdown active">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarAccountLink"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-user"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarAccountLink">
                                <a class="dropdown-item text-right" href="{{ route('users.me') }}">BRUGERINFO</a>
                                <a class="dropdown-item text-right" href="{{ url('logout') }}">LOG UD</a>
                            </div>
                        </li>
                    </ul>
                    <ul class="navbar-nav mt-2 mt-lg-0">
                        <li class="nav-item dropdown active">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarAccountLink"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-bars"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarAccountLink">
                                @if (auth()->user()->api_login)
                                    <a class="dropdown-item" href="{{ route('image-editor.index') }}">SKAB CONTENT</a>
                                    <a class="dropdown-item" href="{{ route('contents.index') }}">HÅNDTER CONTENT</a>
                                    <a class="dropdown-item" href="{{ route('playlists.index') }}">LIVE CONTENT</a>


                                @endif
                                @if(auth()->user()->admin)
                                    <a class="dropdown-item" href="{{ url('users') }}">Users</a>
                                @endif
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>


            <div class="row d-flex d-md-block flex-nowrap wrapper">
                <main class="col pl-md-2 pt-2 main" id="main">
                    @yield('content')
                </main>
            </div>
        </div>
    </div>
</div>
<!-- Scripts -->
@stack('prescripts')
<script src="{{ mix('js/manifest.js') }}"></script>
<script src="{{ mix('js/vendor.js') }}"></script>
<script src="{{ mix('js/app.js') }}"></script>
@stack('scripts')
</body>
</html>
