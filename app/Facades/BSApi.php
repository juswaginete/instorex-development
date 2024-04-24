<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class BSApi extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'BSApi';
    }
}
