const color = {
    'err': '#ed4b47',
    'info': '#21a4c2',
    'success': '#1eb05d',
    'warn': '#de8914',
    'debug': '#000',
};

const char = {
    'err': '❌',
    'info': '❕',
    'success': '✔',
    'warn': '⚠',
    'debug': '🔹',
};

const level = [
    'critical',
    'alert',
    'err',
    'warn',
    'success',
    'info',
    'debug',
];

const b = (group = 'any', type, ...args) => {
    let format = `${group} - %c${char[type]} `;
    const argv = [
        `color: ${color[type]}`,
    ].concat(args);

    for ( let i = 1;i < argv.length;i++ ) {
        const arg = argv[i];

        switch ( typeof arg ) {
            case "number":
                format += "%d ";
                break;
            case "string":
                format += "%s ";
                break;
            default:
                format += "%o ";
                break;
        }
    }
    return [format].concat(argv);
};

const canLogging = (group, type) => {
    const logLevel = window.logLevel || -1;

    if ( logLevel < 0 ) {
        return false;
    }

    const fdLevel = level.indexOf(type);
    if ( fdLevel >= 0 && fdLevel <= logLevel ) {

        const logGroup = window.logGroup || 'all';
        if ( logGroup === 'all' ) {
            const regex = window.logRegex;
            if ( regex ) {
                if ( !group.match(regex) ) {
                    return false;
                }
            }
            return true;
        }

        if ( typeof logGroup === "string" ) {
            if ( logGroup === group ) {
                return true;
            }
        } else if ( typeof logGroup === "object" && Array.isArray(logGroup) ) {
            if ( logGroup.indexOf(group) >= 0 ) {
                return true;
            }
        }
    }

    return false;
};

const critical = (group = 'any', ...args) => canLogging(group, 'critical') && console.error(...[group, ...args]);
const alert    = (group = 'any', ...args) => canLogging(group, 'alert')    && console.warn (...[group, ...args]);
const err      = (group = 'any', ...args) => canLogging(group, 'err')      && console.log  (...b(group, 'err',     ...args));
const warn     = (group = 'any', ...args) => canLogging(group, 'warn')     && console.log  (...b(group, 'warn',    ...args));
const success  = (group = 'any', ...args) => canLogging(group, 'success')  && console.log  (...b(group, 'success', ...args));
const info     = (group = 'any', ...args) => canLogging(group, 'info')     && console.log  (...b(group, 'info',    ...args));
const debug    = (group = 'any', ...args) => canLogging(group, 'debug')    && console.log  (...b(group, 'debug',   ...args));

// debug
window.logLevel = 7;
window.logRegex = /^((?!(emit)).)*$/g

export default {
    install(Vue) {
        Vue.prototype.$logger = {
            critical,
            alert,
            err,
            warn,
            success,
            info,
            debug,
        };
    },
    critical,
    alert,
    err,
    warn,
    success,
    info,
    debug,
};