$(document).ready(function() {
    startPreview(false);
});

function translateBaseHtmlPage() {
    var pdfPreviewText = $.i18n( "pdfPreviewText" );
    $( '.pdfPreviewText' ).text( pdfPreviewText );
}

function writeContent(fileUrl, file, title, authors) {
    if (fileUrl.startsWith('https://localhost')) {
        fileUrl = fileUrl.replace('https://localhost', 'http://localhost');
    }
    addStandardPreviewHeader(file, title, authors);
    $(".preview").append($("<iframe/>").attr("src","fileUrl").attr("width","100%").attr("height", "100%"));
}
