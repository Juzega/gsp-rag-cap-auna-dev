using {my.rag as schema} from '../db/schema';

@protocol: ['rest', 'odata-v4']
@path: 'rag-api'
@(requires: 'any')
service RagService @(impl: 'srv/rag-service.js') {

  entity Documents as projection on schema.Documents
    excluding { content, docs };

  entity Docs as projection on schema.Docs
    excluding { embedding };

  entity Logs as projection on schema.Logs;

  @open type dynamic {};
  @open type ResponseService {
    oAuditResponse : { idtransaccion: String; code: Integer; message: String; };
    oDataResponse  : dynamic;
  };

  action ragSearch(
    consulta : String,
    username : String,
    email    : String
  ) returns ResponseService;

  action insertDocument(
    fileHash   : String,
    mimeType   : String,
    content    : LargeString
  ) returns ResponseService;

  action insertDoc(
    title    : String,
    text     : String,
    project  : String,
    customer : String,
    docType  : String,
    fileHash : String,
    chunkId  : String,
    source   : String,
    username : String,
    email    : String
  ) returns ResponseService;

  function getDocument(fileHash: String) returns ResponseService;
}
