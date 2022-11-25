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
    get_pdf(fileUrl);
}

async function get_pdf(fileUrl) {

    try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const frame = document.getElementById('if');
        frame.setAttribute('src', url);
    }
    finally {

        const throbber = document.getElementById("throbber");
        if (throbber)
            throbber.parentNode.removeChild(throbber);
    }
}
