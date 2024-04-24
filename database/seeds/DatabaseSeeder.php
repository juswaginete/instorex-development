<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Crypt;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\User::create([
            'name' => 'InstoreX Administrator',
            'email' => 'jsm@westsoftdevelopment.dk',
            'password' => bcrypt('secret'),
            'admin' => true,
        ]);

        \App\User::create([
            'name' => 'Morten Test',
            'email' => 'mj@auditive.net',
            'password' => bcrypt('secret'),
            'api_login' => 'mj@auditive.net',
            'api_password' => Crypt::encryptString('Carmaroom33'),
            'api_network' => 'AN',
        ]);
    }
}
