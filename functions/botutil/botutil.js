

function getTimeAgo({interval = 'week'}) {
    switch (interval) {
        case 'week':
            return Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
        case 'day':
            return Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
        case 'hour':
            return Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
        case 'month':
            return Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
        case 'year':
            return Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
        default: 
            return 0;
    }
}

exports.getTimeAgo = getTimeAgo


