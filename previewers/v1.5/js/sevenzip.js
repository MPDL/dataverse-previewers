import { inspectSevenZipUrl } from "../lib/sevenzip/sevenzip.js";

const MAX_ENTRIES_EXPANDED = 2000;
let entries = [];

$(document).ready(function () {
    startPreview(false);
});

window.translateBaseHtmlPage = function translateBaseHtmlPage() {
    var sevenZipPreviewText = $.i18n("sevenZipPreviewText");
    $(".sevenZipPreviewText").text(sevenZipPreviewText);
};

window.writeContent = async function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    await readSevenZip(fileUrl);
};

async function readSevenZip(fileUrl) {
    try {
        if (fileUrl.startsWith("https://localhost")) {
            fileUrl = fileUrl.replace("https://localhost", "http://localhost");
        }

        const inspectionResult = await inspectSevenZipUrl(fileUrl);
        entries = inspectionResult.entries || [];

        if (entries.length) {
            createTree(buildTreeData(entries));
        }
    } catch (err) {
        const errorMsg = document.createTextNode(
            "7zip file structure could not be read (" + err + ")."
        );
        document.getElementById("sevenzip-preview").appendChild(errorMsg);
        console.log(err);
    } finally {
        const throbber = document.getElementById("throbber");
        if (throbber) {
            throbber.parentNode.removeChild(throbber);
        }
    }
}

function buildTreeData(currentEntries) {
    const rootList = [];
    const folderNodeMap = new Map();
    const listIsLarge = currentEntries.length > MAX_ENTRIES_EXPANDED;

    function ensureFolder(path, title, parentChildren) {
        if (folderNodeMap.has(path)) {
            return folderNodeMap.get(path);
        }
        const node = {
            title: title,
            folder: true,
            unselectable: true,
            expanded: !listIsLarge,
            lazy: listIsLarge,
            filename: path,
            children: []
        };
        folderNodeMap.set(path, node);
        parentChildren.push(node);
        return node;
    }

    currentEntries.forEach(function (entry) {
        const originalPath = entry.path || entry.name || "";
        const normalizedPath = originalPath.replace(/[\\/]+$/, "");
        const segments = normalizedPath.split(/[\\/]+/).filter(Boolean);
        if (!segments.length) {
            return;
        }

        let parentPath = "";
        let parentChildren = rootList;

        segments.forEach(function (segment, segmentIndex) {
            const isLast = segmentIndex === segments.length - 1;
            const nodePath = parentPath ? parentPath + "/" + segment : segment;

            if (isLast && !entry.isDirectory) {
                const treeObject = {
                    title: segment,
                    folder: false,
                    unselectable: true,
                    size: formatEntrySize(entry.size),
                    filename: originalPath
                };
                parentChildren.push(treeObject);
                return;
            }

            const folderNode = ensureFolder(nodePath, segment, parentChildren);
            parentChildren = folderNode.children;
            parentPath = nodePath;
        });
    });

    return rootList;
}

function formatEntrySize(size) {
    if (size === null || size === undefined) {
        return "";
    }

    if (typeof size === "bigint") {
        if (size > BigInt(Number.MAX_SAFE_INTEGER)) {
            return size.toString() + " B";
        }
        return fileSizeSI(Number(size));
    }

    if (typeof size === "number" && Number.isFinite(size)) {
        return fileSizeSI(size);
    }

    return "";
}

function fileSizeSI(bytes) {
    if (bytes === 0) {
        return "0 Bytes";
    }
    const units = ["Bytes", "kB", "MB", "GB", "TB", "PB", "EB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
    const value = bytes / Math.pow(1000, exponent);
    return value.toFixed(2) + " " + units[exponent];
}

function createTree(dataStructure) {
    $("#treegrid").fancytree({
        extensions: ["table", "glyph"],
        checkbox: false,
        table: {
            indentation: 20,
            nodeColumnIdx: 0
        },
        source: dataStructure,
        tooltip: function (event, data) {
            return data.node.data.filename;
        },
        glyph: {
            preset: "bootstrap3"
        },
        beforeActivate: function () {
            return false;
        },
        renderColumns: function (event, data) {
            var node = data.node;
            var $tdList = $(node.tr).find(">td");

            if (!node.folder) {
                $tdList.eq(1).text(node.data.size || "");
            }
        }
    });
}
