# Geonorge Mosaic

This is a drupal module for visualization of Sentinel 2 mosaic as provided by Geonorge.

The map uses ESRI World Imagery as its base layer. A layer switcher beside the
map lets users select one Sentinel-2 mosaic year at a time.

## Authors
 - Lara Ferrighi, laraf@met.no
 - Magnar Martinsen, magnarem@met.no


## How to install the module
* Download the module and place it within the module folder. Or if installing the module within the MET infrastructure, run `composer require "metno/geonorge_mosaic:^1"`
* Enable in the geonorge_mosaic in `/admin/modules`, or use drush `drush en geonorge_mosaic`


## Setting up development environment

This repository/module uses [ddev](https://ddev.com) with [ddev-drupal-contrib](https://github.com/ddev/ddev-drupal-contrib) add-on.

It also uses vite for development and building of the OpenLayers map application.

### Setting up ddev

1. Make sure you have [ddev](https://ddev.com)
2. Clone this repository
3. Run `ddev start`
4. Run `ddev poser`
5. Run `ddev symlink-project`
6. Run `ddev config --update`
7. Run `ddev restart`
8. Install the development drupal site: `ddev drush site:install -y`, or use the Web UI install by executin `ddev launch`
9. Install this module: `ddev drush en geonorge_mosaic`


### Devlopment of openlayers app with vite
To Get vite working with drupal and use HMR using deleopement in vite dev mode, do the following:

1. Add a file called `settings.local.php` in `web/sites/default/` folder with the contents:
```php
<?php
/**
 * Set Ddev vite developement server.
 */
$settings['vite'] = [
  'devServerUrl' => $_ENV['DDEV_PRIMARY_URL'] . ':5173',
];
```
2. Edit `web/sites/default/settings.php`and comment out so you have the following lines in the file:
```php
if (file_exists($app_root . '/' . $site_path . '/settings.local.php')) {
  include $app_root . '/' . $site_path . '/settings.local.php';
}
```
3. Clear the cache with `ddev drush cr`

#### Starting the vite devserver
1. run `ddev ssh`
2. `cd js/mosaic-app`
3. To start the vite dev server, run `npm run dev`. You should now be able to edit the app and changes will automatically be reflected on the site.
4. To build the final dist, run `npm run build`

#### Commiting changes
When commiting changes, if the `js/mosaic-app/src/main.js` has changed do the following:

1. Run the `npm run build` as described in the [previous section](#starting-the-vite-devserver).
2. Update the version string in `js/mosaic-app/package.json`.
3. Update to the same version string in `geonorge_mosaic.libraries.yml`.
4. Bump the version in `geonorge_mosaic.info.yml`
5. Add, commit and push the changes.
