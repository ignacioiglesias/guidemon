/**
 * Guidémon — Gotta Guide 'em All
 */
(function(root) {
    /**
     * Returns an integer between `min` and `max`.
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    /**
     * Adds leading zeros to time
     */
    function addLeadingZero(n) {
        if (n < 10) {
            return '0' + n;
        }
        return n;
    }
    /**
     * Represents a customer and their activity
     */
    var Guidemon = function(options) {
        this.options = options;
    }
    /**
     * Adds a Guidemon to the map and updates the UI
     */
    Guidemon.prototype.render = function() {
        // NOTE: Some images are missing for the 650 to 720 range.
        var id = this.marker = new google.maps.Marker({
            position: {
                lat: this.options.attrs.activityCoordinateLatitude,
                lng: this.options.attrs.activityCoordinateLongitude
            },
            icon: ['/images/sprites/', getRandomInt(650, 720), '_f.png'].join(''),
            animation: google.maps.Animation.BOUNCE
        });
        // Refresh fields by taking the attribute and somehow applying its value
        this.options.owner.fields.forEach(function(field) {
            var name = field.getAttribute('data-guidemon-attribute');
            var value = name ? this.options.attrs[name] : null;
               
            // For `<img />` elements, we change the `src` attribute
            if (field instanceof HTMLImageElement && value) {
                field.classList.add('guidemon-loading');
                field.addEventListener('load', function() {
                    field.classList.remove('guidemon-loading');
                }, false);
                field.setAttribute('src', value);
            } else {
                // For the rest of the elements we set the textContent
                if (name) {
                    // Remove current text
                    field.textContent = '';
                    // Add new text char by char
                    var writeChar = (function() {
                        if (field.textContent.length < value.length) {
                            field.textContent = value.substr(0, field.textContent.length + 1);
                            setTimeout(writeChar, 30);
                        }
                    }).bind(this);
                    writeChar();
                }
            }
        }, this);
    };
    /**
     * Remove a Guidemon from the map
     */
    Guidemon.prototype.remove = function() {
        this.marker.setMap(null);
    }
    /**
     * The Guidemon client.
     * Listen to socket events and displays information on screen.
     * Clock included.
     */
    var GuideClient = function(options) {
        this.options = options;
    };
    /**
     * Take customer information and instanciate a Guidemon,
     * then renders it and pans the map to show the marker.
     */
    GuideClient.prototype.spawnHandler = function(attrs) {
        var guidemon = new Guidemon({
            attrs: attrs,
            owner: this
        });
        this.current.push(guidemon);
        // If we have too many Guidemons, remove the oldest.
        if (this.current.length > this.options.maxMarkersOnMap) {
            this.current.shift().remove();
        }
        guidemon.render();
        guidemon.marker.setMap(this.map);
        this.map.panTo(guidemon.marker.getPosition());
        if (this.options.appears) {
            this.options.appears.play();
        }
    };
    /**
     * Kicks off the screen's UI
     * Keeps the clock updated
     */
    GuideClient.prototype.render = function() {
        this.fields = this.options.el.querySelectorAll('.js-attribute');
        this.clock = this.options.el.querySelector('.js-clock');
        this.map = new google.maps.Map(this.options.el.querySelector('.js-map'),this.options.mapOptions);
        // Listen to `spwan` events coming from our Socket.IO server
        this.options.socket.on('spawn', this.spawnHandler.bind(this));
        // Configuration for background music
        if (this.options.ost) {
            this.options.ost.volume = .2;
            this.options.ost.play();
        }
        // Configuration for wild Guidemons appearing
        if (this.options.appears) {
            this.options.appears.volume = 1;
        }
        // Keep clock ticking
        var time = new Date();
        this.clockInterval = setInterval((function() {
            this.clock.textContent = [time.getHours(), time.getMinutes()].map(addLeadingZero).join(':');
        }).bind(this), 1000);
    };
    GuideClient.prototype.current = [];
    root.GuideClient = GuideClient;
}(window));
