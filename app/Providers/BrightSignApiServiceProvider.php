<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\ServiceProvider;
use WSD\BrightSignApi\Api;

class BrightSignApiServiceProvider extends ServiceProvider
{

    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = true;

    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('BSApi', function () {
            $api = new Api();
            $api->setAuthenticationOptions(
                Auth::user()->api_login,
                Crypt::decryptString(Auth::user()->api_password),
                Auth::user()->api_network
            );
            return $api;
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [
            'BSApi',
        ];
    }
}
