function compareValues(a, b) {
    if (a === null || b === null) {
        if (a === b) {
            return 0;
        }
        return a === null ? -1 : 1;
    }

    if (typeof a === 'boolean' || typeof b === 'boolean') {
        if (typeof a === typeof b) {
            return a === b ? 0 : (a ? 1 : -1);
        }
        return typeof a === 'boolean' ? -1 : 1;
    }

    if (typeof a === 'number' || typeof b === 'number') {
        if (typeof a === typeof b) {
            return a === b ? 0 : (a < b ? -1 : 1);
        }
        return typeof a === 'number' ? -1 : 1;
    }

    if (typeof a === 'string' || typeof b === 'string') {
        if (typeof a === typeof b) {
            if (a.toLowerCase() === b.toLowerCase()) {
                return a < b ? -1 : 1;
            }
            return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
        }
        return typeof a === 'string' ? -1 : 1;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
        if (Array.isArray(a) && Array.isArray(b)) {
            for (let i = 0; i < Math.min(a.length, b.length); i++) {
                const result = compareValues(a[i], b[i]);
                if (result !== 0) {
                    return result;
                }
            }
            return a.length === b.length ? 0 : (a.length < b.length ? -1 : 1);
        }
        return Array.isArray(a) ? -1 : 1;
    }

    if (typeof a === 'object' || typeof b === 'object') {
        const aKeys = Object.keys(a).sort();
        const bKeys = Object.keys(b).sort();

        for (let i = 0; i < Math.min(aKeys.length, bKeys.length); i++) {
            const result = compareValues(aKeys[i], bKeys[i]);
            if (result !== 0) {
                return result;
            }
            const valueResult = compareValues(a[aKeys[i]], b[bKeys[i]]);
            if (valueResult !== 0) {
                return valueResult;
            }
        }

        return aKeys.length === bKeys.length ? 0 : (aKeys.length < bKeys.length ? -1 : 1);
    }

    return 0;
}

module.exports = compareValues;
