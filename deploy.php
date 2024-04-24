<?php

namespace Deployer;

require 'recipe/laravel.php';

// Project name
set('application', 'InstoreX');

// Project repository
set('repository', 'git@repo.wsdev.dk:auditive-network/instorex.git');

// [Optional] Allocate tty for git clone. Default value is false.
//set('git_tty', true);

// Shared files/dirs between deploys 
add('shared_files', []);
add('shared_dirs', []);
add('clear_paths', ['node_modules']);

// Writable dirs by web server 
add('writable_dirs', []);
set('allow_anonymous_stats', false);

// Hosts

host('test')
    ->hostname('instorex.dk')
    ->user('wsd')
    ->stage('test')
    ->set('deploy_path', '/var/www/test.instorex.dk');

host('live')
    ->hostname('instorex.dk')
    ->user('wsd')
    ->stage('prod')
    ->set('deploy_path', '/var/www/instorex.dk');
// Tasks

task('deploy:modules', function () {
    run('cd {{release_path}} && yarn');
});
after('deploy:vendors', 'deploy:modules');

task('deploy:compile-assets', function () {
    run('cd {{release_path}} && npm run production');
});
after('deploy:modules', 'deploy:compile-assets');
after('deploy:compile-assets', 'deploy:clear_paths');

task('deploy:create-dotenv-if-needed', function () {
    run('if [ ! -e $(echo {{release_path}}/.env) ]; then cp {{release_path}}/.env.example {{release_path}}/.env; fi');
});
before('deploy:shared', 'deploy:create-dotenv-if-needed');

// Migrate database before symlink new release.
before('deploy:symlink', 'artisan:migrate');
task('deploy:restart-services', function () {
    run('sudo /usr/sbin/service php7.1-fpm reload');
    run('sudo /usr/sbin/service nginx reload');
});
after('deploy:symlink', 'deploy:restart-services');

// [Optional] if deploy fails automatically unlock.
after('deploy:failed', 'deploy:unlock');
