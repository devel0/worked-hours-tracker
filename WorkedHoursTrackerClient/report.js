//-------------------------------------------------------------------------
// report
//-------------------------------------------------------------------------
$('.js-report-btn').click(function (e) {
    var link = document.createElement('a');
    link.href = urlbase + "/Api/DownloadReport?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);
    //link.download = "report.xlsx";
    link.click();
});