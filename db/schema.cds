namespace my.rag;

using { managed } from '@sap/cds/common';

entity Documents : managed {
  key ID       : UUID;
  fileHash     : String(100);
  mimeType     : String(50);
  content      : LargeString;
  docs         : Composition of many Docs on docs.document = $self;
}

entity Docs : managed {
  key ID        : UUID;
  document      : Association to Documents;
  project       : String(100);
  customer      : String(100);
  docType       : String(50);
  title         : String(255);
  tags          : String(500);
  source        : String(1000);
  chunkId       : String(100);
  text          : LargeString;
  fileHash      : String(100);
  embedding     : Vector(1536);
}

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
  username        : String(100);
  email           : String(100);
}
