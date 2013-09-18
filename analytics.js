(function(scope) {
    var Provider = function(id) {
        this.id = id;
    };
    Provider.prototype.callbacks = {
        onBeforeLoad: function() {},
        onAfterLoad: function() {}
    };
    Provider.prototype.load = function() {
        console.log('loading', this.id);
        this.callbacks['onBeforeLoad']();

        var elem = document.createElement('script'); 
        elem.type = 'text/javascript'; 
        elem.async = true;
        elem.src = ('https:' == document.location.protocol ? 'https://' + this.url.sslPrefix : 'http://' + this.url.prefix) + '.' + this.url.script;
        var script = document.getElementsByTagName('script')[0]; 
        script.parentNode.insertBefore(elem, script);

        this.callbacks.onAfterLoad();
    };
    Provider.prototype.trackPageView = function(uri) {
        console.log('track1');
    };
    Provider.prototype.registerCallback = function(name, callback) {
        this.callbacks[name] = callback;
    }

    /* GA provider */
    var GoogleAnalyticsProvider = function(id) {
        this.id = id;
        this.name = "google";
    };
    GoogleAnalyticsProvider.prototype = new Provider();
    GoogleAnalyticsProvider.prototype.url = {
        prefix: 'www',
        sslPrefix: 'ssl',
        script: 'google-analytics.com/ga.js'
    };
    GoogleAnalyticsProvider.prototype.trackPageView = function(url) {
        _gaq.push(['_setAccount', this.id]);
        if(url) {
            _gaq.push(['_trackPageview', url]);
        } else {
            _gaq.push(['_trackPageview']);
        }
    };
    GoogleAnalyticsProvider.prototype.callbacks = {
        onBeforeLoad: function() {
            window._gaq = window._gaq || [];
        },
        onAfterLoad: function() {}
    };
    /*//////////////*/

    /* Quantcast provider */
    var QuantcastProvider = function(id) {
        this.id = id;
        this.name = "quantcast";
    };
    QuantcastProvider.prototype = new Provider();
    QuantcastProvider.prototype.url = {
        prefix: 'edge',
        sslPrefix: 'secure',
        script: 'quantserve.com/quant.js'
    };
    QuantcastProvider.prototype.trackPageView = function() {
        _qevents.push({
            qacct: this.id,
            event: "refresh"
        });
    };
    QuantcastProvider.prototype.callbacks = {
        onBeforeLoad: function() {
            window._qevents = window._qevents || [];
        },
        onAfterLoad: function() {
            _qevents.push({
                qacct: this.id
            });
        }
    };
    /*//////////////*/

    /* Comscore provider */
    var ComscoreProvider = function(id) {
        this.id = id;
        this.name = "comscore";
    };
    ComscoreProvider.prototype = new Provider();
    ComscoreProvider.prototype.url = {
        prefix: 'b',
        sslPrefix: 'sb',
        script: 'scorecardresearch.com/beacon.js'
    };
    ComscoreProvider.prototype.trackPageView = function(url) {
        if(window.COMSCORE) {
            var track = { c1: "2", c2: this.id, c4: url };
            if(url) {
                track.c4 = url;
            }
            COMSCORE.beacon(track);
        }
    };
    ComscoreProvider.prototype.callbacks = {
        onBeforeLoad: function() {
            window._comscore = window._comscore || [];
            _comscore.push({ c1: "2", c2: this.id });
        },
        onAfterLoad: function() {
            _comscore.push({ c1: "2", c2: this.id });
        }
    };
    /*//////////////*/

    var defaultProviders = {
        google: GoogleAnalyticsProvider,
        quantcast: QuantcastProvider,
        comscore: ComscoreProvider
    };
    scope.Analytics = (function() {
        var _providers = [];
        return {
            trackPageView: function(uri) {
                for(var i=0; i<_providers.length; i++) {
                    _providers[i].trackPageView();
                    //console.log('firing pageview for ' + _providers[i].name + ' to ' + uri);
                }
            },
            registerProvider: function(type, options) {
                var pro = defaultProviders.hasOwnProperty(type) ? new defaultProviders[type](options) : new Provider(options);
                _providers.push(pro);
            },
            init: function() {
                for(var i=0; i<_providers.length; i++) {
                    _providers[i].load();
                    _providers[i].trackPageView();
                }
            },
            getProviders: function() {
                return _providers;
            }
        }
    })();
})(window);
