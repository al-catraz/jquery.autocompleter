[![Build Status](https://magnum.travis-ci.com/GoldenLine/GoldenLine.svg?token=Ypu8ohyMsCgurs9qQ5Ay)](https://magnum.travis-ci.com/GoldenLine/GoldenLine)
[![SensioLabsInsight](https://insight.sensiolabs.com/projects/22ef7dba-f68c-4190-a7e5-2293e8218dea/big.png)](https://insight.sensiolabs.com/projects/22ef7dba-f68c-4190-a7e5-2293e8218dea)
# [Goldenline](http://goldenline.pl)

## PHP

### OS X

Wymagane narzędzia: [Xcode + Command Line Tools + MacPorts](http://www.macports.org/install.php)

````bash
sudo xcodebuild -license
sudo port selfupdate
sudo port install memcached
sudo port install php55 php55-apache2handler
sudo port install php55-APCu
sudo port install php55-calendar
sudo port install php55-curl
sudo port install php55-dba
sudo port install php55-exif
sudo port install php55-ftp
sudo port install php55-gd
sudo port install php55-geoip
sudo port install php55-gettext
sudo port install php55-iconv
sudo port install php55-imap
sudo port install php55-intl
sudo port install php55-mbstring
sudo port install php55-mcrypt
sudo port install php55-memcache
sudo port install php55-mysql
sudo port install php55-openssl
sudo port install php55-pcntl
sudo port install php55-posix
sudo port install php55-soap
sudo port install php55-sockets
sudo port install php55-xdebug
sudo port install php55-xhprof
sudo port install php55-zip
sudo port install mysql56-server mysql56
sudo -u _mysql /opt/local/lib/mysql56/bin/mysql_install_db
sudo cp /opt/local/share/mysql56/support-files/my-default.cnf /opt/local/etc/mysql56/my-new.cnf
sudo port load memcached
sudo port load apache2
sudo port load mysql56-server
sudo port select php php55
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/opt/local/bin --filename=composer
echo "export PATH=\"~/.composer/vendor/bin:/opt/local/lib/mysql56/bin:/opt/local/bin:/opt/local/sbin:\$PATH\"" > .profile
echo "xdebug.remote_enable=1" | sudo tee -a /opt/local/var/db/php55/xdebug.ini
echo "xdebug.max_nesting_level=1000" | sudo tee -a /opt/local/var/db/php55/xdebug.ini
sudo cp /opt/local/etc/php55/php.ini-development /opt/local/etc/php55/php.ini
sudo sed -i '' -e 's/;date.timezone =/date.timezone = "Europe\/Warsaw"/' /opt/local/etc/php55/php.ini
sudo sed -i '' -e 's/memory_limit = .*/memory_limit = 1024M/' /opt/local/etc/php55/php.ini
sudo sed -i '' -e 's/mysql.default_socket =/mysql.default_socket = \/opt\/local\/var\/run\/mysql56\/mysqld.sock/' /opt/local/etc/php55/php.ini
sudo sed -i '' -e 's/mysqli.default_socket =/mysqli.default_socket = \/opt\/local\/var\/run\/mysql56\/mysqld.sock/' /opt/local/etc/php55/php.ini
sudo sed -i '' -e 's/pdo_mysql.default_socket=/pdo_mysql.default_socket= \/opt\/local\/var\/run\/mysql56\/mysqld.sock/' /opt/local/etc/php55/php.ini
sudo sed -i '' -e "s/User www/User $USER/" /opt/local/apache2/conf/httpd.conf
sudo sed -i '' -e 's/Group www/Group staff/' /opt/local/apache2/conf/httpd.conf
sudo sed -i '' -e 's/DirectoryIndex index.html/DirectoryIndex index.html index.php/' /opt/local/apache2/conf/httpd.conf
sudo sed -i '' -e "s/\/opt\/local\/apache2\/htdocs/\/Users\/$USER\/Sites/" /opt/local/apache2/conf/httpd.conf
sudo sed -i '' -e "s/\/opt\/local\/apache2\/htdocs/\/Users\/$USER\/Sites/" /opt/local/apache2/conf/extra/httpd-ssl.conf
sudo sed -i '' -e 's/AllowOverride None/AllowOverride All/' /opt/local/apache2/conf/httpd.conf
mkdir ~/Sites
echo "Include conf/extra/mod_php55.conf" | sudo tee -a /opt/local/apache2/conf/httpd.conf
cd /opt/local/apache2/conf
sudo openssl req -new -newkey rsa:4096 -days 36500 -nodes -x509 -subj "/C=PL/ST=Mazowieckie/L=Warszawa/O=GoldenLine/CN=localhost" -keyout server.key -out server.crt
cd ~
echo "Include conf/extra/httpd-ssl.conf" | sudo tee -a /opt/local/apache2/conf/httpd.conf
cd /opt/local/apache2/modules
sudo /opt/local/apache2/bin/apxs -a -e -n php5 mod_php55.so
cd ~
sudo reboot
````

### Linux with Advanced Packaging Tool

````bash
sudo apt-get install apache2 libapache2-mod-php5
sudo apt-get install php5 php5-cli php5-common php5-curl php5-dev php5-geoip php5-imap php5-intl php5-json php5-mcrypt php5-memcache* php5-oauth php5-sqlite php5-svn php5-xcache php5-xhprof php5-xdebug php-apc
sudo apt-get install mysql-server libapache2-mod-auth-mysql php5-mysql
sudo apt-get install memcached
````

ciąg dalszy nastąpi ;) :P

## COMPOSER

Aby móc zainstalować vendory, ponieważ korzystamy z podwójnego uwierzytelniania na GitHub należy wygenerować osobisty
token przechodząc na stronę https://github.com/settings/tokens/new, a następnie skonfigurować composer używając wskazówek
z tego linku: https://github.com/everzet/capifony/issues/358#issuecomment-15692879.
Przechodzimy do katalogu głównego aplikacji i wykonujemy:
````bash
composer.phar install
````

TODO: opis komend :)

## Konsola _Symfony_

Komendy konsoli Symfony zaczynamy od `php app/console` po czym stosujemy następujące polecenia:

TODO: uzupełnić!

#### swiftmailer:spool:send

````bash
php app/console swiftmailer:spool:send
````

Wysyła wiadomości z kolejki.

## NODE.JS

GoldenLine wykorzystuje node.js do obsługi frontendowych narzędzi:

* [Grunt](http://gruntjs.com/)
* [grunt contrib watch](https://github.com/gruntjs/grunt-contrib-watch)

### instalacja NODE.JS

Do instalacji Node.js warto skorzystać z [NVM](https://github.com/creationix/nvm) instrukcja instalacji znajduje się w repo. NVM wzorowany na Rubie’owym [RVM](http://rvm.io/) umożliwia łatwe zarządzanie jedną, lub więcej wersjami środowiska.

TLDR:

````bash
curl https://raw.github.com/creationix/nvm/master/install.sh | sh
````

````bash
nvm install 0.10
````


### Instalacja narzędzi:

````bash
npm install
````

Wszystkie narzędzia zarządzane są przez [NPM](https://npmjs.org/), instalacja jest automatyczna poprzez komendę __npm install__ z poziomu głównego katalogu Goldena, konfiguracja wymaganych narzędzi i ich wersji znajduje się w pliku [package.json](package.json).

### Grunt

Grunt jest automatycznie instalowany przez NPM, konfiguracja znajduje się w pliku [Gruntfile](Gruntfile.js).

### Standardy tworzenia branchy projektowych

Nazwę zespołu dajemy zawsze jako pierwszy człon nazwy. Dla brancha projektowego po nazwie zespołu dochodzi nazwa projektu
a dla branchy per user story dochodzi jeszcze user story jako ostatni człon.

Przykładowo:
- projektowy: maintenance/algolia
- per user story: maintenance/algolia-us/user-index

- projektowy: growth/fillrate-boost
- per user story: growth/fillrate-boost-us/mailing-user-experience

- projektowy: recruitment/job-ad
- per user story: recruitment/job-ad-us/search-criterias

Dla projektów typu 20% jeśli jest to praca nad projektem proponuję przyjąć jakąś nazwę zespołu i trzymać się powyższych
zasad. Dla funkcjonalności wchodzących trochę bokiem nazwa głowna brancha może być "feature".
Dla branchy niezwiązanych z projektami zespołowymi najlepiej polegać na zdrowym rozsądku.

## Readme dla poszczególnych Bundli:
* [UtilsBundle] (/src/GoldenLine/UtilsBundle/Resources/doc/index.md)
* [MailBundle] (src/GoldenLine/MailBundle/Resources/doc/index.md)
