/**
 * Guidémon — Gotta Tour 'em All
 */
(function(root) {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    var Guidemon = function(options) {
        this.options = options;
    }
    Guidemon.prototype.render = function() {
        var id = this.marker = new google.maps.Marker({
            position: {
                lat: this.options.attrs.activityCoordinateLatitude,
                lng: this.options.attrs.activityCoordinateLongitude
            },
            icon: ['/images/sprites/', getRandomInt(650, 720), '_f.png'].join(''),
            animation: google.maps.Animation.BOUNCE
        });
        // Refresh fields
        this.options.owner.fields.forEach(function(field) {
            var name = field.getAttribute('data-guidemon-attribute');
            var value = name ? this.options.attrs[name] : null;
               
            if (field instanceof HTMLImageElement && value) {
                field.classList.add('guidemon-loading');
                field.addEventListener('load', function() {
                    field.classList.remove('guidemon-loading');
                }, false);
                field.setAttribute('src', value);
                
            } else {
                if (name) {
                    field.textContent = '';
                    var writeInterval = setInterval((function() {
                        if (field.textContent.length < value.length) {
                            field.textContent = value.substr(0, field.textContent.length + 1);
                        } else if(field.textContent.length === value.length) {
                            clearInterval(writeInterval);
                        }
                    }).bind(this), 60);
                }
            }
        }, this);
    };
    Guidemon.prototype.remove = function() {
        this.marker.setMap(null);
    }
    var GuideClient = function(options) {
        this.options = options;
    };
    GuideClient.prototype.spawnHandler = function(attrs) {
        var guidemon = new Guidemon({
            attrs: attrs,
            owner: this
        });
        if (this.current.length > this.options.maxMarkersOnMap - 1) {
            this.current.shift().remove();
        }
        this.current.push(guidemon);
        guidemon.render();
        guidemon.marker.setMap(this.map);
        this.map.panTo(guidemon.marker.getPosition());
        if (this.options.appears) {
            this.options.appears.play();
        }
    };
    GuideClient.prototype.render = function() {
        this.fields = this.options.el.querySelectorAll('.js-attribute');
        this.map = new google.maps.Map(this.options.el.querySelector('.js-map'),this.options.mapOptions);
        this.options.socket.on('spawn', this.spawnHandler.bind(this));
        if (this.options.ost) {
            this.options.ost.volume = .2;
            this.options.ost.play();
        }
        if (this.options.appears) {
            this.options.appears.volume = 1;
        }
    };
    GuideClient.prototype.current = [];
    root.GuideClient = GuideClient;
}(window));
