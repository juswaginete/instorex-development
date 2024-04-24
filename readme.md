# InstoreX - instorex.dk

InstoreX is a client tool for the Instore Experience application. With this, we let clients have easy access to
managing content and playlists on BrightSign devices, without giving them full access to Instore Experience.

## Setup development environment

InstoreX is created in Laravel 5.4 and using a docker setup to run the development envoriment.

First we will need to make a copy of the .env.example file.

```
$ cp .env.example .env
```

[OPTIONAL] Update the exposing mysql port from 3306 to 33061 code in the docker-compose.yml file so that the db can be connected to MySQL Workbench via port 33061

Before

```
ports:
    - 3306:3306
```

After

```
ports:
    - 33061:3306
```

Then we need to edit the .env file with the login information from docker-compose.yml

```
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=instorex
DB_USERNAME=instorex
DB_PASSWORD=secret
```

If you doesn't have access to the internal respository server at Uptime Development you will need to download a copy of the package "bs-php-api" from this repository, master branch.

- https://repo.wsdev.dk/west-soft-development/public/bs-php-api.git

Unpack this project next to main InstoreX project (this on) and make sure that the directory name is only "bs-php-api". After that you will need to setup/configure composer.json to read the correct location on the package.

Remove the following lines:

```
{
    "type": "vcs",
    "url": "https://repo.wsdev.dk/west-soft-development/public/bs-php-api.git"
}
```

Replace with

```
{
    "type": "path",
    "url": "../bs-php-api"
}
```

More in depth guide setting this up can be found here - https://getcomposer.org/doc/05-repositories.md#path

Now we need to bring up the containers and the web application.

```
$ cd .docker
$ docker-compose up -d
```

If everything goes fine you should see 3 new running containers. We when then need to setup and install laravel dependencies. We will also migrate and seed the database.

```
$ cd .docker
$ docker-compose exec php bash
$ composer install
$ php artisan key:generate
$ php artisan migrate --seed
```

Following that, and still signed into the php container, we will need to install npm packages.

```
$ yarn install
```

After that, and still signed into the php container, you can now run the following command to compile the project.

```
$ npm run dev
```

After running the previous command, you can now access the application in the browser via localhost port 80

```
http://localhost:80/
```

Extending/build pixie editor (Optional)

```
$ cd resources/assets/pixie
$ npm install
$ npm install gulp -g
```

Compiling the changes etc.

```
$ cd resources/assets/pixie
$ gulp
```

### Javascript

Uses the [Javascript Standard style](https://github.com/standard/standard)

## Deploying

Deploying is as easy as going to the project directory and running

```
# For staging
vendor/bin/dep deploy test
# See https://test.instorex.dk for staging

# For live/production
vendor/bin/dep deploy live
# See https://instorex.dk for production
```
