/**
    * build date (moment) in utc from given local date.
    * use .format() to create string representation YYYY-MM-DDThh:mm:ssZ
    */
   function utc_date_from_local(year, month, day) {
    return moment(year + '-' + month + '-' + day, "YYYY-MM-DD").utc();
}

/**
 * round given value using the multiple basis 
 */
function mround(value, multiple) {
    if (Math.abs(multiple) < Number.EPSILON) return value;

    let p = Math.round(value / multiple);

    return Math.trunc(p) * multiple;
}

function human_readable_filesize(bytes, onlyBytesUnit = true, bytesMultiple = 1, decimals = 1) {
    let k = 1024.0;
    let m = k * 1024.0;
    let g = m * 1024.0;
    let t = g * 1024.0;

    if (bytesMultiple != 1) bytes = Math.trunc(mround(bytes, bytesMultiple));

    if (bytes < k) { if (onlyBytesUnit) return bytes; else return bytes + ' b'; }
    else if (bytes >= k && bytes < m) return (bytes / k).toFixed(decimals) + ' Kb';
    else if (bytes >= m && bytes < g) return (bytes / m).toFixed(decimals) + ' Mb';
    else if (bytes >= g && bytes < t) return (bytes / g).toFixed(decimals) + ' Gb';
    else return (bytes / t).toFixed(decimals);
}