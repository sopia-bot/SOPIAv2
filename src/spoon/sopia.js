
const itv = {
    add: function(key, func, time) {
        if (this[key]) {
            return false;
        }
        this[key] = {
            f: func,
            t: time,
            itv: setInterval(func, time)
        };
    },
    clear: function(key) {
        if ( this[key] ) {
            clearInterval(this[key].itv);
            delete this[key];
        }
    },
    reload: function(key) {
        if ( this[key] ) {
            clearInterval(this[key].itv);
            this[key].itv = setInterval(this[key].f, this[key].t);
        }
    },
};

export default {
    itv,
};