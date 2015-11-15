/**
 * Created by grahamturk on 10/28/15.
 * Custom error type for invalid mongoose queries.
 */

var NullDocumentError = function(message) {
    this.message = message;
    this.name = "NullDocumentError";
    Error.captureStackTrace(this, NullDocumentError);
}
NullDocumentError.prototype = Object.create(Error.prototype);
NullDocumentError.prototype.constructor = NullDocumentError;

module.exports = NullDocumentError;
