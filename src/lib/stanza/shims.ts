export const getDummyXMLDomDocument = () => {
    if(typeof globalThis.DOMImplementation !== 'undefined'){
        return document.implementation.createDocument(null, null)
    } else {
        const XMLImplementation = require("@xmldom/xmldom").DOMImplementation
        return new XMLImplementation().createDocument(null, null)
    }
}

export function getXmlSerializer() :XMLSerializer {
    if(typeof globalThis.XMLSerializer !== 'undefined'){
        return new XMLSerializer()
    } else {
        const XMLSerializer = require('@xmldom/xmldom').XMLSerializer
        return new XMLSerializer()
    }
}

export function getXMLParser() : DOMParser {
    if(typeof globalThis.DOMParser !== 'undefined'){
        return new DOMParser()
    } else {
        const DOMParser = require('@xmldom/xmldom').DOMParser
        return new DOMParser()
    }
}