namespace my.rag;

using { managed } from '@sap/cds/common';

@cds.persistence.name: 'MY_RAG_DOCS'
entity Docs : managed {
  key ID        : UUID;
  project       : String(100);
  customer      : String(100);
  docType       : String(50);
  title         : String(255);
  tags          : String(500);
  source        : String(1000);
  chunkId       : String(50);
  text          : LargeString;
  fileHash      : String(64);
  embedding     : Vector(1536);
}

@cds.persistence.name: 'MY_RAG_LOGS'
entity Logs : managed {
  key ID          : UUID;
  timestamp       : Timestamp;
  type            : String(20);
  queryText       : LargeString;
  promptFinal     : LargeString;
  responseFinal   : LargeString;
  details         : LargeString;
  userName        : String(100);
  durationMs      : Integer;
}
